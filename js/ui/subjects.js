import { GOOD_ATTENDANCE, MIN_ATTENDANCE } from '../constants.js';
import { attendanceStats } from '../store.js';

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
    
    // Zmieniono widok: usunięto <div class="subject__meta">, pozostawiając tylko czysty i zgrabny panel
    card.innerHTML = `
      <div class="subject__head">
        <strong>${subject.name}</strong>
        <div>
          <span class="subject__percent">${hasData ? stats.percent + '%' : '–'}</span>
          <button class="subject__remove" aria-label="Usuń">🗑</button>
        </div>
      </div>
      <div class="progress"><div class="progress__bar" style="width: ${hasData ? stats.percent : 0}%"></div></div>
    `;

    card.querySelector('.subject__remove').onclick = () => handlers.onRemove(subject.id);
    container.appendChild(card);
  });
}
