"use client";

import { useState, type FormEvent } from "react";
import { IconAlert, IconCheck, IconSend } from "@/components/icons";
import { Field, inputClass } from "@/components/forms/attendance-form";
import { callApi } from "@/lib/api-client";
import { FEEDBACK } from "@/lib/site-content";
import type { Feedback } from "@/lib/types";

const MAX_MESSAGE = 5000;

/**
 * Baris emoji di atas kotak pesan.
 *
 * Fungsinya nyata, bukan hiasan: menekan salah satu emoji akan menyisipkan
 * karakternya ke dalam pesan, dan emoji yang sedang dipilih diberi cincin.
 * Jadi pengguna yang tidak mau menulis panjang tetap bisa mengirim kesan dalam
 * satu sentuhan.
 */
const EMOJI = ["😍", "🙂", "😐", "🙁", "😡"] as const;

/**
 * Form kritik & saran (publik).
 *
 * Nama dan email opsional — tanpa nama, server menyimpannya sebagai
 * "Anonymous". Semua field dikendalikan state supaya emoji bisa disisipkan ke
 * posisi akhir teks dan penghitung karakter akurat.
 */
export function FeedbackForm() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");
  const [emojiAktif, setEmojiAktif] = useState<string | null>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Feedback | null>(null);

  function pilihEmoji(emoji: string) {
    setEmojiAktif((sebelum) => (sebelum === emoji ? null : emoji));
    setPesan((sebelum) => {
      const bersih = sebelum.trimEnd();
      // Ganti emoji yang sudah ada di depan, jangan menumpuk.
      const tanpaEmojiLama = EMOJI.reduce(
        (teks, e) => (teks.startsWith(e) ? teks.slice(e.length).trimStart() : teks),
        bersih,
      );
      const baru = `${emoji}${tanpaEmojiLama ? ` ${tanpaEmojiLama}` : ""}`;
      return baru.slice(0, MAX_MESSAGE);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    const result = await callApi<Feedback>("/api/feedback", {
      method: "POST",
      body: {
        sender_name: nama,
        sender_email: email,
        message: pesan,
      },
    });

    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSent(result.data);
    setNama("");
    setEmail("");
    setPesan("");
    setEmojiAktif(null);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-success/40 bg-success/10 px-5 py-7 sm:px-7">
        <p className="flex items-center gap-2 text-base font-bold text-success">
          <IconCheck className="size-5" />
          Pesan terkirim
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Terima kasih! Masukanmu sudah masuk kotak kami dan akan dibaca pengurus.
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="dsc-tap mt-5 inline-flex items-center rounded-full border border-border bg-surface px-5 text-sm font-bold transition-colors hover:border-brand hover:text-brand"
        >
          Kirim masukan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <fieldset className="min-w-0">
        <legend className="text-sm font-bold text-foreground">
          Gimana kesanmu selama ikut DSC?
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {EMOJI.map((emoji) => {
            const aktif = emojiAktif === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => pilihEmoji(emoji)}
                aria-pressed={aktif}
                aria-label={`Tandai kesan ${emoji}`}
                className={`grid size-11 place-items-center rounded-full border text-xl transition-all ${
                  aktif
                    ? "scale-110 border-accent bg-accent-soft ring-2 ring-accent/40"
                    : "border-border bg-surface hover:border-accent"
                }`}
              >
                <span aria-hidden>{emoji}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Kesan & saran" htmlFor="message" required>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={MAX_MESSAGE}
          value={pesan}
          onChange={(event) => setPesan(event.target.value)}
          placeholder={FEEDBACK.placeholder}
          className={`${inputClass} min-h-36 resize-y py-3 leading-relaxed`}
        />
      </Field>

      <p className="-mt-3 text-right text-xs tabular-nums text-muted">
        {pesan.length}/{MAX_MESSAGE}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama" htmlFor="sender_name" hint="Opsional">
          <input
            id="sender_name"
            name="sender_name"
            type="text"
            maxLength={255}
            autoComplete="name"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Kosongkan untuk anonim"
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="sender_email" hint="Opsional">
          <input
            id="sender_email"
            name="sender_email"
            type="email"
            maxLength={255}
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Kalau mau dibalas"
            className={inputClass}
          />
        </Field>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="dsc-btn-primary dsc-tap inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
      >
        {pending ? (
          "Mengirim..."
        ) : (
          <>
            {FEEDBACK.tombol}
            <IconSend className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
