import { loadLexicon, errorMessage } from "./common.js";

const generations = ["청소년", "청년", "중년", "노년"];
async function init() {
  const chart = document.getElementById("genChart");
  try {
    const data = await loadLexicon();
    const counts = Object.fromEntries(generations.map(generation => [generation, 0]));
    for (const item of data) {
      for (const generation of item.generation || []) {
        if (Object.prototype.hasOwnProperty.call(counts, generation)) counts[generation] += 1;
      }
    }
    const max = Math.max(1, ...Object.values(counts));
    document.getElementById("generationTotal").textContent = `${data.length}개 예시`;
    chart.innerHTML = generations.map(generation => {
      const value = counts[generation];
      const percent = value ? Math.max(3, Math.round(value / max * 100)) : 0;
      return `<div class="bar-row" role="listitem">
        <span class="bar-label">${generation}</span>
        <div class="bar-track" role="progressbar" aria-label="${generation} 태그 항목 수" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}">
          <div class="bar-fill" style="width:${percent}%"></div>
        </div>
        <span class="bar-value">${value}건</span>
      </div>`;
    }).join("");
  } catch (error) { errorMessage(chart, error); }
}
init();