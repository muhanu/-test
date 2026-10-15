import { loadLexicon, escapeHTML, regionLabel } from "./common.js";

async function init() {
  const body = document.getElementById("compareBody");
  try {
    const data = await loadLexicon();
    if (!data.length) {
      body.innerHTML = '<tr><td colspan="5">등록된 예시가 없습니다.</td></tr>';
      return;
    }
    body.innerHTML = data.map(item => `<tr>
      <td>${escapeHTML(item.dialect_form)}</td>
      <td>${escapeHTML(item.standard_form)}</td>
      <td>${item.category === "grammatical" ? "문법" : "어휘"}</td>
      <td>${escapeHTML(item.phonological_note || item.grammatical_note || "설명 준비 중")}</td>
      <td>${escapeHTML(regionLabel(item.region))}</td>
    </tr>`).join("");
  } catch (error) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    row.append(cell);
    body.replaceChildren(row);
    console.error(error);
  }
}
init();