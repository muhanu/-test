import {
  loadLexicon, escapeHTML, verifiedBadge, tagHtml, normalize, macroOf,
  regionMeta, setRegionVars, GENERATIONS, CATEGORY_LABELS, hasConsentedAudio, errorMessage
} from "./common.js";

const byId = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let data = [];

function searchable(item) {
  return [
    item.dialect_form, item.standard_form, item.meaning, item.part_of_speech,
    item.phonological_note, item.grammatical_note,
    ...(item.tags || []),
    ...(item.example_sentences || []).flatMap(example => [example.dialect, example.standard])
  ].map(normalize).join(" ");
}

function entryHTML(item) {
  const meta = regionMeta(macroOf(item));
  const place = item.region?.city || item.region?.province || "";
  const examples = (item.example_sentences || []).map(example => `
    <div class="example-line">
      <span class="ex-dialect">${escapeHTML(example.dialect)}</span>
      <span class="arrow" aria-hidden="true">→</span>
      <span class="ex-standard">${escapeHTML(example.standard)}</span>
      ${example.sentence_type ? `<span class="ex-type">${escapeHTML(example.sentence_type)}</span>` : ""}
    </div>`).join("");
  const notes = [
    item.grammatical_note ? `<div class="note-row"><dt>문법</dt><dd>${escapeHTML(item.grammatical_note)}</dd></div>` : "",
    item.phonological_note ? `<div class="note-row"><dt>소리</dt><dd>${escapeHTML(item.phonological_note)}</dd></div>` : "",
    `<div class="note-row"><dt>분류</dt><dd>${escapeHTML(item.part_of_speech || "품사 미상")} · ${escapeHTML(CATEGORY_LABELS[item.category] || item.category || "미분류")} · ${escapeHTML((item.generation || []).join(" · ") || "세대 미상")}</dd></div>`
  ].join("");
  const audio = hasConsentedAudio(item)
    ? `<audio controls preload="none" src="${escapeHTML(item.audio.file)}">오디오를 지원하지 않는 브라우저입니다.</audio>`
    : "";

  return `<article class="entry" style="--region-color:${meta ? meta.color : "#7ad8c4"};--region-soft:${meta ? meta.soft : "#16232b"}">
    <div class="entry-top">
      <h2 class="entry-word">
        <span class="dialect">${escapeHTML(item.dialect_form)}</span>
        <span class="sep" aria-hidden="true">/</span>
        <span class="standard">${escapeHTML(item.standard_form)}</span>
        ${verifiedBadge(item)}
      </h2>
      <span class="entry-region">${escapeHTML(meta ? meta.name : "지역 미확인")}${place ? ` · ${escapeHTML(place)}` : ""}</span>
    </div>
    <p class="entry-meaning">${escapeHTML(item.meaning)}</p>
    <dl class="entry-notes">${notes}</dl>
    ${examples ? `<div class="entry-examples">${examples}</div>` : ""}
    ${audio}
    <div class="entry-tags">${tagHtml(item.tags)}</div>
  </article>`;
}

function readForm() {
  return {
    q: byId("searchInput").value.trim(),
    region: byId("regionFilter").value,
    pos: byId("posFilter").value,
    category: byId("categoryFilter").value,
    generation: byId("generationFilter").value
  };
}

function apply(filters, { syncUrl = true } = {}) {
  const query = normalize(filters.q);
  const items = data.filter(item =>
    (!query || searchable(item).includes(query))
    && (!filters.region || macroOf(item) === filters.region)
    && (!filters.pos || item.part_of_speech === filters.pos)
    && (!filters.category || item.category === filters.category)
    && (!filters.generation || (item.generation || []).includes(filters.generation))
  );

  const list = byId("results");
  const active = [filters.q, filters.region, filters.pos, filters.category, filters.generation].filter(Boolean).length;
  byId("resultCount").innerHTML = active
    ? `조건에 맞는 <strong>${items.length}</strong>개 항목`
    : `전체 <strong>${items.length}</strong>개 항목`;
  byId("resultHint").textContent = filters.region ? `${filters.region} 권역` : "전국 5개 권역";

  list.innerHTML = items.length
    ? items.map(entryHTML).join("")
    : `<p class="empty-state">조건에 맞는 항목이 없습니다. 검색어나 필터를 바꿔 보세요.</p>`;

  if (syncUrl) {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    if (filters.region) next.set("region", filters.region);
    if (filters.pos) next.set("pos", filters.pos);
    if (filters.category) next.set("category", filters.category);
    if (filters.generation) next.set("gen", filters.generation);
    const url = next.toString() ? `?${next}` : location.pathname;
    history.replaceState(null, "", url);
  }
}

function fillSelect(select, values, allLabel) {
  select.innerHTML = `<option value="">${allLabel}</option>`
    + values.map(value => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");
}

async function init() {
  try {
    data = await loadLexicon();

    const posCount = new Map();
    for (const item of data) {
      if (!item.part_of_speech) continue;
      posCount.set(item.part_of_speech, (posCount.get(item.part_of_speech) || 0) + 1);
    }
    fillSelect(byId("posFilter"), [...posCount.keys()].sort((a, b) => posCount.get(b) - posCount.get(a)), "모든 품사");
    byId("categoryFilter").innerHTML = '<option value="">모든 갈래</option><option value="lexical">어휘</option><option value="grammatical">문법</option>';
    byId("generationFilter").innerHTML = `<option value="">모든 세대</option>${GENERATIONS.map(g => `<option value="${g}">${g}</option>`).join("")}`;

    byId("searchInput").value = params.get("q") || params.get("search") || "";
    byId("regionFilter").value = params.get("region") || "";
    byId("posFilter").value = params.get("pos") || "";
    byId("categoryFilter").value = params.get("category") || "";
    byId("generationFilter").value = params.get("gen") || "";

    apply(readForm(), { syncUrl: false });

    ["searchInput", "regionFilter", "posFilter", "categoryFilter", "generationFilter"].forEach(id => {
      const node = byId(id);
      node.addEventListener(id === "searchInput" ? "input" : "change", () => apply(readForm()));
    });

    byId("resetFilters").addEventListener("click", () => {
      ["searchInput", "regionFilter", "posFilter", "categoryFilter", "generationFilter"].forEach(id => {
        byId(id).value = "";
      });
      apply(readForm());
      byId("searchInput").focus();
    });

    if (params.get("q")) {
      byId("searchInput").setSelectionRange(byId("searchInput").value.length, byId("searchInput").value.length);
    }
  } catch (error) {
    byId("resultCount").textContent = "자료 오류";
    errorMessage("results", error);
  }
}

init();
