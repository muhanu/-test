
import { loadGrammar } from './common.js';

async function init() {
  const data = await loadGrammar();
  const container = document.getElementById('grammarList');
  container.innerHTML = '';
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="dialect-form">${item.form}</div>
      <p>${item.function}</p>
      <div class="meta-row">표준어 대응: ${item.standard_equivalent}</div>
      <div class="meta-row">분포 지역: ${(item.region_distribution || []).join(', ')}</div>
      ${item.counterpart ? `<div class="meta-row">대응 어미: ${item.counterpart.form} (${item.counterpart.function})</div>` : ''}
      <div>예문: <strong>${item.example.dialect}</strong> — ${item.example.standard}</div>
      ${item.source && !item.source.verified ? '<span class="badge-unverified">검증 필요</span>' : ''}
    `;
    container.appendChild(card);
  });
}
init();
