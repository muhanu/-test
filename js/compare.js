
import { loadLexicon } from './common.js';

async function init() {
  const data = await loadLexicon();
  const tbody = document.getElementById('compareBody');
  tbody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.dialect_form}</td>
      <td>${item.standard_form}</td>
      <td>${item.category === 'grammatical' ? '문법적 차이' : '어휘적 차이'}</td>
      <td>${item.phonological_note || item.grammatical_note || '설명 자료 준비 중'}</td>
      <td>${item.region ? (item.region.city || item.region.province) : '미확인'}</td>
    `;
    tbody.appendChild(tr);
  });
}
init();
