import { MOBILE_MAX_WIDTH_PX } from './constants.js';

// --- DOM ---
export const $ = (selector, root = document) => root.querySelector(selector);

// --- Telefon / komputer ---
export const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
export const isMobile = () => mobileQuery.matches;

// --- Tekst ---
export const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// --- Daty ---
export const pad = (n) => String(n).padStart(2, '0');
export const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toMonthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const fromDateKey = (key) => new Date(`${key}T00:00:00`);

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- Godziny ---
export function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + minutes) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export const formatRange = (c) => (c.end_time ? `${c.start_time}–${c.end_time}` : c.start_time);
