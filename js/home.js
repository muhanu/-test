import { loadLexicon, loadGrammar } from "./common.js";

async function init() {
  try {
    const [words, grammar] = await Promise.all([loadLexicon(), loadGrammar()]);
    document.querySelector('[data-stat="words"]').textContent = words.length;
    document.querySelector('[data-stat="grammar"]').textContent = grammar.length;
  } catch (error) {
    document.querySelectorAll(".stat-number").forEach(node => { node.textContent = "—"; });
    console.error(error);
  }
}
init();