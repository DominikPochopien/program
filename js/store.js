import { subjectsApi, classesApi } from './api.js';
import { STATUS } from './constants.js';
import { addDays, fromDateKey, toDateKey } from './utils.js';

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const state = { subjects: [], classes: [], month: startOfMonth(new Date()) };
const listeners = new Set();

export const getState = () => state;
export const subscribe = (fn) => listeners.add(fn);
const notify = () => listeners.forEach((fn) => fn(state));

export async function load() {
  [state.subjects, state.classes] = await Promise.all([subjectsApi.list(), classesApi.list()]);
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
  return {
    present,
    absent,
    cancelled: count(STATUS.CANCELLED),
    planned: count(STATUS.PLANNED),
    percent: held ? Math.round((present / held) * 100) : null,
  };
}
