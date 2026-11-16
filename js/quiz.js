import {
  loadLexicon, escapeHTML, regionMeta, macroOf, pickRandom, REGIONS, errorMessage
} from "./common.js";

const ROUND = 5;
const byId = id => document.getElementById(id);
const area = byId("quizArea");

let data = [];
let pool = [];
let region = "";
let questions = [];
let index = 0;
let score = 0;
let answered = false;

const state = { locked: false };

/* 받침에 따라 주격 보조사 은/는을 고른다. */
function topicParticle(word) {
  const chars = [...String(word)];
  const last = chars.length ? chars[chars.length - 1] : "";
  const code = last.charCodeAt(0);
  const hasBatchim = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
  return hasBatchim ? "은" : "는";
}

function buildQuestion(item) {
  const type = Math.random() < 0.58 ? "meaning" : "region";
  if (type === "meaning") {
    const wrong = data
      .filter(other => other.id !== item.id && other.standard_form !== item.standard_form)
      .map(other => other.standard_form);
    const options = pickRandom([...new Set(wrong)], 3);
    options.push(item.standard_form);
    return {
      type,
      item,
      prompt: `‘${item.dialect_form}’의 표준어는 무엇일까요?`,
      hint: `${regionMeta(macroOf(item))?.name || "권역 미확인"} · ${item.region?.city || ""}`,
      options: pickRandom(options, options.length),
      answer: item.standard_form
    };
  }
  const others = REGIONS.filter(other => other.key !== macroOf(item)).map(other => other.name);
  const options = pickRandom(others, 3);
  options.push(regionMeta(macroOf(item))?.name || "지역 미확인");
  return {
    type,
    item,
    prompt: `‘${item.dialect_form}’${topicParticle(item.dialect_form)} 어느 권역의 말일까요?`,
    hint: `표준어 · ${item.standard_form}`,
    options: pickRandom(options, options.length),
    answer: regionMeta(macroOf(item))?.name || "지역 미확인"
  };
}

function newRound() {
  pool = data.filter(item => !region || macroOf(item) === region);
  const picked = pickRandom(pool, Math.min(ROUND, pool.length));
  questions = picked.map(buildQuestion);
  index = 0;
  score = 0;
  answered = false;
  state.locked = false;
  renderQuestion();
}

function renderTop() {
  byId("quizProgressText").textContent = `${Math.min(index + 1, questions.length)} / ${questions.length}`;
  byId("quizScore").textContent = `${score}점`;
  byId("quizFill").style.width = `${(index / questions.length) * 100}%`;
}

function renderQuestion() {
  if (!questions.length) {
    area.innerHTML = '<p class="empty-state">문제를 만들 자료가 없습니다.</p>';
    return;
  }
  answered = false;
  state.locked = false;
  renderTop();
  const question = questions[index];
  const meta = regionMeta(macroOf(question.item));

  area.innerHTML = `<section class="quiz-card" aria-live="polite">
    <span class="quiz-kicker">${question.type === "meaning" ? "뜻 맞히기" : "지역 맞히기"}</span>
    <h2 class="quiz-question">${escapeHTML(question.prompt)}</h2>
    <p class="quiz-hint" style="color:${meta ? meta.color : "var(--muted)"}">${escapeHTML(question.hint)}</p>
    <div class="quiz-options" role="group" aria-label="보기">
      ${question.options.map((option, i) => `<button class="quiz-option" type="button" data-option="${escapeHTML(option)}">
        <span class="idx">${i + 1}</span><span>${escapeHTML(option)}</span>
      </button>`).join("")}
    </div>
    <div id="quizFeedback"></div>
    <div class="quiz-actions"><button class="btn-primary" id="quizNext" type="button" hidden>${index + 1 === questions.length ? "결과 보기" : "다음 문제"} →</button></div>
  </section>`;

  area.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => answer(button));
  });
  byId("quizNext").addEventListener("click", next);
}

function answer(button) {
  if (answered || state.locked) return;
  answered = true;
  state.locked = true;
  const question = questions[index];
  const chosen = button.getAttribute("data-option");
  const correct = chosen === question.answer;
  if (correct) score += 1;

  area.querySelectorAll(".quiz-option").forEach(option => {
    const value = option.getAttribute("data-option");
    option.disabled = true;
    if (value === question.answer) option.classList.add("is-correct");
    else if (value === chosen) option.classList.add("is-wrong");
    else option.classList.add("is-dim");
  });

  const example = (question.item.example_sentences || [])[0];
  const meta = regionMeta(macroOf(question.item));
  byId("quizFeedback").innerHTML = `<div class="quiz-feedback">
    <strong style="color:${correct ? "var(--accent)" : "var(--danger)"}">${correct ? "정답입니다" : "아쉽게 틀렸습니다"}</strong>
    <p>${escapeHTML(question.item.dialect_form)} — ${escapeHTML(question.item.meaning)}</p>
    <p class="fb-example">${meta ? `${escapeHTML(meta.name)} · ` : ""}표준어 ‘${escapeHTML(question.item.standard_form)}’${example ? ` · ${escapeHTML(example.dialect)} → ${escapeHTML(example.standard)}` : ""}</p>
  </div>`;
  byId("quizNext").hidden = false;
  byId("quizNext").focus({ preventScroll: true });
  renderTop();
  byId("quizFill").style.width = `${((index + 1) / questions.length) * 100}%`;
}

function next() {
  if (index + 1 >= questions.length) {
    renderResult();
    return;
  }
  index += 1;
  renderQuestion();
}

function renderResult() {
  const total = questions.length;
  const perfect = score === total;
  const message = perfect
    ? "다섯 문제를 모두 맞혔습니다. 권역별 어형이 확실히 잡혀 있네요."
    : score >= Math.ceil(total * 0.6)
      ? "좋습니다. 틀린 문제의 예문을 사전에서 다시 확인해 보세요."
      : "사전의 권역별 항목을 훑어보면 다음 라운드가 쉬워집니다.";

  byId("quizProgressText").textContent = "라운드 종료";
  byId("quizFill").style.width = "100%";
  byId("quizScore").textContent = `${score}점`;
  area.innerHTML = `<section class="quiz-card quiz-result">
    <p class="score">${score}<small> / ${total}</small></p>
    <h2>${perfect ? "만점입니다" : "라운드 결과"}</h2>
    <p>${escapeHTML(message)}</p>
    <div class="btn-row">
      <button class="btn-primary" id="quizRetry" type="button">같은 권역으로 다시 풀기</button>
      <a class="ghost-btn" href="dictionary.html${region ? `?region=${encodeURIComponent(region)}` : ""}" style="display:inline-flex;align-items:center;text-decoration:none">사전에서 복습하기</a>
    </div>
  </section>`;
  byId("quizRetry").addEventListener("click", newRound);
  byId("quizRetry").focus({ preventScroll: true });
}

function syncChips() {
  document.querySelectorAll("[data-quiz-region]").forEach(chip => {
    const key = chip.getAttribute("data-quiz-region");
    chip.setAttribute("aria-pressed", String(key === region));
  });
}

async function init() {
  try {
    data = await loadLexicon();
    const paramRegion = new URLSearchParams(location.search).get("region");
    if (paramRegion && REGIONS.some(r => r.key === paramRegion)) region = paramRegion;
    syncChips();
    newRound();

    document.querySelectorAll("[data-quiz-region]").forEach(chip => {
      chip.addEventListener("click", () => {
        region = chip.getAttribute("data-quiz-region") || "";
        syncChips();
        newRound();
      });
    });
  } catch (error) {
    errorMessage(area, error);
  }
}

init();
