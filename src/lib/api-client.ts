import type { ApiEnvelope } from "./types";

/**
 * Pemanggil API dari sisi browser (dipakai form absen & feedback).
 *
 * Selalu mengembalikan objek hasil, tidak pernah melempar error tak tertangani,
 * supaya komponen form cukup melakukan `if (!result.ok)`.
 */

export type ApiCallResult<T> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string; status: number };

export async function callApi<T>(
  path: string,
  options: { method?: string; body?: unknown; timeoutMs?: number } = {},
): Promise<ApiCallResult<T>> {
  const { method = "GET", body, timeoutMs = 15_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();

    let payload: ApiEnvelope<T> | null = null;
    try {
      payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : null;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || payload.status !== true) {
      return {
        ok: false,
        status: response.status,
        message:
          payload?.message ??
          `Permintaan gagal (HTTP ${response.status}). Coba lagi sebentar lagi.`,
      };
    }

    return {
      ok: true,
      data: payload.data as T,
      message: payload.message,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        message: "Koneksi terlalu lama. Periksa jaringanmu lalu coba lagi.",
      };
    }

    return {
      ok: false,
      status: 0,
      message: "Tidak bisa menghubungi server. Periksa koneksi internetmu.",
    };
  } finally {
    clearTimeout(timer);
  }
}
