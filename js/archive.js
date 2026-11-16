import {
  loadLexicon, escapeHTML, regionLabel, hasConsentedAudio, errorMessage, macroOf, regionMeta
} from "./common.js";

const byId = id => document.getElementById(id);
let items = [];
let activeRegion = "";

function render() {
  const consented = items.filter(hasConsentedAudio);
  const visible = consented.filter(item => !activeRegion || macroOf(item) === activeRegion);

  byId("archiveTotal").textContent = `${consented.length}건`;
  byId("archivePending").textContent = `${items.length - consented.length}건`;
  byId("archiveCount").textContent = activeRegion
    ? `${activeRegion} 권역 · 공개 음성 ${visible.length}건`
    : `다섯 권역 · 공개 음성 ${visible.length}건`;

  if (!visible.length) {
    byId("archiveList").innerHTML = `<div class="state">
      <p><strong>아직 공개 동의가 확인된 음성 자료가 없습니다.</strong></p>
      <p>어휘 ${items.length}개 항목은 모두 글로만 공개되어 있습니다. 화자의 명시적 동의를 받은 음성만 이곳에 올라갑니다.</p>
    </div>`;
    return;
  }

  byId("archiveList").innerHTML = visible.map(item => {
    const meta = regionMeta(macroOf(item));
    const examples = (item.example_sentences || []).map(example => escapeHTML(example.dialect)).join(" · ");
    return `<article class="entry">
      <div class="entry-top">
        <h2 class="entry-word">
          <span class="dialect">${escapeHTML(item.dialect_form)}</span>
          <span class="sep" aria-hidden="true">/</span>
          <span class="standard">${escapeHTML(item.standard_form)}</span>
        </h2>
        <span class="entry-region">${escapeHTML(meta ? meta.name : "지역 미확인")} · ${escapeHTML(regionLabel(item))}</span>
      </div>
      <dl class="entry-notes">
        <div class="note-row"><dt>세대</dt><dd>${escapeHTML((item.generation || []).join(" · ") || "정보 없음")}</dd></div>
        ${examples ? `<div class="note-row"><dt>예문</dt><dd>${examples}</dd></div>` : ""}
      </dl>
      <audio controls preload="none" src="${escapeHTML(item.audio.file)}">오디오를 지원하지 않는 브라우저입니다.</audio>
    </article>`;
  }).join("");
}

function syncChips() {
  document.querySelectorAll("[data-archive-region]").forEach(chip => {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("data-archive-region") === activeRegion));
  });
}

async function init() {
  try {
    items = await loadLexicon();
    syncChips();
    render();
    document.querySelectorAll("[data-archive-region]").forEach(chip => {
      chip.addEventListener("click", () => {
        activeRegion = chip.getAttribute("data-archive-region") || "";
        syncChips();
        render();
      });
    });
  } catch (error) {
    byId("archiveCount").textContent = "자료 오류";
    errorMessage("archiveList", error);
  }
}

init();
