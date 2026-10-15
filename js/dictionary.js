import { loadLexicon, escapeHTML, verifiedBadge, tagHtml, regionLabel, hasConsentedAudio, errorMessage } from "./common.js";

let allData = [];
const $ = id => document.getElementById(id);
const normalize = value => String(value || "").normalize("NFC").toLocaleLowerCase("ko-KR").trim();

function searchableText(item) {
  return [
    item.dialect_form, item.standard_form, item.meaning, item.part_of_speech,
    item.phonological_note, item.grammatical_note, ...(item.tags || []),
    ...(item.example_sentences || []).flatMap(example => [example.dialect, example.standard])
  ].map(normalize).join(" ");
}

function renderResults(items) {
  const container = $("results");
  const count = $("resultCount");
  count.textContent = `검색 결과 ${items.length}개`;
  if (!items.length) {
    container.innerHTML = '<p class="empty-state">조건에 맞는 항목이 없습니다. 검색어나 필터를 바꿔 보세요.</p>';
    return;
  }
  container.innerHTML = items.map(item => {
    const examples = (item.example_sentences || []).map(example =>
      `<div class="example"><strong>${escapeHTML(example.dialect)}</strong> <span aria-hidden="true">→</span> ${escapeHTML(example.standard)}${example.sentence_type ? ` <span class="meta-row">· ${escapeHTML(example.sentence_type)}</span>` : ""}</div>`
    ).join("");
    const audio = hasConsentedAudio(item)
      ? `<audio controls preload="none" src="${escapeHTML(item.audio.file)}">브라우저에서 오디오를 지원하지 않습니다.</audio>`
      : "";
    const generations = (item.generation || []).map(escapeHTML).join(" · ") || "정보 없음";
    return `<article class="entry-card">
      <h2>${escapeHTML(item.dialect_form)} ${verifiedBadge(item)}</h2>
      <div class="standard-form">표준어 · ${escapeHTML(item.standard_form)} <span aria-hidden="true">/</span> ${escapeHTML(item.part_of_speech || "품사 미상")}</div>
      <p class="meaning">${escapeHTML(item.meaning)}</p>
      ${item.grammatical_note ? `<div class="meta-row">문법 · ${escapeHTML(item.grammatical_note)}</div>` : ""}
      ${item.phonological_note ? `<div class="meta-row">소리 · ${escapeHTML(item.phonological_note)}</div>` : ""}
      <div class="meta-row">지역 · ${escapeHTML(regionLabel(item.region))} <span aria-hidden="true">·</span> 세대 · ${generations}</div>
      ${examples}${audio}${tagHtml(item.tags)}
    </article>`;
  }).join("");
}

function applyFilters() {
  const query = normalize($("searchInput").value);
  const region = $("regionFilter").value;
  const generation = $("genFilter").value;
  const filtered = allData.filter(item =>
    (!query || searchableText(item).includes(query))
    && (!region || item.region?.city === region || item.region?.province === region)
    && (!generation || (item.generation || []).includes(generation))
  );
  renderResults(filtered);
}

async function init() {
  try {
    allData = await loadLexicon();
    renderResults(allData);
    $("searchInput").addEventListener("input", applyFilters);
    $("regionFilter").addEventListener("change", applyFilters);
    $("genFilter").addEventListener("change", applyFilters);
    $("resetFilters").addEventListener("click", () => {
      $("searchInput").value = "";
      $("regionFilter").value = "";
      $("genFilter").value = "";
      $("searchInput").focus();
      applyFilters();
    });
  } catch (error) {
    $("resultCount").textContent = "자료 오류";
    errorMessage("results", error);
  }
}
init();