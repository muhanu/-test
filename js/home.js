import {
  loadLexicon, loadGrammar, escapeHTML, regionMeta, pickRandom, macroOf, setRegionVars
} from "./common.js";

const byId = id => document.getElementById(id);

function renderWord(card, item) {
  const meta = regionMeta(macroOf(item));
  const example = (item.example_sentences || [])[0];
  const place = item.region?.city || item.region?.province || "";
  card.querySelector(".word-card-head .region-pill").textContent = meta ? meta.name : "지역 미확인";
  card.querySelector(".word-card-head .region-pill").setAttribute("style", "");
  card.querySelector(".word-dialect").textContent = item.dialect_form;
  card.querySelector(".word-standard").textContent = `표준어 · ${item.standard_form}`;
  card.querySelector(".word-meaning").textContent = item.meaning;
  const exampleBox = card.querySelector(".word-example");
  if (example) {
    exampleBox.hidden = false;
    exampleBox.querySelector("strong").textContent = example.dialect;
    exampleBox.querySelector("span").textContent = `→ ${example.standard}`;
  } else {
    exampleBox.hidden = true;
  }
  card.querySelector(".word-card-foot small").textContent = place
    ? `${place} · ${(item.generation || []).join(" · ") || "세대 미상"}`
    : "지역 미확인";
  const more = card.querySelector(".word-more");
  if (more) more.href = `dictionary.html?q=${encodeURIComponent(item.dialect_form)}`;
  setRegionVars(card, macroOf(item));
}

async function init() {
  const card = byId("wordCard");
  const shuffle = byId("shuffleWord");

  try {
    const [words, grammar] = await Promise.all([loadLexicon(), loadGrammar()]);
    const stats = {
      words: words.length,
      grammar: grammar.length,
      regions: new Set(words.map(macroOf).filter(Boolean)).size,
      examples: words.reduce((sum, item) => sum + (item.example_sentences || []).length, 0)
    };
    Object.entries(stats).forEach(([key, value]) => {
      const node = document.querySelector(`[data-stat="${key}"]`);
      if (node) node.textContent = value;
    });

    document.querySelectorAll("[data-region-count]").forEach(node => {
      const key = node.getAttribute("data-region-count");
      node.textContent = `${words.filter(item => macroOf(item) === key).length}개 어휘`;
    });

    if (card && words.length) {
      let current = pickRandom(words, 1)[0];
      renderWord(card, current);
      const swap = () => {
        const pool = words.filter(item => item.id !== current.id);
        current = pickRandom(pool.length ? pool : words, 1)[0];
        const body = card.querySelector(".word-card-body");
        body.classList.add("is-swapping");
        window.setTimeout(() => {
          renderWord(card, current);
          body.classList.remove("is-swapping");
        }, 160);
      };
      shuffle?.addEventListener("click", swap);
    }
  } catch (error) {
    console.error(error);
    document.querySelectorAll("[data-stat]").forEach(node => { node.textContent = "—"; });
    document.querySelectorAll("[data-region-count]").forEach(node => { node.textContent = "확인 불가"; });
    if (card) {
      card.querySelector(".word-dialect").textContent = "자료 오류";
      card.querySelector(".word-standard").textContent = "잠시 후 다시 시도해 주세요";
      card.querySelector(".word-meaning").textContent = "";
      card.querySelector(".word-example").hidden = true;
    }
  }
}

init();
