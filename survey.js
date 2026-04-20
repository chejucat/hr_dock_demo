import { FACTOR_NORMS, LIKERT_SCORES, getSurveyById } from "./survey-data.js";

const storageKeys = {
  flash: "hrdock-flash-message",
  draftPrefix: "hrdock-survey-draft-",
  resultPrefix: "hrdock-survey-result-"
};

const SECTION_SIZE = 10;

const surveyTitleEl = document.getElementById("surveyTitle");
const surveyDescriptionEl = document.getElementById("surveyDescription");
const surveyInstructionEl = document.getElementById("surveyInstruction");
const surveyModeTagEl = document.getElementById("surveyModeTag");
const surveyDueEl = document.getElementById("surveyDue");
const surveyTimeEl = document.getElementById("surveyTime");
const surveyProgressTextEl = document.getElementById("surveyProgressText");
const progressLabelEl = document.getElementById("progressLabel");
const progressBarEl = document.getElementById("progressBar");
const sectionTagEl = document.getElementById("sectionTag");
const sectionTitleEl = document.getElementById("sectionTitle");
const likertHeadRowEl = document.getElementById("likertHeadRow");
const likertBodyEl = document.getElementById("likertBody");
const mobileLikertListEl = document.getElementById("mobileLikertList");
const freeformListEl = document.getElementById("freeformList");
const pagerInfoEl = document.getElementById("pagerInfo");
const prevSectionButtonEl = document.getElementById("prevSectionButton");
const nextSectionButtonEl = document.getElementById("nextSectionButton");
const statusMessageEl = document.getElementById("statusMessage");
const backButtonEl = document.getElementById("backButton");
const saveButtonEl = document.getElementById("saveButton");
const submitButtonEl = document.getElementById("submitButton");

const params = new URLSearchParams(window.location.search);
const surveyId = params.get("survey");
const mode = params.get("mode") || "start";
const survey = getSurveyById(surveyId);
const draftKey = `${storageKeys.draftPrefix}${survey.id}`;
const resultKey = `${storageKeys.resultPrefix}${survey.id}`;

const sections = splitSections(survey.questions, SECTION_SIZE);

let currentSectionIndex = 0;
let responses = loadDraftResponses();

function splitSections(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function loadDraftResponses() {
  const raw = localStorage.getItem(draftKey);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed.responses && typeof parsed.responses === "object" ? parsed.responses : {};
  } catch (_error) {
    return {};
  }
}

function saveDraftResponses() {
  localStorage.setItem(
    draftKey,
    JSON.stringify({
      surveyId: survey.id,
      responses,
      updatedAt: new Date().toISOString()
    })
  );
}

function getCurrentSection() {
  return sections[currentSectionIndex] || [];
}

function getQuestionIndex(question) {
  return survey.questions.indexOf(question);
}

function getAnsweredCount() {
  return survey.questions.filter((question, index) => {
    const value = responses[index];
    if (question.type === "choice") {
      return value !== undefined && value !== null && value !== "";
    }
    return String(value || "").trim() !== "";
  }).length;
}

function getProgressPercent() {
  return Math.round((getAnsweredCount() / survey.questions.length) * 100);
}

function updateProgress() {
  const answered = getAnsweredCount();
  const percent = getProgressPercent();
  surveyProgressTextEl.textContent = `進捗: ${answered} / ${survey.questions.length} 問`;
  progressLabelEl.textContent = `${percent}%`;
  progressBarEl.style.width = `${percent}%`;
}

function renderLikertTable(likertQuestions) {
  likertHeadRowEl.innerHTML = "";
  likertBodyEl.innerHTML = "";
  mobileLikertListEl.innerHTML = "";

  if (!likertQuestions.length) {
    return;
  }

  const scaleLabels = likertQuestions[0].choices;
  likertHeadRowEl.innerHTML = `
    <th>設問</th>
    ${scaleLabels.map((label) => `<th>${label}</th>`).join("")}
  `;

  likertQuestions.forEach((question) => {
    const absoluteIndex = getQuestionIndex(question);
    const currentValue = Number.isInteger(responses[absoluteIndex]) ? responses[absoluteIndex] : null;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${question.title}</td>
      ${scaleLabels
        .map(
          (label, choiceIndex) => `
            <td class="likert-choice">
              <input type="radio" name="likert-${absoluteIndex}" value="${choiceIndex}" ${currentValue === choiceIndex ? "checked" : ""} aria-label="${label}" />
            </td>
          `
        )
        .join("")}
    `;
    row.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        responses[absoluteIndex] = Number(input.value);
        saveDraftResponses();
        updateProgress();
      });
    });
    likertBodyEl.appendChild(row);

    const mobileCard = document.createElement("article");
    mobileCard.className = "mobile-likert-card";
    mobileCard.innerHTML = `
      <span class="tag">質問 ${absoluteIndex + 1}</span>
      <h3 style="margin: 10px 0 0; color: #173630; font-size: 1.02rem;">${question.title}</h3>
      <div class="mobile-choice-grid">
        ${scaleLabels
          .map(
            (label, choiceIndex) => `
              <label class="mobile-choice-item">
                <input type="radio" name="mobile-likert-${absoluteIndex}" value="${choiceIndex}" ${currentValue === choiceIndex ? "checked" : ""} />
                <span>${label}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
    mobileCard.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        responses[absoluteIndex] = Number(input.value);
        saveDraftResponses();
        updateProgress();
      });
    });
    mobileLikertListEl.appendChild(mobileCard);
  });
}

function renderTextQuestions(textQuestions) {
  freeformListEl.innerHTML = "";

  textQuestions.forEach((question) => {
    const absoluteIndex = getQuestionIndex(question);
    const card = document.createElement("article");
    card.className = "question-card";
    card.innerHTML = `
      <span class="tag">自由記述</span>
      <h3>${question.title}</h3>
      <textarea class="survey-textarea" placeholder="自由にご記入ください">${responses[absoluteIndex] || ""}</textarea>
    `;
    const textarea = card.querySelector("textarea");
    textarea.addEventListener("input", () => {
      responses[absoluteIndex] = textarea.value;
      saveDraftResponses();
      updateProgress();
    });
    freeformListEl.appendChild(card);
  });
}

function renderSection() {
  const sectionQuestions = getCurrentSection();
  const firstIndex = currentSectionIndex * SECTION_SIZE + 1;
  const lastIndex = firstIndex + sectionQuestions.length - 1;

  sectionTagEl.textContent = `Section ${currentSectionIndex + 1}`;
  sectionTitleEl.textContent = `設問 ${firstIndex} - ${lastIndex}`;
  pagerInfoEl.textContent = `Section ${currentSectionIndex + 1} / ${sections.length}`;

  renderLikertTable(sectionQuestions.filter((question) => question.type === "choice"));
  renderTextQuestions(sectionQuestions.filter((question) => question.type === "text"));

  prevSectionButtonEl.disabled = currentSectionIndex === 0;
  prevSectionButtonEl.style.opacity = currentSectionIndex === 0 ? "0.45" : "1";
  prevSectionButtonEl.style.cursor = currentSectionIndex === 0 ? "not-allowed" : "pointer";

  nextSectionButtonEl.disabled = currentSectionIndex === sections.length - 1;
  nextSectionButtonEl.style.opacity = currentSectionIndex === sections.length - 1 ? "0.45" : "1";
  nextSectionButtonEl.style.cursor = currentSectionIndex === sections.length - 1 ? "not-allowed" : "pointer";
}

function validateChoiceQuestions() {
  const unanswered = survey.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question, index }) => question.type === "choice" && !Number.isInteger(responses[index]));

  if (unanswered.length) {
    statusMessageEl.textContent = `未回答の尺度設問があります。少なくとも質問 ${unanswered[0].index + 1} を確認してください。`;
    return false;
  }

  return true;
}

function calculateFactorResults() {
  const buckets = {};

  survey.questions.forEach((question, index) => {
    if (question.type !== "choice" || !question.factor || !Number.isInteger(responses[index])) {
      return;
    }

    if (!buckets[question.factor]) {
      buckets[question.factor] = [];
    }

    buckets[question.factor].push(LIKERT_SCORES[responses[index]]);
  });

  return Object.entries(buckets).map(([factor, values]) => {
    const rawMean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const adjustedMean = factor === "リテンション志向" ? 6 - rawMean : rawMean;
    const norm = FACTOR_NORMS[factor];
    const standardized = norm ? (adjustedMean - norm.mean) / norm.sd : null;

    return {
      factor,
      itemCount: values.length,
      rawMean: Number(rawMean.toFixed(3)),
      adjustedMean: Number(adjustedMean.toFixed(3)),
      standardizedScore: standardized === null ? null : Number(standardized.toFixed(3)),
      reversed: factor === "リテンション志向"
    };
  });
}

function calculatePredictedScores(factors) {
  const scoreMap = Object.fromEntries(
    factors.map((factor) => [factor.factor, factor.standardizedScore ?? 0])
  );

  const organizationalContribution =
    0.267 * (scoreMap["リーダーシップ"] ?? 0) +
    0.216 * (scoreMap["業務評価"] ?? 0) +
    0.133 * (scoreMap["チャレンジ精神"] ?? 0) +
    0.161 * (scoreMap["ポジティブ思考"] ?? 0);

  const organizationalAffinity =
    0.428 * (scoreMap["組織愛着"] ?? 0) +
    0.174 * (scoreMap["意欲"] ?? 0) +
    0.149 * (scoreMap["組織維持行動"] ?? 0) -
    0.181 * (scoreMap["リテンション志向"] ?? 0);

  return {
    organizationalContribution: Number(organizationalContribution.toFixed(3)),
    organizationalAffinity: Number(organizationalAffinity.toFixed(3))
  };
}

function calculateWho5Score() {
  if (survey.id !== "onboarding") {
    return null;
  }

  const total = survey.questions.reduce((sum, _question, index) => {
    if (!Number.isInteger(responses[index])) {
      return sum;
    }

    return sum + (5 - responses[index]);
  }, 0);

  return {
    rawTotal: total,
    scaledScore: total * 4
  };
}

function calculateWorkEngagementScores() {
  if (survey.id !== "one-on-one") {
    return null;
  }

  const itemMeans = [2.798676749, 3.24669187, 2.46880907, 2.417769376, 3.26654064, 3.28071834, 3.30056711, 2.71833648, 3.330812854];
  const itemSds = [0.886848964, 0.90399942, 0.88436893, 0.888567344, 0.81852115, 0.90348342, 0.94479955, 0.98766699, 0.976188869];

  const zScores = survey.questions.map((_question, index) => {
    const itemScore = Number.isInteger(responses[index]) ? responses[index] + 1 : null;
    if (itemScore === null) {
      return 0;
    }
    return (itemScore - itemMeans[index]) / itemSds[index];
  });

  const vitality =
    0.2045 * zScores[0] +
    0.0875 * zScores[1] +
    0.3398 * zScores[2] +
    0.3246 * zScores[3] +
    0.0146 * zScores[4] +
    0.0029 * zScores[5] -
    0.0041 * zScores[6] +
    0.1155 * zScores[7] +
    0.0032 * zScores[8];

  const enthusiasm =
    0.0162 * zScores[0] +
    0.067 * zScores[1] -
    0.0024 * zScores[2] +
    0.0161 * zScores[3] +
    0.7515 * zScores[4] +
    0.0695 * zScores[5] +
    0.1142 * zScores[6] +
    0.0004 * zScores[7] +
    0.0357 * zScores[8];

  const absorption =
    0.111 * zScores[0] +
    0.0764 * zScores[1] -
    0.0319 * zScores[2] +
    0.0337 * zScores[3] +
    0.0452 * zScores[4] +
    0.0429 * zScores[5] +
    0.3142 * zScores[6] +
    0.2396 * zScores[7] +
    0.2816 * zScores[8];

  return {
    vitality: Number(vitality.toFixed(3)),
    absorption: Number(enthusiasm.toFixed(3)),
    enthusiasm: Number(absorption.toFixed(3)),
    zScores: zScores.map((score) => Number(score.toFixed(3)))
  };
}

function saveResult(result) {
  localStorage.setItem(resultKey, JSON.stringify(result));
}

function goBack(message) {
  if (message) {
    localStorage.setItem(storageKeys.flash, JSON.stringify({ message, type: "success" }));
  }
  window.location.href = "./index.html";
}

function goToResult() {
  window.location.href = `./result.html?survey=${encodeURIComponent(survey.id)}`;
}

function initializePage() {
  surveyTitleEl.textContent = survey.title;
  surveyDescriptionEl.textContent = survey.description;
  surveyInstructionEl.textContent = survey.instruction || "";
  surveyInstructionEl.style.display = survey.instruction ? "block" : "none";
  surveyModeTagEl.textContent = mode === "resume" ? "続きから回答" : "回答開始";
  surveyDueEl.textContent = `回答日: ${survey.due}`;
  surveyTimeEl.textContent = `想定時間: ${survey.estimatedTime}`;
  updateProgress();
  renderSection();
}

backButtonEl.addEventListener("click", () => {
  window.location.href = "./index.html";
});

prevSectionButtonEl.addEventListener("click", () => {
  if (currentSectionIndex > 0) {
    currentSectionIndex -= 1;
    renderSection();
  }
});

nextSectionButtonEl.addEventListener("click", () => {
  if (currentSectionIndex < sections.length - 1) {
    currentSectionIndex += 1;
    renderSection();
  }
});

saveButtonEl.addEventListener("click", () => {
  saveDraftResponses();
  statusMessageEl.textContent = "下書きを保存しました。ポータルへ戻ります。";
  setTimeout(() => goBack("下書きを保存しました。あとで続きから回答できます。"), 300);
});

submitButtonEl.addEventListener("click", () => {
  if (!validateChoiceQuestions()) {
    return;
  }

  const factorResults = calculateFactorResults();
  const result = {
    surveyId: survey.id,
    surveyTitle: survey.title,
    completedAt: new Date().toISOString(),
    answeredCount: getAnsweredCount(),
    totalCount: survey.questions.length,
    factors: factorResults,
    predictedScores: calculatePredictedScores(factorResults),
    who5Score: calculateWho5Score(),
    workEngagementScores: calculateWorkEngagementScores()
  };

  saveResult(result);
  localStorage.removeItem(draftKey);
  localStorage.setItem(storageKeys.flash, JSON.stringify({ message: "回答を送信しました。ありがとうございました。", type: "success" }));
  statusMessageEl.textContent = "回答を送信しました。結果画面へ移動します。";
  setTimeout(() => goToResult(), 300);
});

initializePage();
