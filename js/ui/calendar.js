import { WEEKDAYS } from '../constants.js';
import { addDays, formatRange, toDateKey } from '../utils.js';

function visibleDays(month) {
  const offset = (month.getDay() + 6) % 7; // tydzień zaczyna się od poniedziałku
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

function createChip(cls, subject, onClick) {
  const chip = createElement('div', `chip chip--${cls.status}`);
  
  // Usunięto stały przedrostek STATUS_ICON. Zostaje sama nazwa przedmiotu.
  chip.innerHTML = `<span class="chip-time">${formatRange(cls)}</span> ${subject.name}`;
  
  chip.style.setProperty('--color', subject.color);
  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick(cls.id);
  });
  
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
      if (subject) day.append(createChip(cls, subject, handlers.onClassClick));
    });
  day.addEventListener('click', () => handlers.onDayClick(key));
  return day;
}

export function renderCalendar({ titleEl, gridEl }, state, handlers) {
  titleEl.textContent = state.month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const byDate = new Map();
  state.classes.forEach((c) => byDate.set(c.date, [...(byDate.get(c.date) ?? []), c]));

  const headers = WEEKDAYS.map((name) => createElement('div', 'weekday', name));
  const days = visibleDays(state.month).map((date) =>
    createDay(date, state.month, byDate.get(toDateKey(date)) ?? [], state.subjects, handlers),
  );
  gridEl.replaceChildren(...headers, ...days);
}
