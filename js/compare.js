import {
  loadCompare, loadLexicon, escapeHTML, regionMeta, macroOf, REGIONS, errorMessage
} from "./common.js";

const byId = id => document.getElementById(id);
const regions = REGIONS;
const PAGE = 24;
let pairs = [];
let shown = PAGE;
let activeRegion = new URLSearchParams(location.search).get("region") || "";

function matrixHTML(rows) {
  const head = `<thead><tr><th scope="col">표준어</th>${regions
    .map(region => `<th scope="col" style="color:${region.color}">${region.key}</th>`).join("")}</tr></thead>`;
  const body = rows.map(row => `<tr>
    <th scope="row">${escapeHTML(row.standard)}<span class="matrix-row-sub">${escapeHTML(row.group || "")}</span></th>
    ${regions.map(region => {
      const form = row.forms?.[region.key] ?? "—";
      const same = form === row.standard;
      return `<td><span class="matrix-form${same ? " is-standard" : ""}" style="--region-color:${region.color};--region-soft:${region.soft}">${escapeHTML(form)}</span></td>`;
    }).join("")}
  </tr>`).join("");
  return head + `<tbody>${body}</tbody>`;
}

function pairHTML(item) {
  const meta = regionMeta(macroOf(item));
  const example = (item.example_sentences || [])[0];
  if (!example) return "";
  return `<article class="pair" style="--region-color:${meta ? meta.color : "#7ad8c4"}">
    <div class="pair-head">
      <span>${escapeHTML(meta ? meta.short : "지역")} · ${escapeHTML(item.region?.city || item.region?.province || "")}</span>
      <span>${escapeHTML(item.dialect_form)} / ${escapeHTML(item.standard_form)}</span>
    </div>
    <div class="pair-line"><span class="label">방언</span><span class="say">${escapeHTML(example.dialect)}</span></div>
    <div class="pair-line standard"><span class="label">표준</span><span class="say">${escapeHTML(example.standard)}</span></div>
    <div class="pair-foot">${escapeHTML(example.sentence_type || "")}${item.part_of_speech ? ` · ${escapeHTML(item.part_of_speech)}` : ""}</div>
  </article>`;
}

function renderPairs() {
  const list = pairs.filter(item => !activeRegion || macroOf(item) === activeRegion);
  const visible = list.slice(0, shown);
  byId("pairCount").textContent = `${visible.length} / ${list.length}쌍`;
  byId("pairList").innerHTML = visible.length
    ? visible.map(pairHTML).join("")
    : '<p class="empty-state">이 권역의 예문이 없습니다.</p>';
  const more = byId("pairMore");
  more.hidden = list.length <= shown;
}

function syncChips() {
  document.querySelectorAll("[data-pair-region]").forEach(chip => {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("data-pair-region") === activeRegion));
  });
}

async function init() {
  try {
    const [compare, lexicon] = await Promise.all([loadCompare(), loadLexicon()]);
    byId("matrixTable").innerHTML = matrixHTML(compare);
    const regionsCovered = new Set(compare.flatMap(row => Object.keys(row.forms || {})));
    byId("matrixMeta").textContent = `${compare.length}개 개념 × ${regionsCovered.size}개 권역`;

    pairs = lexicon.filter(item => (item.example_sentences || []).length);
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
    errorMessage("matrixWrap", error);
    errorMessage("pairList", error);
  }
}

init();
