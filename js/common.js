
async function loadLexicon() {
  const res = await fetch('data/lexicon.json');
  return await res.json();
}
async function loadGrammar() {
  const res = await fetch('data/grammar.json');
  return await res.json();
}
function verifiedBadge(item) {
  if (item.source && item.source.verified === false) {
    return '<span class="badge-unverified">검증 필요</span>';
  }
  return '';
}
function tagHtml(tags) {
  if (!tags) return '';
  return tags.map(t => `<span class="tag">${t}</span>`).join('');
}
