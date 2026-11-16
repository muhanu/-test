import {
  loadLexicon, loadGrammar, loadCompare, REGIONS, escapeHTML,
  pickRandom, macroOf, regionTag, errorMessage
} from "./common.js";

const byId = id => document.getElementById(id);
const PREVIEW_IDS = ["cmp-07", "cmp-01", "cmp-08", "cmp-03"];

function todaySeed() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 100003;
  return { hash, now };
}

function renderHeadword(card, item) {
  byId("hwWord").textContent = item.dialect_form;
  const tags = byId("hwTags");
  tags.innerHTML = [
    item.part_of_speech ? `<span class="tag">${escapeHTML(item.part_of_speech)}</span>` : "",
    regionTag(macroOf(item))
  ].join("");
  byId("hwMeaning").textContent = item.meaning;

  const example = (item.example_sentences || [])[0];
  const box = byId("hwExample");
  if (example) {
    box.hidden = false;
    box.querySelector(".ex").textContent = example.dialect;
    box.querySelector(".ex-standard").textContent = example.standard;
  } else {
    box.hidden = true;
  }
  const link = byId("hwLink");
  link.href = `dictionary.html?q=${encodeURIComponent(item.dialect_form)}`;
  card.style.removeProperty("--region-ink");
}

function renderRegions(words) {
  const list = byId("regionList");
  list.innerHTML = REGIONS.map(region => {
    const items = words.filter(item => macroOf(item) === region.key);
    const wordLinks = region.words
      .filter(word => items.some(item => item.dialect_form === word))
      .map(word => `<a href="dictionary.html?q=${encodeURIComponent(word)}">${escapeHTML(word)}</a>`)
      .join(" · ");
    return `<li class="region-row">
      <span class="region-head">
        <a class="region-name" href="dictionary.html?region=${encodeURIComponent(region.key)}">${escapeHTML(region.name)}</a>
        <span class="region-count">${items.length}개</span>
        <span class="sr-only">${escapeHTML(region.sub)}</span>
      </span>
      <span class="region-words">${wordLinks || "등록된 대표 낱말이 없습니다"}</span>
    </li>`;
  }).join("");
}

function renderCompare(rows) {
  const picked = PREVIEW_IDS
    .map(id => rows.find(row => row.id === id))
    .filter(Boolean);
  const body = picked.map(row => `<tr>
    <th scope="row"><a href="compare.html">${escapeHTML(row.standard)}</a></th>
    ${REGIONS.map(region => {
      const form = row.forms?.[region.key] ?? "·";
      const same = form === row.standard;
      return `<td><span class="form${same ? " is-standard" : ""}">${escapeHTML(form)}</span></td>`;
    }).join("")}
  </tr>`).join("");
  const table = byId("comparePreview");
  table.querySelector("tbody").innerHTML = body || '<tr><td colspan="6" class="state">비교 자료가 없습니다.</td></tr>';
}

async function init() {
  try {
    const [words, grammar, compare] = await Promise.all([loadLexicon(), loadGrammar(), loadCompare()]);
    byId("corpusNote").textContent = `어휘 ${words.length}개 · 문법 ${grammar.length}개`;
    renderRegions(words);
    renderCompare(compare);

    const { hash, now } = todaySeed();
    byId("headwordDate").textContent = `${now.getMonth() + 1}월 ${now.getDate()}일`;
    const sorted = [...words].sort((a, b) => a.id.localeCompare(b.id));
    let current = sorted[hash % sorted.length];
    renderHeadword(byId("headwordBox"), current);

    byId("shuffleWord").addEventListener("click", () => {
      const pool = sorted.filter(item => item.id !== current.id);
      current = pickRandom(pool, 1)[0];
      renderHeadword(byId("headwordBox"), current);
    });
  } catch (error) {
    const note = byId("corpusNote");
    if (note) note.textContent = "자료 확인 불가";
    errorMessage("regionList", error);
    byId("hwWord").textContent = "…";
    byId("hwMeaning").textContent = "자료를 불러오지 못했습니다.";
    byId("hwTags").innerHTML = "";
    byId("hwExample").hidden = true;
    const table = byId("comparePreview");
    if (table) table.querySelector("tbody").innerHTML = '<tr><td colspan="6" class="state is-error">자료를 불러오지 못했습니다.</td></tr>';
  }
}

init();
