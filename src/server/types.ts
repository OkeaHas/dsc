export interface DalResult<T> {
  data: T | null;
  error: Error | null;
}

export function dalOk<T>(data: T): DalResult<T> {
  return { data, error: null };
}

export function dalFail(err: unknown, fallback: string): DalResult<never> {
  const error =
    err instanceof Error
      ? err
      : new Error(typeof err === "string" && err ? err : fallback);
  return { data: null, error };
}

/**
 * Supabase mengembalikan kode PGRST116 untuk `.single()` yang tidak menemukan
 * baris. Kode itu BUKAN error server — itu 404. Tanpa pemetaan ini, GET/PUT/
 * DELETE ke id yang tidak ada akan berbalas 500.
 */
export function isNotFoundError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST116") return true;
  return /0 rows|no rows|JSON object requested/i.test(error.message ?? "");
}

/** Kode 22P02 = invalid text representation (biasanya UUID ngawur). */
export function isInvalidInputError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}
