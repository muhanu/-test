import { loadLexicon, escapeHTML, regionLabel, hasConsentedAudio, errorMessage } from "./common.js";

let items = [];
const list = document.getElementById("archiveList");
const count = document.getElementById("archiveCount");
const regionSelect = document.getElementById("regionFilterArchive");

function render() {
  const region = regionSelect.value;
  const visible = items.filter(item =>
    !region || item.region?.city === region || item.region?.province === region
  );
  count.textContent = `공개 음성 ${visible.length}건`;
  if (!visible.length) {
    list.innerHTML = '<p class="empty-state">공개 동의가 확인된 음성 자료가 없습니다.</p>';
    return;
  }
  list.innerHTML = visible.map(item => {
    const examples = (item.example_sentences || []).map(example => escapeHTML(example.dialect)).join(" · ");
    return `<article class="entry">
      <h2>${escapeHTML(item.dialect_form)}</h2>
      <div class="meta-row">지역 · ${escapeHTML(regionLabel(item.region))} · 세대 · ${(item.generation || []).map(escapeHTML).join(" · ") || "정보 없음"}</div>
      ${examples ? `<p class="meaning">${examples}</p>` : ""}
      <audio controls preload="none" src="${escapeHTML(item.audio.file)}">오디오를 지원하지 않는 브라우저입니다.</audio>
    </article>`;
  }).join("");
}

async function init() {
  try {
    items = (await loadLexicon()).filter(hasConsentedAudio);
    render();
    regionSelect.addEventListener("change", render);
  } catch (error) {
    count.textContent = "자료 오류";
    errorMessage(list, error);
  }
}
init();