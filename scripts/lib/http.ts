import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

/** HTTP request gateway whose AbortSignal follows fiber interruption. */
export class Http extends Context.Service<
  Http,
  {
    readonly request: (
      url: string,
      options?: RequestInit
    ) => Effect.Effect<Response, unknown>
  }
>()("termbridge/scripts/Http") {}
/** Fetch implementation for package consumer checks. */
export const layer = Layer.succeed(Http, {
  request: (url: string, options?: RequestInit) =>
    Effect.tryPromise((signal) => fetch(url, { ...options, signal })).pipe(
      Effect.timeout("5 seconds")
    ),
})
/**
 * Request a resource through the supplied HTTP gateway.
 *
 * @param url - Absolute resource URL.
 * @param options - Fetch request options, excluding cancellation ownership.
 * @returns An interruptible effect yielding the HTTP response.
 */
export const request = (url: string, options?: RequestInit) =>
  Http.use((http) => http.request(url, options))
