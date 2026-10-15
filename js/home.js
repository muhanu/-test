import { loadLexicon, loadGrammar } from "./common.js";

async function init() {
  const wordCount = document.querySelector('[data-stat="words"]');
  const grammarCount = document.querySelector('[data-stat="grammar"]');
  try {
    const [words, grammar] = await Promise.all([loadLexicon(), loadGrammar()]);
    wordCount.textContent = words.length;
    grammarCount.textContent = grammar.length;
  } catch (error) {
    wordCount.textContent = "—";
    grammarCount.textContent = "—";
    console.error(error);
  }
}
init();