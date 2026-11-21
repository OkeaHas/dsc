import { NextResponse } from "next/server";

/**
 * Bentuk response standar seluruh API DSC:
 * { status, message, data }
 */

/** Response BERHASIL. */
export function response<T>(statusCode: number, message: string, data?: T | null) {
  return NextResponse.json(
    {
      status: true,
      message,
      data: data ?? null,
    },
    { status: statusCode },
  );
}

/** Response GAGAL. */
export function errorResponse(
  statusCode: number,
  message: string,
  headers?: Record<string, string>,
) {
  return NextResponse.json(
    {
      status: false,
      message,
      data: null,
    },
    { status: statusCode, headers },
  );
}

/**
 * Bungkus error tak terduga. Pesan asli dari Postgres tetap diteruskan saat
 * mode development supaya gampang di-debug, tapi di production ditutup dengan
 * pesan umum agar struktur tabel tidak bocor ke publik.
 */
export function unexpectedError(error: unknown, fallback = "Terjadi kesalahan pada server") {
  if (process.env.NODE_ENV !== "production" && error instanceof Error && error.message) {
    return errorResponse(500, error.message);
  }
  return errorResponse(500, fallback);
}
