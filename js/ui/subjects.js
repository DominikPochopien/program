import { GOOD_ATTENDANCE, MIN_ATTENDANCE } from '../constants.js';
import { attendanceStats } from '../store.js';
import { escapeHtml } from '../utils.js';

function toneClass(percent) {
  if (percent === null) return '';
  if (percent >= GOOD_ATTENDANCE) return 'is-good';
  return percent >= MIN_ATTENDANCE ? 'is-mid' : 'is-bad';
}

function subjectCard(subject) {
  const s = attendanceStats(subject.id);
  return `
    <div class="subject ${toneClass(s.percent)}" style="--color:${subject.color}">
      <div class="subject__head">
        <b>${escapeHtml(subject.name)}</b>
        <span>
          <span class="subject__percent">${s.percent === null ? '–' : `${s.percent}%`}</span>
          <button class="subject__remove" data-remove="${subject.id}" title="Usuń">🗑</button>
        </span>
      </div>
      <div class="progress"><div class="progress__bar" style="width:${s.percent ?? 0}%"></div></div>
      <div class="subject__meta">były: ${s.present} · nieobecne: ${s.absent} · odwołane: ${s.cancelled} · zaplanowane: ${s.planned}</div>
    </div>`;
}

export function renderSubjects(root, { subjects }, { onRemove }) {
  root.innerHTML = subjects.length
    ? subjects.map(subjectCard).join('')
    : '<div class="empty">Dodaj pierwszy przedmiot, aby zacząć.</div>';
  root.querySelectorAll('[data-remove]').forEach((btn) =>
    btn.addEventListener('click', () => onRemove(btn.dataset.remove)),
  );
}
