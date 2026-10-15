import { GOOD_ATTENDANCE, MIN_ATTENDANCE } from '../constants.js';
import { attendanceStats } from '../store.js';

// Podsumowanie pod paskiem: "Wszystkie" w pierwszym rzędzie, niżej dwie kolumny
function statsHtml(stats) {
  return [
    ['Wszystkie', stats.total, 'subject__stat--wide'],
    ['Obecność', stats.present],
    ['Bez sprawdzania', stats.noCheck],
    ['Nieobecność', stats.absent],
    ['Odwołane', stats.cancelled],
  ]
    .map(([label, value, extraClass = '']) => `<span class="subject__stat ${extraClass}">${label}: <b>${value}</b></span>`)
    .join('');
}

export function renderSubjects(container, state, handlers) {
  if (!state.subjects.length) {
    container.innerHTML = '<p class="empty">Brak przedmiotów. Dodaj swój pierwszy przedmiot poniżej.</p>';
    return;
  }

  container.innerHTML = '';
  state.subjects.forEach((subject) => {
    const stats = attendanceStats(subject.id);
    const hasData = stats.percent !== null;
    let toneClass = '';
    if (hasData) {
      if (stats.percent >= GOOD_ATTENDANCE) toneClass = 'is-good';
      else if (stats.percent >= MIN_ATTENDANCE) toneClass = 'is-mid';
      else toneClass = 'is-bad';
    }

    const card = document.createElement('div');
    card.className = `subject ${toneClass}`;
    card.style.setProperty('--color', subject.color);

    // Procent, pasek i krótkie podsumowanie liczby zajęć.
    // Nazwa wstawiana jest jako zwykły tekst (textContent), a nie HTML.
    card.innerHTML = `
      <div class="subject__head">
        <strong></strong>
        <div>
          <span class="subject__percent">${hasData ? stats.percent + '%' : '–'}</span>
          <button class="subject__remove" aria-label="Usuń">🗑</button>
        </div>
      </div>
      <div class="progress"><div class="progress__bar" style="width: ${hasData ? stats.percent : 0}%"></div></div>
      <div class="subject__meta">${statsHtml(stats)}</div>
    `;

    const nameEl = card.querySelector('strong');
    nameEl.textContent = subject.name;
    nameEl.title = 'Kliknij, aby zwinąć lub rozwinąć nazwę';
    nameEl.onclick = () => card.classList.toggle('subject--expanded');
    card.querySelector('.subject__remove').onclick = () => handlers.onRemove(subject.id);
    container.appendChild(card);
  });
}