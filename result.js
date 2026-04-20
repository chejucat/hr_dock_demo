import { getSurveyById } from "./survey-data.js";

const storageKeys = {
  resultPrefix: "hrdock-survey-result-"
};

const WHO5_REFERENCE_ROWS = [
  { displayName: "日本若年成人", group: "日本18〜39歳", mean: 52.8, sd: 21.6 },
  { displayName: "日本高齢者", group: "地域在住高齢者", mean: 65.8, sd: 23.2 },
  { displayName: "海外一般成人", group: "ドイツ一般成人", mean: 67.6, sd: 23.0 },
  { displayName: "専門職", group: "医療専門職", mean: 71.7, sd: 14.7 },
  { displayName: "教育職", group: "学校教員サンプル", mean: 66.6, sd: 18.2 },
  { displayName: "高負荷職", group: "COVID期看護師", mean: 52.0, sd: 20.4 }
];

const params = new URLSearchParams(window.location.search);
const surveyId = params.get("survey");
const survey = getSurveyById(surveyId);
const resultKey = `${storageKeys.resultPrefix}${survey.id}`;
const rawResult = localStorage.getItem(resultKey);
const result = rawResult ? JSON.parse(rawResult) : null;

const resultTitleEl = document.getElementById("resultTitle");
const resultDescriptionEl = document.getElementById("resultDescription");
const completedAtEl = document.getElementById("completedAt");
const answeredCountEl = document.getElementById("answeredCount");
const factorCountEl = document.getElementById("factorCount");
const organizationalContributionEl = document.getElementById("organizationalContribution");
const organizationalAffinityEl = document.getElementById("organizationalAffinity");
const resultTableBodyEl = document.getElementById("resultTableBody");
const backButtonEl = document.getElementById("backButton");
const metaLabelEls = document.querySelectorAll(".meta-card span");
const resultHeadEls = document.querySelectorAll("thead th");
const resultNoteEl = document.querySelector(".note");

function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ja-JP");
}

function toDeviationScore(standardizedScore) {
  if (typeof standardizedScore !== "number" || Number.isNaN(standardizedScore)) {
    return null;
  }
  return standardizedScore * 10 + 50;
}

function calculatePredictedScoresFromFactors(factors) {
  const scoreMap = Object.fromEntries(
    (factors || []).map((factor) => [factor.factor, factor.standardizedScore ?? 0])
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

function getWorkEngagementScores() {
  const storedScores = result?.workEngagementScores || null;
  const zScores = Array.isArray(storedScores?.zScores) ? storedScores.zScores : null;

  if (!zScores || zScores.length < 9) {
    return storedScores || {
      vitality: 0,
      absorption: 0,
      enthusiasm: 0,
      zScores: []
    };
  }

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

  const absorption =
    0.0162 * zScores[0] +
    0.067 * zScores[1] -
    0.0024 * zScores[2] +
    0.0161 * zScores[3] +
    0.7515 * zScores[4] +
    0.0695 * zScores[5] +
    0.1142 * zScores[6] +
    0.0004 * zScores[7] +
    0.0357 * zScores[8];

  const enthusiasm =
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
    absorption: Number(absorption.toFixed(3)),
    enthusiasm: Number(enthusiasm.toFixed(3)),
    zScores
  };
}

function renderEmptyResult() {
  completedAtEl.textContent = "-";
  answeredCountEl.textContent = "-";
  factorCountEl.textContent = "-";
  organizationalContributionEl.textContent = "-";
  organizationalAffinityEl.textContent = "-";
  resultTableBodyEl.innerHTML = `
    <tr>
      <td colspan="4">まだ結果がありません。アンケート回答後に表示されます。</td>
    </tr>
  `;
}

function renderWho5Result() {
  const who5Score = result?.who5Score || { rawTotal: 0, scaledScore: 0 };
  const who5Status =
    who5Score.scaledScore >= 80
      ? "とても良好"
      : who5Score.scaledScore >= 70
        ? "良好"
        : who5Score.scaledScore >= 60
          ? "やや良好"
          : who5Score.scaledScore >= 50
            ? "やや注意"
            : who5Score.scaledScore >= 30
              ? "注意"
              : "強い低下の可能性";

  resultTitleEl.textContent = `${survey.title} の結果`;
  resultDescriptionEl.textContent = "回答者本人の得点と参考集団の平均・標準偏差を表示しています。";

  if (metaLabelEls[1]) metaLabelEls[1].textContent = "回答項目数";
  if (metaLabelEls[2]) metaLabelEls[2].textContent = "総計";
  if (metaLabelEls[3]) metaLabelEls[3].textContent = "100点換算";
  if (metaLabelEls[4]) metaLabelEls[4].textContent = "状態判定";

  answeredCountEl.textContent = `${result.answeredCount} / ${result.totalCount}`;
  factorCountEl.textContent = `${who5Score.rawTotal}`;
  organizationalContributionEl.textContent = `${who5Score.scaledScore}`;
  organizationalAffinityEl.textContent = who5Status;

  if (resultHeadEls[0]) resultHeadEls[0].textContent = "表示名";
  if (resultHeadEls[1]) resultHeadEls[1].textContent = "参考集団";
  if (resultHeadEls[2]) resultHeadEls[2].textContent = "平均";
  if (resultHeadEls[3]) {
    resultHeadEls[3].textContent = "SD";
    resultHeadEls[3].style.display = "";
  }

  resultTableBodyEl.innerHTML = `
    <tr>
      <td>あなた</td>
      <td>回答者本人</td>
      <td>${who5Score.scaledScore}</td>
      <td>-</td>
    </tr>
    ${WHO5_REFERENCE_ROWS.map(
      (row) => `
        <tr>
          <td>${row.displayName}</td>
          <td>${row.group}</td>
          <td>${row.mean}</td>
          <td>${row.sd}</td>
        </tr>
      `
    ).join("")}
  `;

  if (resultNoteEl) {
    resultNoteEl.textContent =
      "WHO５は各項目を 5 点から 0 点で集計し、総計に 4 を掛けて100点満点へ換算しています。本スコアは100点に近いほど精神的に安定している傾向を示しています。";
  }
}

function renderWorkEngagementResult() {
  const scores = getWorkEngagementScores();
  const vitalityDeviation = toDeviationScore(scores.vitality) ?? 50;
  const absorptionDeviation = toDeviationScore(scores.absorption) ?? 50;
  const enthusiasmDeviation = toDeviationScore(scores.enthusiasm) ?? 50;
  const chartRows = [
    { label: "活力", value: vitalityDeviation },
    { label: "没頭", value: absorptionDeviation },
    { label: "熱意", value: enthusiasmDeviation }
  ];

  resultTitleEl.textContent = `${survey.title} の結果`;
  resultDescriptionEl.textContent = "各項目の z 値をもとに、活力・没頭・熱意を偏差値として表示しています。";

  if (metaLabelEls[1]) metaLabelEls[1].textContent = "回答項目数";
  if (metaLabelEls[2]) metaLabelEls[2].textContent = "活力偏差値";
  if (metaLabelEls[3]) metaLabelEls[3].textContent = "没頭偏差値";
  if (metaLabelEls[4]) metaLabelEls[4].textContent = "熱意偏差値";

  answeredCountEl.textContent = `${result.answeredCount} / ${result.totalCount}`;
  factorCountEl.textContent = vitalityDeviation.toFixed(1);
  organizationalContributionEl.textContent = absorptionDeviation.toFixed(1);
  organizationalAffinityEl.textContent = enthusiasmDeviation.toFixed(1);

  if (resultHeadEls[0]) resultHeadEls[0].textContent = "指標";
  if (resultHeadEls[1]) resultHeadEls[1].textContent = "偏差値";
  if (resultHeadEls[2]) resultHeadEls[2].textContent = "グラフ";
  if (resultHeadEls[3]) {
    resultHeadEls[3].textContent = "";
    resultHeadEls[3].style.display = "none";
  }

  resultTableBodyEl.innerHTML = chartRows
    .map(
      (row) => `
        <tr>
          <td>${row.label}</td>
          <td>${row.value.toFixed(1)}</td>
          <td>
            <div class="score-bar-track" aria-label="${row.label} の偏差値グラフ">
              <div class="score-bar-fill" style="width: ${Math.max(0, Math.min(row.value, 100))}%;"></div>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  if (resultNoteEl) {
    resultNoteEl.textContent = "各項目は 1〜5 点として z 値化し、その z 値に係数を掛けて活力・没頭・熱意を算出しています。棒グラフの赤線は偏差値 50 の基準線です。";
  }
}

function renderFactorResult() {
  const predictedScores = result.predictedScores || calculatePredictedScoresFromFactors(result.factors);

  resultTitleEl.textContent = `${survey.title} の結果`;
  resultDescriptionEl.textContent = "各因子の平均値、偏差値、予測スコアを表示しています。";

  completedAtEl.textContent = formatDate(result.completedAt);
  answeredCountEl.textContent = `${result.answeredCount} / ${result.totalCount}`;
  factorCountEl.textContent = `${result.factors.length}`;
  organizationalContributionEl.textContent = predictedScores.organizationalContribution.toFixed(3);
  organizationalAffinityEl.textContent = predictedScores.organizationalAffinity.toFixed(3);

  if (metaLabelEls[1]) metaLabelEls[1].textContent = "回答済み項目数";
  if (metaLabelEls[2]) metaLabelEls[2].textContent = "因子数";
  if (metaLabelEls[3]) metaLabelEls[3].textContent = "組織貢献度";
  if (metaLabelEls[4]) metaLabelEls[4].textContent = "組織親和性";

  if (resultHeadEls[0]) resultHeadEls[0].textContent = "因子";
  if (resultHeadEls[1]) resultHeadEls[1].textContent = "平均値";
  if (resultHeadEls[2]) resultHeadEls[2].textContent = "偏差値";
  if (resultHeadEls[3]) {
    resultHeadEls[3].textContent = "備考";
    resultHeadEls[3].style.display = "";
  }

  resultTableBodyEl.innerHTML = result.factors
    .map(
      (factor) => `
        <tr>
          <td>${factor.factor}</td>
          <td>${factor.adjustedMean.toFixed(3)}</td>
          <td>${toDeviationScore(factor.standardizedScore) !== null ? toDeviationScore(factor.standardizedScore).toFixed(1) : "-"}</td>
          <td>${factor.reversed ? "反転得点化" : "-"}</td>
        </tr>
      `
    )
    .join("");

  if (resultNoteEl) {
    resultNoteEl.textContent =
      "リテンション志向は反転得点化後の平均値を表示しています。偏差値は標準化得点をもとに 10 × z + 50 で換算しています。";
  }
}

function renderResult() {
  if (!result) {
    renderEmptyResult();
    return;
  }

  completedAtEl.textContent = formatDate(result.completedAt);

  if (survey.id === "onboarding") {
    renderWho5Result();
    return;
  }

  if (survey.id === "one-on-one") {
    renderWorkEngagementResult();
    return;
  }

  renderFactorResult();
}

backButtonEl.addEventListener("click", () => {
  window.location.href = "./index.html";
});

renderResult();
