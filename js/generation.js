import { loadLexicon, errorMessage, macroOf, REGIONS, GENERATIONS } from "./common.js";

const byId = id => document.getElementById(id);

function barsHTML(entries, max, { regionColors = false } = {}) {
  return entries.map(([label, value]) => {
    const percent = value ? Math.max(2.5, Math.round((value / max) * 100)) : 0;
    const meta = regionColors ? REGIONS.find(r => r.key === label) : null;
    return `<div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track" role="progressbar" aria-label="${label} 항목 수" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}">
        <div class="bar-fill" style="width:${percent}%;${meta ? `--region-color:${meta.color}` : ""}"></div>
      </div>
      <span class="bar-value">${value}개</span>
    </div>`;
  }).join("");
}

async function init() {
  try {
    const data = await loadLexicon();

    const regionCounts = REGIONS.map(region => [region.key, data.filter(item => macroOf(item) === region.key).length]);
    const regionMax = Math.max(1, ...regionCounts.map(([, value]) => value));
    byId("regionChart").innerHTML = barsHTML(regionCounts, regionMax, { regionColors: true });
    byId("regionTotal").textContent = `총 ${data.length}개 어휘`;

    const generationCounts = GENERATIONS.map(generation => [generation, data.filter(item => (item.generation || []).includes(generation)).length]);
    const generationMax = Math.max(1, ...generationCounts.map(([, value]) => value));
    byId("genChart").innerHTML = barsHTML(generationCounts, generationMax);
    byId("genTotal").textContent = `총 ${data.length}개 어휘 · 태그 중복 집계`;

    const categories = [
      ["어휘", data.filter(item => item.category === "lexical").length],
      ["문법", data.filter(item => item.category === "grammatical").length]
    ];
    const categoryMax = Math.max(1, ...categories.map(([, value]) => value));
    byId("categoryChart").innerHTML = barsHTML(categories, categoryMax);
    byId("categoryTotal").textContent = `${data.length}개 항목`;

    const examples = data.reduce((sum, item) => sum + (item.example_sentences || []).length, 0);
    byId("statWords").textContent = data.length;
    byId("statExamples").textContent = examples;
    byId("statSubDialects").textContent = new Set(data.map(item => item.region?.sub_dialect).filter(Boolean)).size;
  } catch (error) {
    errorMessage("regionChart", error);
  }
}

init();
