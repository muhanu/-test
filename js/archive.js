
import { loadLexicon } from './common.js';

let allData = [];

function render(items) {
  const container = document.getElementById('archiveList');
  container.innerHTML = '';
  const withAudio = items.filter(i => i.audio && i.audio.file);
  if (withAudio.length === 0) {
    container.innerHTML = '<p class="empty-msg">등록된 음성 자료가 없습니다. audio 폴더에 mp3 파일을 추가하고 data/lexicon.json의 audio.file 경로를 채워주세요.</p>';
    return;
  }
  withAudio.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="dialect-form">${item.dialect_form}</div>
      <div class="meta-row">지역: ${item.region ? (item.region.city || item.region.province) : '미확인'} · 세대: ${(item.generation||[]).join(', ')}</div>
      <div class="meta-row">문장유형: ${(item.example_sentences||[]).map(e=>e.sentence_type).join(', ')}</div>
      <audio controls src="${item.audio.file}"></audio>
    `;
    container.appendChild(card);
  });
}

async function init() {
  allData = await loadLexicon();
  render(allData);
  document.getElementById('regionFilterArchive').addEventListener('change', e => {
    const v = e.target.value;
    render(!v ? allData : allData.filter(i => i.region && (i.region.city === v || i.region.province === v)));
  });
}
init();
