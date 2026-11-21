"use client";

import { useState, type FormEvent } from "react";
import { IconAlert, IconCheck } from "@/components/icons";
import { callApi } from "@/lib/api-client";
import type { Attendance } from "@/lib/types";

/**
 * Form absen peserta kegiatan.
 *
 * Dipakai di halaman detail kegiatan dan hanya muncul kalau pendaftarannya
 * masih dibuka. Setelah sukses, form diganti kartu konfirmasi — lebih jelas
 * daripada sekadar menampilkan teks kecil.
 */
export function AttendanceForm({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Attendance | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    setError(null);

    const result = await callApi<Attendance>("/api/attendance", {
      method: "POST",
      body: {
        event_id: eventId,
        participant_name: data.get("participant_name"),
        participant_email: data.get("participant_email"),
        institution: data.get("institution"),
      },
    });

    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDone(result.data);
    form.reset();
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 px-4 py-5 sm:px-6">
        <p className="flex items-center gap-2 text-base font-bold text-success">
          <IconCheck className="size-5" />
          Absen tercatat
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Terima kasih, <strong className="text-foreground">{done.participant_name}</strong>.
          Kehadiranmu di <strong className="text-foreground">{eventTitle}</strong> sudah
          kami simpan dengan email {done.participant_email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="participant_name" required>
          <input
            id="participant_name"
            name="participant_name"
            type="text"
            required
            maxLength={255}
            autoComplete="name"
            placeholder="Nama kamu"
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="participant_email" required>
          <input
            id="participant_email"
            name="participant_email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            inputMode="email"
            placeholder="nama@kampus.ac.id"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Asal kampus / instansi"
        htmlFor="institution"
        hint="Opsional"
      >
        <input
          id="institution"
          name="institution"
          type="text"
          maxLength={255}
          autoComplete="organization"
          placeholder="Contoh: Universitas Balikpapan"
          className={inputClass}
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-3 text-sm text-danger"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
      >
        {pending ? "Mengirim…" : "Daftar kehadiran"}
      </button>

      <p className="text-xs leading-relaxed text-muted">
        Satu email hanya bisa absen sekali per kegiatan.
      </p>
    </form>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-xl border border-border bg-surface px-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/25 sm:text-sm";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
