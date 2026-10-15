import { loadLexicon, escapeHTML, regionLabel, hasConsentedAudio, errorMessage } from "./common.js";

let audioItems = [];
const list = document.getElementById("archiveList");
const count = document.getElementById("archiveCount");
const filter = document.getElementById("regionFilterArchive");

function render() {
  const region = filter.value;
  const items = audioItems.filter(item =>
    !region || item.region?.city === region || item.region?.province === region
  );
  count.textContent = `공개 음성 ${items.length}건`;
  if (!items.length) {
    list.innerHTML = '<p class="empty-state">현재 공개할 수 있는 음성 자료가 없습니다.</p>';
    return;
  }
  list.innerHTML = items.map(item => {
    const sentences = (item.example_sentences || []).map(example => escapeHTML(example.dialect)).join(" · ");
    const generations = (item.generation || []).map(escapeHTML).join(" · ") || "정보 없음";
    return `<article class="entry-card">
      <h2>${escapeHTML(item.dialect_form)}</h2>
      <div class="meta-row">지역 · ${escapeHTML(regionLabel(item.region))} <span aria-hidden="true">·</span> 세대 · ${generations}</div>
      ${sentences ? `<p class="meaning">${sentences}</p>` : ""}
      <audio controls preload="none" src="${escapeHTML(item.audio.file)}">이 브라우저는 오디오 재생을 지원하지 않습니다.</audio>
    </article>`;
  }).join("");
}

async function init() {
  try {
    const data = await loadLexicon();
    audioItems = data.filter(hasConsentedAudio);
    render();
    filter.addEventListener("change", render);
  } catch (error) {
    count.textContent = "자료 오류";
    errorMessage(list, error);
  }
}
init();