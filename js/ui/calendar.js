import { MOBILE_NAME_LIMIT, WEEKDAY_JS_INDEXES, WEEKDAYS } from '../constants.js';
import { visibleDaysOf } from '../store.js';
import { addDays, formatRange, isMobile, toDateKey, truncate } from '../utils.js';

// Wszystkie dni siatki miesiąca (pełne tygodnie od poniedziałku do niedzieli).
function monthGridDays(month) {
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;
  const start = addDays(month, -offset);
  return Array.from({ length: total }, (_, i) => addDays(start, i));
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// Kafelek nie ma własnej obsługi kliknięcia: kliknięcie "przechodzi" do dnia i otwiera panel dnia.
function createChip(cls, subject) {
  const label = isMobile() ? truncate(subject.name, MOBILE_NAME_LIMIT) : subject.name;
  const chip = createElement('div', `chip chip--${cls.status}`, label);
  chip.title = `${formatRange(cls)} ${subject.name}`;
  chip.style.setProperty('--color', subject.color);
  return chip;
}

function createDay(date, month, classesOfDay, subjects, handlers) {
  const key = toDateKey(date);
  const classNames = [
    'day',
    date.getMonth() !== month.getMonth() && 'day--outside',
    key === toDateKey(new Date()) && 'day--today',
  ];
  const day = createElement('div', classNames.filter(Boolean).join(' '));
  day.append(createElement('div', 'day__number', date.getDate()));
  classesOfDay
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .forEach((cls) => {
      const subject = subjects.find((s) => s.id === cls.subject_id);
      if (subject) day.append(createChip(cls, subject));
    });
  day.addEventListener('click', () => handlers.onDayClick(key));
  return day;
}

export function renderCalendar({ titleEl, gridEl }, state, handlers) {
  titleEl.textContent = state.month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const byDate = new Map();
  state.classes.forEach((c) => byDate.set(c.date, [...(byDate.get(c.date) ?? []), c]));

  // Dni tygodnia widoczne w tym miesiącu (ustawienie ogólne albo wyjątek dla miesiąca)
  const allowedDays = visibleDaysOf(state);

  const headers = WEEKDAYS
    .filter((_, i) => allowedDays.includes(WEEKDAY_JS_INDEXES[i]))
    .map((name) => createElement('div', 'weekday', name));

  const days = monthGridDays(state.month)
    .filter((date) => allowedDays.includes(date.getDay()))
    .map((date) => createDay(date, state.month, byDate.get(toDateKey(date)) ?? [], state.subjects, handlers));

  gridEl.style.gridTemplateColumns = `repeat(${headers.length}, minmax(0, 1fr))`;
  gridEl.replaceChildren(...headers, ...days);
}
