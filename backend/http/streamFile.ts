import type { Readable } from "node:stream";
import { Readable as NodeReadable } from "node:stream";

/**
 * Convert a Node readable into a Web ReadableStream for NextResponse,
 * destroying the source if the client disconnects.
 */
export function toWebFileStream(stream: Readable, signal?: AbortSignal): ReadableStream<Uint8Array> {
  const web = NodeReadable.toWeb(stream) as ReadableStream<Uint8Array>;
  if (!signal) return web;

  const onAbort = () => {
    stream.destroy();
  };
  if (signal.aborted) {
    onAbort();
    return web;
  }
  signal.addEventListener("abort", onAbort, { once: true });
  return web;
}
