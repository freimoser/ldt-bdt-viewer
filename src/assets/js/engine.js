/**
 * Verbindung zur Verarbeitung: bevorzugt im Web Worker, sonst (z. B. sehr alte Browser) im Hauptthread.
 */
export class Engine {
  constructor(base) {
    this.base = base;
    this.seq = 0;
    this.pending = new Map();
    this.onProgress = () => {};
    this.mode = "worker";
    try {
      this.worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
      this.worker.onmessage = (e) => this.receive(e.data);
      this.worker.onerror = () => this.fallback();
    } catch {
      this.fallback();
    }
  }

  async fallback() {
    if (this.local) return;
    this.mode = "main";
    this.worker = null;
    const { createHandler } = await import("./engine-core.js");
    this.local = createHandler((msg) => this.receive(msg), new URL("../data/felder.json", import.meta.url).href);
    // offene Anfragen erneut senden
    for (const [id, p] of this.pending) this.dispatch(p.msg, []);
  }

  receive(msg) {
    if (msg.type === "progress") { this.onProgress(msg); return; }
    const p = this.pending.get(msg.id);
    if (!p) return;
    this.pending.delete(msg.id);
    if (msg.ok) p.resolve(msg.result); else p.reject(new Error(msg.error));
  }

  dispatch(msg, transfer) {
    if (this.worker) this.worker.postMessage(msg, transfer || []);
    else if (this.local) {
      // Hauptthread: Puffer nicht übertragen, sondern direkt verwenden
      setTimeout(async () => {
        try { const { result } = await this.local(msg); this.receive({ id: msg.id, ok: true, result }); }
        catch (err) { this.receive({ id: msg.id, ok: false, error: String(err.message || err) }); }
      }, 0);
    }
  }

  call(type, data = {}, transfer = []) {
    const id = ++this.seq;
    const msg = { id, type, ...data };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, msg });
      this.dispatch(msg, transfer);
    });
  }
}
