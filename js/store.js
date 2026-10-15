import { subjectsApi, classesApi, profileApi } from './api.js';
import { DEFAULT_VISIBLE_DAYS, STATUS } from './constants.js';
import { addDays, fromDateKey, toDateKey, toMonthKey } from './utils.js';

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const state = {
  subjects: [],
  classes: [],
  month: startOfMonth(new Date()),
  visibleDays: [...DEFAULT_VISIBLE_DAYS], // ustawienie dla wszystkich miesięcy (0 = niedziela)
  monthOverrides: {},                     // wyjątki: { "2026-10": [1, 2, 3] }
};
const listeners = new Set();

export const getState = () => state;
export const subscribe = (fn) => listeners.add(fn);
const notify = () => listeners.forEach((fn) => fn(state));

// --- Widoczne dni tygodnia ---
export const hasMonthOverride = (s = state, month = s.month) => toMonthKey(month) in s.monthOverrides;
export const visibleDaysOf = (s = state, month = s.month) => s.monthOverrides[toMonthKey(month)] ?? s.visibleDays;

export async function setVisibleDays(days, { allMonths }) {
  if (allMonths) {
    state.visibleDays = days;
    state.monthOverrides = {}; // ustawienie ogólne zastępuje wyjątki
  } else {
    state.monthOverrides = { ...state.monthOverrides, [toMonthKey(state.month)]: days };
  }
  notify(); // natychmiastowe odświeżenie kalendarza
  await profileApi.updateSettings({ visibleDays: state.visibleDays, monthOverrides: state.monthOverrides });
}

// --- Zajęcia jednego dnia (posortowane po godzinie) ---
export const classesOfDay = (dateKey) =>
  state.classes
    .filter((c) => c.date === dateKey)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

// --- Dane ---
export async function load() {
  const [subjects, classes, settings] = await Promise.all([
    subjectsApi.list(),
    classesApi.list(),
    profileApi.getSettings(),
  ]);

  state.subjects = subjects;
  state.classes = classes;
  state.visibleDays = settings?.visible_days ?? [...DEFAULT_VISIBLE_DAYS];
  state.monthOverrides = settings?.month_overrides ?? {};
  notify();
}

export function shiftMonth(delta) {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1);
  notify();
}

export function goToToday() {
  state.month = startOfMonth(new Date());
  notify();
}

export async function addSubject(name, color) {
  state.subjects.push(await subjectsApi.add(name, color));
  notify();
}

export async function removeSubject(id) {
  await subjectsApi.remove(id);
  state.subjects = state.subjects.filter((s) => s.id !== id);
  state.classes = state.classes.filter((c) => c.subject_id !== id);
  notify();
}

export async function addClassSeries({ subjectId, date, start, end, repeatWeeks }) {
  const first = fromDateKey(date);
  const rows = Array.from({ length: repeatWeeks + 1 }, (_, week) => ({
    subject_id: subjectId,
    date: toDateKey(addDays(first, week * 7)),
    start_time: start,
    end_time: end,
    status: STATUS.PLANNED,
  }));
  state.classes.push(...(await classesApi.addMany(rows)));
  notify();
}

export async function setClassStatus(id, status) {
  await classesApi.setStatus(id, status);
  state.classes.find((c) => c.id === id).status = status;
  notify();
}

export async function removeClass(id) {
  await classesApi.remove(id);
  state.classes = state.classes.filter((c) => c.id !== id);
  notify();
}

export function attendanceStats(subjectId) {
  const mine = state.classes.filter((c) => c.subject_id === subjectId);
  const count = (status) => mine.filter((c) => c.status === status).length;
  const present = count(STATUS.PRESENT);
  const absent = count(STATUS.ABSENT);
  const held = present + absent;
  // Procent liczą tylko zajęcia z zaznaczoną obecnością lub nieobecnością.
  // Odwołane, zaplanowane i bez sprawdzania obecności nie wpływają na wynik.
  return {
    total: mine.length,
    present,
    absent,
    cancelled: count(STATUS.CANCELLED),
    noCheck: count(STATUS.NO_CHECK),
    planned: count(STATUS.PLANNED),
    percent: held ? Math.round((present / held) * 100) : null,
  };
}
