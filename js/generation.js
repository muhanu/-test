
import { loadLexicon } from './common.js';

const GEN_ORDER = ['청소년', '청년', '중년', '노년'];

async function init() {
  const data = await loadLexicon();
  const counts = {};
  GEN_ORDER.forEach(g => counts[g] = 0);
  data.forEach(item => {
    (item.generation || []).forEach(g => {
      if (counts[g] !== undefined) counts[g]++;
    });
  });
  const max = Math.max(...Object.values(counts), 1);
  const container = document.getElementById('genChart');
  container.innerHTML = '';
  GEN_ORDER.forEach(g => {
    const pct = Math.round((counts[g] / max) * 100);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-label">${g}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%">${counts[g]}건</div></div>
    `;
    container.appendChild(row);
  });
}
init();
