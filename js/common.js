export async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Expected a JSON array: ${path}`);
  return data;
}

export const loadLexicon = () => loadJSON("data/lexicon.json");
export const loadGrammar = () => loadJSON("data/grammar.json");

export function escapeHTML(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function verifiedBadge(item) {
  return item?.source?.verified === false
    ? '<span class="badge-unverified">검증 필요</span>'
    : "";
}

export function tagHtml(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
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
  const message = document.createElement("p");
  message.className = "error-state";
  message.textContent = "자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  node.replaceChildren(message);
  console.error(error);
}