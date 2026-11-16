/* 공통 유틸리티 · 데이터 로더 · 권역 표기 */

export const REGIONS = [
  {
    key: "경상", name: "경상", sub: "경남 · 경북 · 부산 · 대구",
    ink: "#2C4F4A", tint: "#EDF2F0", line: "#D3E0DC",
    words: ["어데", "억수로", "마이", "뭐라카노"]
  },
  {
    key: "전라", name: "전라", sub: "전남 · 전북 · 광주",
    ink: "#6E4032", tint: "#F7EFEB", line: "#E3D2C9",
    words: ["거시기", "시방", "쪼매", "을매나"]
  },
  {
    key: "충청", name: "충청", sub: "충남 · 충북 · 대전",
    ink: "#5A4F3C", tint: "#F3F0E7", line: "#DCD5C4",
    words: ["그려", "응게", "거그", "여그"]
  },
  {
    key: "강원", name: "강원", sub: "영서 · 영동",
    ink: "#3F4A5F", tint: "#EEF1F6", line: "#D5DCE7",
    words: ["강냉이", "올갱이", "달구지", "아재"]
  },
  {
    key: "제주", name: "제주", sub: "제주어",
    ink: "#7A5223", tint: "#F7F1E5", line: "#E4D7BF",
    words: ["하영", "혼저", "무사", "감저"]
  }
];

export const REGION_KEYS = REGIONS.map(region => region.key);
export const GENERATIONS = ["청소년", "청년", "중년", "노년"];
export const CATEGORY_LABELS = { lexical: "어휘", grammatical: "문법" };

export function regionMeta(key) {
  return REGIONS.find(region => region.key === key) || null;
}

export function regionStyle(macro) {
  const meta = regionMeta(macro);
  if (!meta) return "";
  return `--region-ink:${meta.ink};--region-tint:${meta.tint};--region-line:${meta.line}`;
}

export function regionTag(macro) {
  const meta = regionMeta(macro);
  const label = meta ? meta.name : "지역 미확인";
  return `<span class="tag tag-region" style="${regionStyle(macro)}">${escapeHTML(label)}</span>`;
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
  if (item?.source?.verified === true) return '<span class="badge badge-ok">출처 확인</span>';
  return '<span class="badge">검증 필요</span>';
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
    && /^audio\/[\w./%-]+\.mp3$/i.test(file)
    && !file.includes("..");
}

export function errorMessage(target, error) {
  const node = typeof target === "string" ? document.getElementById(target) : target;
  if (!node) return;
  const message = document.createElement("p");
  message.className = "state is-error";
  message.textContent = "자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  node.replaceChildren(message);
  console.error(error);
}

export function setRegionVars(node, macro) {
  const meta = regionMeta(macro);
  if (!node || !meta) return;
  node.style.setProperty("--region-ink", meta.ink);
  node.style.setProperty("--region-tint", meta.tint);
  node.style.setProperty("--region-line", meta.line);
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
