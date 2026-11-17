/** M5 ExportBuffer: a bounded buffer per kind of telemetry; the oldest item is dropped (OBS-E-1). */
export class ExportBuffer<T> {
  readonly limit: number;
  #items: T[] = [];
  #delivering = false;

  constructor(limit: number) {
    this.limit = limit;
  }

  /** A copy of the items that wait for delivery, oldest first. */
  get items(): T[] {
    return [...this.#items];
  }

  add(item: T): void {
    if (this.#items.length >= this.limit) this.#items.shift();
    this.#items.push(item);
  }

  /**
   * Sends all items. On success the sent items are removed (items added meanwhile stay); on a
   * failure, or when `send` gives no answer within `timeoutMs`, all items stay. Returns whether
   * the delivery succeeded. Never throws; a delivery that is still running is not started twice.
   */
  async deliver(
    send: (items: T[], signal: AbortSignal) => Promise<void>,
    timeoutMs: number,
  ): Promise<boolean> {
    if (this.#delivering) return false;
    const sent = this.items;
    if (sent.length === 0) return true;
    this.#delivering = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await Promise.race([
        send(sent, controller.signal),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () =>
            reject(new Error("telemetry export timed out")),
          );
        }),
      ]);
      const gone = new Set(sent);
      this.#items = this.#items.filter((item) => !gone.has(item));
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
      this.#delivering = false;
    }
  }
}
