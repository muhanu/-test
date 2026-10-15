import { loadGrammar, escapeHTML, verifiedBadge, errorMessage } from "./common.js";

async function init() {
  const list = document.getElementById("grammarList");
  try {
    const data = await loadGrammar();
    if (!data.length) {
      list.innerHTML = '<p class="empty-state">등록된 문법 항목이 없습니다.</p>';
      return;
    }
    list.innerHTML = data.map(item => {
      const example = item.example || {};
      const related = item.counterpart
        ? `<div class="meta-row">함께 보기 · ${escapeHTML(item.counterpart.form)} — ${escapeHTML(item.counterpart.function)}</div>`
        : "";
      return `<article class="entry">
        <h2>${escapeHTML(item.form)} ${verifiedBadge(item)}</h2>
        <p class="meaning">${escapeHTML(item.function)}</p>
        <div class="meta-row">표준어 대응 · ${escapeHTML(item.standard_equivalent)}</div>
        <div class="meta-row">분포 · ${(item.region_distribution || []).map(escapeHTML).join(" · ") || "정보 없음"}</div>
        ${related}
        <div class="example"><strong>${escapeHTML(example.dialect)}</strong> <span aria-hidden="true">→</span> ${escapeHTML(example.standard)}</div>
      </article>`;
    }).join("");
  } catch (error) { errorMessage(list, error); }
}
init();