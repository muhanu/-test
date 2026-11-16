import {
  loadCompare, loadLexicon, escapeHTML, macroOf, REGIONS, errorMessage
} from "./common.js";

const byId = id => document.getElementById(id);
const PAGE = 24;
let pairs = [];
let shown = PAGE;
let activeRegion = new URLSearchParams(location.search).get("region") || "";

function matrixHTML(rows) {
  return rows.map(row => `<tr>
    <th scope="row">${escapeHTML(row.standard)}<span class="row-sub">${escapeHTML(row.group || "")}</span></th>
    ${REGIONS.map(region => {
      const form = row.forms?.[region.key] ?? "·";
      const same = form === row.standard;
      return `<td><span class="form${same ? " is-standard" : ""}">${escapeHTML(form)}</span></td>`;
    }).join("")}
  </tr>`).join("");
}

function interleaveByRegion(items) {
  const buckets = REGIONS.map(region => items.filter(item => macroOf(item) === region.key));
  const out = [];
  let added = true;
  while (added) {
    added = false;
    for (const bucket of buckets) {
      if (bucket.length) { out.push(bucket.shift()); added = true; }
    }
  }
  return out;
}

function pairHTML(item) {
  const meta = REGIONS.find(region => region.key === macroOf(item));
  const example = (item.example_sentences || [])[0];
  if (!example) return "";
  return `<article class="pair">
    <div class="pair-head">
      <span>${escapeHTML(meta ? meta.name : "지역 미확인")} · ${escapeHTML(item.region?.city || item.region?.province || "")}</span>
      <span class="pair-word">${escapeHTML(item.dialect_form)} / ${escapeHTML(item.standard_form)}</span>
    </div>
    <p class="pair-line"><span class="ex">${escapeHTML(example.dialect)}</span></p>
    <p class="pair-line standard"><span class="say">${escapeHTML(example.standard)}</span></p>
    <p class="pair-foot">${escapeHTML(example.sentence_type || "")}${item.part_of_speech ? ` · ${escapeHTML(item.part_of_speech)}` : ""}</p>
  </article>`;
}

function renderPairs() {
  const list = pairs.filter(item => !activeRegion || macroOf(item) === activeRegion);
  const visible = list.slice(0, shown);
  byId("pairCount").textContent = `${visible.length} / ${list.length}쌍`;
  byId("pairList").innerHTML = visible.length
    ? visible.map(pairHTML).join("")
    : '<p class="state">이 권역의 예문이 아직 없습니다.</p>';
  byId("pairMore").hidden = list.length <= shown;
}

function syncChips() {
  document.querySelectorAll("[data-pair-region]").forEach(chip => {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("data-pair-region") === activeRegion));
  });
}

async function init() {
  try {
    const [compare, lexicon] = await Promise.all([loadCompare(), loadLexicon()]);
    byId("matrixTable").querySelector("tbody").innerHTML = matrixHTML(compare);
    const covered = new Set(compare.flatMap(row => Object.keys(row.forms || {})));
    byId("matrixMeta").textContent = `${compare.length}개 개념 · ${covered.size}개 권역`;

    pairs = interleaveByRegion(lexicon.filter(item => (item.example_sentences || []).length));
    syncChips();
    renderPairs();

    document.querySelectorAll("[data-pair-region]").forEach(chip => {
      chip.addEventListener("click", () => {
        activeRegion = chip.getAttribute("data-pair-region") || "";
        shown = PAGE;
        syncChips();
        renderPairs();
      });
    });

    byId("pairMore").addEventListener("click", () => {
      shown += PAGE;
      renderPairs();
    });
  } catch (error) {
    byId("matrixMeta").textContent = "자료 오류";
    const tbody = byId("matrixTable").querySelector("tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="state is-error">자료를 불러오지 못했습니다.</td></tr>';
    errorMessage("pairList", error);
  }
}

init();
