import { loadLexicon, errorMessage } from "./common.js";

const order = ["청소년", "청년", "중년", "노년"];
async function init() {
  const chart = document.getElementById("genChart");
  try {
    const data = await loadLexicon();
    const counts = Object.fromEntries(order.map(generation => [generation, 0]));
    data.forEach(item => (item.generation || []).forEach(generation => {
      if (Object.hasOwn(counts, generation)) counts[generation]++;
    }));
    const max = Math.max(1, ...Object.values(counts));
    document.getElementById("generationTotal").textContent = `${data.length}개 예시`;
    chart.innerHTML = order.map((generation, index) => {
      const value = counts[generation];
      const width = value ? Math.max(4, Math.round(value / max * 100)) : 0;
      return `<div class="bar-row" role="listitem">
        <span class="bar-label">${generation}</span>
        <div class="bar-track" role="progressbar" aria-label="${generation} 태그 항목 수" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}">
          <div class="bar-fill" style="width:${width}%;--bar-index:${index}"></div>
        </div><span class="bar-value">${value}건</span>
      </div>`;
    }).join("");
  } catch (error) { errorMessage(chart, error); }
}
init();