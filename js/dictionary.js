
import { loadLexicon, verifiedBadge, tagHtml } from './common.js';

let allData = [];

function renderResults(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-msg">검색 결과가 없습니다.</p>';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const examples = (item.example_sentences || []).map(ex =>
      `<div>· <strong>${ex.dialect}</strong> — ${ex.standard} <span class="meta-row">(${ex.sentence_type || ''})</span></div>`
    ).join('');
    card.innerHTML = `
      <div class="dialect-form">${item.dialect_form} ${verifiedBadge(item)}</div>
      <div class="standard-form">표준어: ${item.standard_form} · 품사: ${item.part_of_speech}</div>
      <p>${item.meaning}</p>
      ${item.grammatical_note ? `<div class="meta-row">문법 특징: ${item.grammatical_note}</div>` : ''}
      ${item.phonological_note ? `<div class="meta-row">음운 특징: ${item.phonological_note}</div>` : ''}
      <div class="meta-row">지역: ${item.region ? (item.region.city || item.region.province) : '미확인'} · 세대: ${(item.generation || []).join(', ')}</div>
      ${examples}
      ${item.audio && item.audio.file ? `<audio controls src="${item.audio.file}">음성을 지원하지 않는 브라우저입니다.</audio>` : '<div class="meta-row">음성 자료 없음</div>'}
      <div class="meta-row">${tagHtml(item.tags)}</div>
    `;
    container.appendChild(card);
  });
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.trim();
  const region = document.getElementById('regionFilter').value;
  const gen = document.getElementById('genFilter').value;

  const filtered = allData.filter(item => {
    const matchQuery = !q ||
      item.dialect_form.includes(q) ||
      item.standard_form.includes(q) ||
      (item.tags || []).some(t => t.includes(q));
    const matchRegion = !region || (item.region && (item.region.city === region || item.region.province === region));
    const matchGen = !gen || (item.generation || []).includes(gen);
    return matchQuery && matchRegion && matchGen;
  });
  renderResults(filtered);
}

async function init() {
  allData = await loadLexicon();
  renderResults(allData);
  document.getElementById('searchBtn').addEventListener('click', applyFilters);
  document.getElementById('searchInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') applyFilters();
  });
  document.getElementById('regionFilter').addEventListener('change', applyFilters);
  document.getElementById('genFilter').addEventListener('change', applyFilters);
}
init();
