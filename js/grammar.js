import {
  loadGrammar, escapeHTML, verifiedBadge, regionMeta, errorMessage
} from "./common.js";

const byId = id => document.getElementById(id);
let data = [];
let activeRegion = new URLSearchParams(location.search).get("region") || "";

function cardHTML(item) {
  const meta = regionMeta(item.macro_region);
  return `<article class="entry" style="--region-color:${meta ? meta.color : "#7ad8c4"};--region-soft:${meta ? meta.soft : "#16232b"}">
    <div class="entry-top">
      <h2 class="entry-word">
        <span class="grammar-form">${escapeHTML(item.form)}</span>
        <span class="grammar-type">${escapeHTML(item.type || "문법")}</span>
        ${verifiedBadge(item)}
      </h2>
      <span class="entry-region">${escapeHTML(meta ? meta.name : "권역 미확인")}</span>
    </div>
    <p class="entry-meaning">${escapeHTML(item.function)}</p>
    <dl class="entry-notes">
      <div class="note-row"><dt>표준어</dt><dd>${escapeHTML(item.standard_equivalent)}</dd></div>
      <div class="note-row"><dt>분포</dt><dd>${escapeHTML((item.region_distribution || []).join(" · ") || "정보 없음")}</dd></div>
      ${item.note ? `<div class="note-row"><dt>해설</dt><dd>${escapeHTML(item.note)}</dd></div>` : ""}
    </dl>
    ${item.example ? `<div class="entry-examples">
      <div class="example-line">
        <span class="ex-dialect">${escapeHTML(item.example.dialect)}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="ex-standard">${escapeHTML(item.example.standard)}</span>
      </div>
    </div>` : ""}
  </article>`;
}

function syncChips() {
  document.querySelectorAll("[data-region]").forEach(chip => {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("data-region") === activeRegion));
  });
}

function render() {
  const list = data.filter(item => !activeRegion || item.macro_region === activeRegion);
  byId("grammarCount").innerHTML = `<strong>${list.length}</strong>개 항목`;
  byId("grammarList").innerHTML = list.length
    ? list.map(cardHTML).join("")
    : '<p class="empty-state">이 권역의 문법 항목이 아직 없습니다.</p>';
}

async function init() {
  try {
    data = await loadGrammar();
    syncChips();
    render();
    document.querySelectorAll("[data-region]").forEach(chip => {
      chip.addEventListener("click", () => {
        activeRegion = chip.getAttribute("data-region") || "";
        syncChips();
        render();
      });
    });
  } catch (error) {
    byId("grammarCount").textContent = "자료 오류";
    errorMessage("grammarList", error);
  }
}

init();
