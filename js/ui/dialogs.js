import { DEFAULT_DURATION_MIN, QUICK_START_TIMES, STATUS, STATUS_OPTIONS, SUBJECT_COLORS } from '../constants.js';
import { $, addMinutes, escapeHtml, formatRange } from '../utils.js';

const overlay = $('#overlay');
const modal = $('#modal');

overlay.addEventListener('click', (e) => e.target === overlay && closeDialog());

export const closeDialog = () => overlay.classList.remove('open');

function show(html) {
  modal.innerHTML = html;
  overlay.classList.add('open');
}

export function openAddClassDialog({ date, subjects, onSave }) {
  const options = subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  const quick = QUICK_START_TIMES.map((t) => `<button type="button" class="btn btn--small" data-time="${t}">${t}</button>`).join('');
  show(`
    <h3>Nowe zajęcia</h3>
    <label class="field">Przedmiot<select id="f-subject">${options}</select></label>
    <label class="field">Data<input type="date" id="f-date" value="${date}"></label>
    <div class="row">
      <label class="field">Początek<input type="time" id="f-start" value="10:30"></label>
      <label class="field">Koniec<input type="time" id="f-end" value="12:00"></label>
    </div>
    <div class="row row--fixed" id="quick-times">${quick}</div>
    <label class="field">Powtarzaj co tydzień (dodatkowe tygodnie, 0 = jednorazowo)
      <input type="number" id="f-repeat" min="0" max="52" value="0">
    </label>
    <div class="row"><button class="btn" id="f-cancel">Anuluj</button><button class="btn btn--primary" id="f-save">Zapisz</button></div>`);

  const start = $('#f-start', modal);
  const end = $('#f-end', modal);
  let endEdited = false;
  const syncEnd = () => {
    if (!endEdited && start.value) end.value = addMinutes(start.value, DEFAULT_DURATION_MIN);
  };

  end.addEventListener('input', () => (endEdited = true));
  start.addEventListener('input', syncEnd);
  $('#quick-times', modal).addEventListener('click', (e) => {
    if (!e.target.dataset.time) return;
    start.value = e.target.dataset.time;
    syncEnd();
  });
  $('#f-cancel', modal).onclick = closeDialog;
  $('#f-save', modal).onclick = () => {
    const day = $('#f-date', modal).value;
    if (!day || !start.value) return;
    onSave({
      subjectId: $('#f-subject', modal).value,
      date: day,
      start: start.value,
      end: end.value || null,
      repeatWeeks: Math.min(52, Math.max(0, Number($('#f-repeat', modal).value) || 0)),
    });
    closeDialog();
  };
}

export function openStatusDialog({ cls, subject, onStatus, onDelete }) {
  const buttons = STATUS_OPTIONS.map(
    ({ status, label }) => `<button class="btn ${cls.status === status ? 'btn--active' : ''}" data-status="${status}">${label}</button>`,
  ).join('');
  show(`
    <h3>${escapeHtml(subject.name)}</h3>
    <div class="modal__subtitle">${cls.date} · ${formatRange(cls)}</div>
    <div class="status-list" id="status-list">${buttons}</div>
    <div class="row">
      <button class="btn" id="s-reset">Cofnij do „zaplanowane"</button>
      <button class="btn btn--danger" id="s-delete">Usuń</button>
      <button class="btn" id="s-close">Zamknij</button>
    </div>`);

  $('#status-list', modal).addEventListener('click', (e) => {
    const { status } = e.target.dataset;
    if (!status) return;
    onStatus(status);
    closeDialog();
  });
  $('#s-reset', modal).onclick = () => { onStatus(STATUS.PLANNED); closeDialog(); };
  $('#s-delete', modal).onclick = () => { onDelete(); closeDialog(); };
  $('#s-close', modal).onclick = closeDialog;
}

export function openSubjectDialog({ defaultColor, onSave }) {
  let color = defaultColor;
  const swatches = SUBJECT_COLORS.map((c) => `<button type="button" class="swatch" data-color="${c}" style="background:${c}"></button>`).join('');
  show(`
    <h3>Nowy przedmiot</h3>
    <label class="field">Nazwa<input id="n-name" placeholder="np. Matematyka" autofocus></label>
    <label class="field">Kolor</label>
    <div class="row" id="swatches">${swatches}</div>
    <div class="row"><button class="btn" id="n-cancel">Anuluj</button><button class="btn btn--primary" id="n-save">Dodaj</button></div>`);

  const paint = () =>
    modal.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('swatch--active', b.dataset.color === color));
  const save = () => {
    const name = $('#n-name', modal).value.trim();
    if (!name) return;
    onSave(name, color);
    closeDialog();
  };

  paint();
  $('#swatches', modal).addEventListener('click', (e) => {
    if (e.target.dataset.color) { color = e.target.dataset.color; paint(); }
  });
  $('#n-name', modal).addEventListener('keydown', (e) => e.key === 'Enter' && save());
  $('#n-cancel', modal).onclick = closeDialog;
  $('#n-save', modal).onclick = save;
}
