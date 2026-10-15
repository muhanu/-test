import { loadLexicon, escapeHTML, verifiedBadge, tagHtml, regionLabel, hasConsentedAudio, errorMessage } from "./common.js";

const byId = id => document.getElementById(id);
const normalize = value => String(value ?? "").normalize("NFC").toLocaleLowerCase("ko-KR").trim();
let data = [];

function textFor(item) {
  return [
    item.dialect_form, item.standard_form, item.meaning, item.part_of_speech,
    item.phonological_note, item.grammatical_note, ...(item.tags || []),
    ...(item.example_sentences || []).flatMap(example => [example.dialect, example.standard])
  ].map(normalize).join(" ");
}

function render(items) {
  const result = byId("results");
  byId("resultCount").textContent = `검색 결과 ${items.length}개`;
  if (!items.length) {
    result.innerHTML = '<p class="empty-state">조건에 맞는 항목이 없습니다. 검색어나 지역·세대 필터를 바꿔 보세요.</p>';
    return;
  }
  result.innerHTML = items.map(item => {
    const examples = (item.example_sentences || []).map(example =>
      `<div class="example"><strong>${escapeHTML(example.dialect)}</strong> <span aria-hidden="true">→</span> ${escapeHTML(example.standard)}${example.sentence_type ? ` <span class="meta-row">· ${escapeHTML(example.sentence_type)}</span>` : ""}</div>`
    ).join("");
    const audio = hasConsentedAudio(item)
      ? `<audio controls preload="none" src="${escapeHTML(item.audio.file)}">오디오를 지원하지 않는 브라우저입니다.</audio>`
      : "";
    const generations = (item.generation || []).map(escapeHTML).join(" · ") || "정보 없음";
    return `<article class="entry">
      <h2>${escapeHTML(item.dialect_form)} ${verifiedBadge(item)}</h2>
      <div class="standard-form">표준어 · ${escapeHTML(item.standard_form)} <span aria-hidden="true">/</span> ${escapeHTML(item.part_of_speech || "품사 미상")}</div>
      <p class="meaning">${escapeHTML(item.meaning)}</p>
      ${item.grammatical_note ? `<div class="meta-row">문법 · ${escapeHTML(item.grammatical_note)}</div>` : ""}
      ${item.phonological_note ? `<div class="meta-row">소리 · ${escapeHTML(item.phonological_note)}</div>` : ""}
      <div class="meta-row">지역 · ${escapeHTML(regionLabel(item.region))} · 세대 · ${generations}</div>
      ${examples}${audio}${tagHtml(item.tags)}
    </article>`;
  }).join("");
}

function filter() {
  const query = normalize(byId("searchInput").value);
  const region = byId("regionFilter").value;
  const generation = byId("genFilter").value;
  render(data.filter(item =>
    (!query || textFor(item).includes(query))
    && (!region || item.region?.city === region || item.region?.province === region)
    && (!generation || (item.generation || []).includes(generation))
  ));
}

async function init() {
  try {
    data = await loadLexicon();
    render(data);
    byId("searchInput").addEventListener("input", filter);
    byId("regionFilter").addEventListener("change", filter);
    byId("genFilter").addEventListener("change", filter);
    byId("resetFilters").addEventListener("click", () => {
      byId("searchInput").value = "";
      byId("regionFilter").value = "";
      byId("genFilter").value = "";
      filter();
      byId("searchInput").focus();
    });
  } catch (error) {
    byId("resultCount").textContent = "자료 오류";
    errorMessage("results", error);
  }
}
init();