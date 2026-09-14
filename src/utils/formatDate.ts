/**
 * Standar tampilan tanggal di seluruh aplikasi:
 *   - hanya tanggal          -> dd-mm-yyyy        (contoh: 19-10-2000)
 *   - tanggal + jam          -> dd-mm-yyyy hh:mm  (contoh: 19-10-2000 10:10)
 *   - hanya jam              -> hh:mm             (contoh: 10:10)
 *
 * Jam TIDAK dipaksakan muncul: format tanggal+jam hanya dipakai kalau datanya
 * memang menyimpan waktu. Detik sengaja tidak ditampilkan.
 *
 * CATATAN: formatDateToYYYYMMDD dipakai untuk nilai input tanggal & param query
 * API (flatpickr `Y-m-d` / filter Laravel), BUKAN untuk tampilan. Jangan ikut
 * diubah ke dd-mm-yyyy.
 */

const pad = (num: number) => String(num).padStart(2, "0");

const parseLocal = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  // 'YYYY-MM-DD' tanpa zona waktu: parse sebagai lokal supaya tidak bergeser.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  return new Date(normalized);
};

/** True kalau nilai ini benar-benar membawa informasi waktu. */
const hasTimeComponent = (value: string | Date): boolean => {
  if (value instanceof Date) return true;
  return value.includes("T") || value.includes(" ");
};

const build = (d: Date, withTime: boolean): string => {
  const datePart = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  if (!withTime) return datePart;
  return `${datePart} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isValid = (d: Date): boolean => !isNaN(d.getTime());

/**
 * Tampilan tanggal otomatis: dd-mm-yyyy, atau dd-mm-yyyy hh:mm kalau datanya
 * membawa waktu. Fallback dipakai saat nilai kosong; nilai rusak tampil apa ada.
 */
export const formatDateTimeDisplay = (
  value: string | Date | null | undefined,
  fallback: string = "-"
): string => {
  if (value === null || value === undefined || value === "") return fallback;
  const d = parseLocal(value);
  if (!isValid(d)) return typeof value === "string" ? value : fallback;
  return build(d, hasTimeComponent(value));
};

/** Paksa hanya tanggal: dd-mm-yyyy, walau datanya menyimpan waktu. */
export const formatDateDisplay = (
  value: string | Date | null | undefined,
  fallback: string = "-"
): string => {
  if (value === null || value === undefined || value === "") return fallback;
  const d = parseLocal(value);
  if (!isValid(d)) return typeof value === "string" ? value : fallback;
  return build(d, false);
};

/**
 * Hanya jam: hh:mm. Menerima jam murni dari database ("07:15:00"), "7:15",
 * maupun timestamp lengkap ("2026-08-17T07:15:30.000000Z").
 */
export const formatClockTime = (
  value: string | Date | null | undefined,
  fallback: string = "--:--"
): string => {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string") {
    const timeOnly = /^(\d{1,2}):(\d{2})(:\d{2})?$/.exec(value.trim());
    if (timeOnly) return `${pad(Number(timeOnly[1]))}:${timeOnly[2]}`;
  }

  const d = parseLocal(value);
  if (!isValid(d)) return typeof value === "string" ? value : fallback;
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Formats a Date object to YYYY-MM-DD string using local time.
 * This avoids timezone shift issues caused by toISOString().
 */
export const formatDateToYYYYMMDD = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
