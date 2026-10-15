import { loadLexicon, escapeHTML, regionLabel, errorMessage } from "./common.js";

async function init() {
  const tbody = document.getElementById("compareBody");
  try {
    const data = await loadLexicon();
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">아직 등록된 예시가 없습니다.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(item => `<tr>
      <td>${escapeHTML(item.dialect_form)}</td>
      <td>${escapeHTML(item.standard_form)}</td>
      <td>${item.category === "grammatical" ? "문법" : "어휘"}</td>
      <td>${escapeHTML(item.phonological_note || item.grammatical_note || "설명 준비 중")}</td>
      <td>${escapeHTML(regionLabel(item.region))}</td>
    </tr>`).join("");
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5"><p class="error-state">자료를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.</p></td></tr>';
    console.error(error);
  }
}
init();