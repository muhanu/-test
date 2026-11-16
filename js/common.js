/* 공통 유틸리티 · 데이터 로더 */

export const REGIONS = [
  { key: "경상", short: "경상", name: "경상 권역", sub: "경남 · 경북 · 부산 · 대구", color: "#6aa8ff", soft: "#131f2e", sample: "어데" },
  { key: "전라", short: "전라", name: "전라 권역", sub: "전남 · 전북 · 광주", color: "#ff8f6b", soft: "#2a1a15", sample: "거시기" },
  { key: "충청", short: "충청", name: "충청 권역", sub: "충남 · 충북 · 대전", color: "#8ed896", soft: "#152318", sample: "그려" },
  { key: "강원", short: "강원", name: "강원 권역", sub: "영서 · 영동", color: "#b49bff", soft: "#1f1a2b", sample: "강냉이" },
  { key: "제주", short: "제주", name: "제주 권역", sub: "제주어", color: "#f2c264", soft: "#262013", sample: "하영" }
];

export const REGION_KEYS = REGIONS.map(region => region.key);
export const GENERATIONS = ["청소년", "청년", "중년", "노년"];
export const CATEGORY_LABELS = { lexical: "어휘", grammatical: "문법" };

export function regionMeta(key) {
  return REGIONS.find(region => region.key === key) || null;
}

export function regionStyle(macro) {
  const meta = regionMeta(macro);
  return meta ? `--region-color:${meta.color};--region-soft:${meta.soft}` : "";
}

export function loadJSON(path) {
  return fetch(path, { cache: "no-cache" }).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
    return response.json();
  }).then(data => {
    if (!Array.isArray(data)) throw new Error(`Expected a JSON array: ${path}`);
    return data;
  });
}

export const loadLexicon = () => loadJSON("data/lexicon.json");
export const loadGrammar = () => loadJSON("data/grammar.json");
export const loadCompare = () => loadJSON("data/compare.json");

export function escapeHTML(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function normalize(value) {
  return String(value ?? "").normalize("NFC").toLocaleLowerCase("ko-KR").trim();
}

export function verifiedBadge(item) {
  if (item?.source?.verified === true) return '<span class="badge-ok">출처 확인</span>';
  return '<span class="badge-unverified">검증 필요</span>';
}

export function tagHtml(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
}

export function regionLabel(item) {
  const region = item?.region;
  if (!region) return "지역 미확인";
  return region.city || region.province || "지역 미확인";
}

export function macroOf(item) {
  return item?.region?.macro_region || "";
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

export function setRegionVars(node, macro) {
  const meta = regionMeta(macro);
  if (!node || !meta) return;
  node.style.setProperty("--region-color", meta.color);
  node.style.setProperty("--region-soft", meta.soft);
}

export function pickRandom(list, count) {
  const pool = [...list];
  const picked = [];
  while (pool.length && picked.length < count) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked;
}

/* 현재 페이지 메뉴 표시 */
export function markCurrentNav() {
  const file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".primary-nav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === file) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

markCurrentNav();
