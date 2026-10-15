export async function loadJSON(path) {
  const response = await fetch(path, { cache: "default" });
  if (!response.ok) throw new Error(`자료를 불러오지 못했습니다 (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("자료 형식이 올바르지 않습니다.");
  return data;
}

export const loadLexicon = () => loadJSON("data/lexicon.json");
export const loadGrammar = () => loadJSON("data/grammar.json");

export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function verifiedBadge(item) {
  return item?.source?.verified === false
    ? '<span class="badge-unverified">검증 필요</span>'
    : "";
}

export function tagHtml(tags = []) {
  if (!Array.isArray(tags) || !tags.length) return "";
  return `<div class="tags">${tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>`;
}

export function regionLabel(region) {
  return region?.city || region?.province || "지역 미확인";
}

export function hasConsentedAudio(item) {
  const file = item?.audio?.file;
  return item?.audio?.consent_obtained === true
    && typeof file === "string"
    && /^audio\/[\w./-]+\.mp3$/i.test(file)
    && !file.includes("..");
}

export function errorMessage(target, error) {
  const node = typeof target === "string" ? document.getElementById(target) : target;
  if (!node) return;
  node.innerHTML = '<p class="error-state">자료를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.</p>';
  console.error(error);
}