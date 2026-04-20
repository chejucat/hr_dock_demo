const LIKERT_5 = ["とてもあてはまる", "ややあてはまる", "どちらともいえない", "あまりあてはまらない", "まったくあてはまらない"];

export const LIKERT_SCORES = [5, 4, 3, 2, 1];

export const FACTOR_NORMS = {
  チャレンジ精神: { mean: 3.338667, sd: 0.768949 },
  ポジティブ思考: { mean: 3.332, sd: 0.779457 },
  リーダーシップ: { mean: 3.1632, sd: 0.761283 },
  リテンション志向: { mean: 3.1252, sd: 0.649701 },
  意欲: { mean: 3.438, sd: 0.987126 },
  業務評価: { mean: 2.839067, sd: 0.599016 },
  組織愛着: { mean: 2.849467, sd: 0.819776 },
  組織維持行動: { mean: 3.317733, sd: 0.723348 }
};

export const surveys = [
  {
    id: "engagement",
    status: "回答受付中",
    title: "JEA scale：Work Fit Type Inventory (WFTI)",
    description: "仕事への適応感や行動傾向を把握するための質問紙です。各項目について、現在の自分にどの程度あてはまるかをお答えください。",
    due: "2026年4月15日",
    estimatedTime: "約12分",
    progress: 0,
    progressText: "未開始",
    summary: [
      { label: "回答状況", value: "未開始" },
      { label: "回答日", value: "2026年4月15日" },
      { label: "想定時間", value: "約12分" }
    ],
    questions: [
      { type: "choice", title: "目標達成のために適切な計画を立てることができる", factor: "リーダーシップ", choices: LIKERT_5 },
      { type: "choice", title: "今の仕事ができていることを誇りに感じる", factor: "意欲", choices: LIKERT_5 },
      { type: "choice", title: "自分にメリットがなくなれば今の会社は辞めると思う", factor: "リテンション志向", choices: LIKERT_5 },
      { type: "choice", title: "立場に関係なく職場の誰からの意見も柔軟に取り入れることができる", factor: "組織維持行動", choices: LIKERT_5 },
      { type: "choice", title: "今の仕事に対して高い熱意を持っている", factor: "意欲", choices: LIKERT_5 },
      { type: "choice", title: "自身の持つ知識やスキルを他者へわかりやすく教授することができる", factor: "リーダーシップ", choices: LIKERT_5 },
      { type: "choice", title: "困難な出来事も自分なら切り抜けることができると思う", factor: "ポジティブ思考", choices: LIKERT_5 },
      { type: "choice", title: "今の仕事は生き甲斐であると感じる", factor: "意欲", choices: LIKERT_5 },
      { type: "choice", title: "自身のチームメンバーが成果を出せるようにアプローチをしている", factor: "チャレンジ精神", choices: LIKERT_5 },
      { type: "choice", title: "今の職場は、自身の業務の成果や貢献を適正に評価してくれていると感じる", factor: "業務評価", choices: LIKERT_5 },
      { type: "choice", title: "会社のためであるなら多少の難題も喜んで取り組もうと思う", factor: "組織愛着", choices: LIKERT_5 },
      { type: "choice", title: "いつでも他の人をフォローできるように業務状況の把握を欠かさない", factor: "チャレンジ精神", choices: LIKERT_5 },
      { type: "choice", title: "今の職場では、明確で公正な昇給制度が整えられている", factor: "業務評価", choices: LIKERT_5 },
      { type: "choice", title: "自身を多少犠牲にしてでも今の会社に可能な限り貢献したいと思う", factor: "組織愛着", choices: LIKERT_5 },
      { type: "choice", title: "今の会社よりも自身を評価してくれる会社があるなら転職する", factor: "リテンション志向", choices: LIKERT_5 },
      { type: "choice", title: "今の職場ではどんなに多大な貢献をしたとしても、給与などにはほとんど反映されない", factor: "業務評価", choices: LIKERT_5 },
      { type: "choice", title: "課題を解決するための新しい方略を考え出すことが得意だ", factor: "リーダーシップ", choices: LIKERT_5 },
      { type: "choice", title: "自身の要望に沿った報酬を得ることができていると思う", factor: "業務評価", choices: LIKERT_5 },
      { type: "choice", title: "誰かが困っている時には援助を惜しまない", factor: "組織維持行動", choices: LIKERT_5 },
      { type: "choice", title: "今の会社に勤めていることを誇りに思っている", factor: "組織愛着", choices: LIKERT_5 },
      { type: "choice", title: "自分が求められている成果以上のものを出そうとする", factor: "チャレンジ精神", choices: LIKERT_5 },
      { type: "choice", title: "今の会社は自身のキャリアアップのための経験の場であると思っている", factor: "リテンション志向", choices: LIKERT_5 },
      { type: "choice", title: "誰かが成果を出した時には、言葉に出して称賛したり褒めたりする", factor: "組織維持行動", choices: LIKERT_5 },
      { type: "choice", title: "チームで業務に取り組む際に、各人の進捗を正確に把握している", factor: "リーダーシップ", choices: LIKERT_5 },
      { type: "choice", title: "もらえている報酬以上の仕事はしない", factor: "リテンション志向", choices: LIKERT_5 },
      { type: "choice", title: "職場の人たちを信頼している", factor: "組織維持行動", choices: LIKERT_5 },
      { type: "choice", title: "自信のない仕事を頼まれても、最終的にはなんとかこなせるものだと思う", factor: "ポジティブ思考", choices: LIKERT_5 },
      { type: "choice", title: "期待される以上の成果を出せるよう常にチャレンジしている", factor: "チャレンジ精神", choices: LIKERT_5 },
      { type: "choice", title: "業務を円滑に遂行するための適切な指示命令をすることができる", factor: "リーダーシップ", choices: LIKERT_5 },
      { type: "choice", title: "大抵の問題はなんとかなると思っている", factor: "ポジティブ思考", choices: LIKERT_5 },
      { type: "choice", title: "誰とでも気さくに話すことができる", factor: "組織維持行動", choices: LIKERT_5 },
      { type: "choice", title: "他の人が考えつかないようなことをできないか常に考えている", factor: "チャレンジ精神", choices: LIKERT_5 },
      { type: "choice", title: "今の職場に対して他の職場以上に愛着をもっている", factor: "組織愛着", choices: LIKERT_5 },
      { type: "choice", title: "自身の報酬についてある程度交渉をすることができる", factor: "業務評価", choices: LIKERT_5 },
      { type: "choice", title: "どのようなことがあっても、自分は基本的に自分の会社の擁護をすると思う", factor: "組織愛着", choices: LIKERT_5 },
      { type: "choice", title: "より良い転職先を常に探している", factor: "リテンション志向", choices: LIKERT_5 }
    ]
  },
  {
    id: "onboarding",
    status: "新着",
    title: "オンボーディング体験アンケート",
    description: "入社初月の受け入れ体験や、不安の有無を確認するためのアンケートです。",
    due: "2026年4月12日",
    estimatedTime: "約5分",
    progress: 0,
    progressText: "未開始",
    summary: [
      { label: "回答状況", value: "未開始" },
      { label: "締切", value: "4月12日 17:00" },
      { label: "想定時間", value: "約5分" }
    ],
    questions: [
      { type: "choice", title: "入社時の案内は分かりやすかったですか。", choices: ["とても分かりやすい", "分かりやすい", "普通", "分かりづらい"] },
      { type: "choice", title: "初日の受け入れ体験について満足していますか。", choices: ["とても満足", "満足", "やや不満", "不満"] },
      { type: "text", title: "もっと知りたかった情報があれば記入してください。" }
    ]
  },
  {
    id: "one-on-one",
    status: "締切間近",
    title: "1on1 実施満足度アンケート",
    description: "定期1on1の頻度や質について確認する短いアンケートです。",
    due: "2026年4月3日",
    estimatedTime: "約2分",
    progress: 70,
    progressText: "4 / 5 問",
    summary: [
      { label: "回答状況", value: "ほぼ完了" },
      { label: "締切", value: "4月3日 12:00" },
      { label: "想定時間", value: "約2分" }
    ],
    questions: [
      { type: "choice", title: "1on1 の頻度は適切ですか。", choices: ["多い", "ちょうどよい", "少ない"] },
      { type: "choice", title: "1on1 は業務改善に役立っていますか。", choices: ["とても役立つ", "役立つ", "あまり役立たない", "役立たない"] },
      { type: "text", title: "1on1 に期待したいことがあれば記入してください。" }
    ]
  },
  {
    id: "career",
    status: "回答受付中",
    title: "キャリア面談事前アンケート",
    description: "今後のキャリア希望や、面談で相談したい内容を事前に確認するアンケートです。",
    due: "2026年4月15日",
    estimatedTime: "約4分",
    progress: 0,
    progressText: "未開始",
    summary: [
      { label: "回答状況", value: "未開始" },
      { label: "締切", value: "4月15日 17:00" },
      { label: "想定時間", value: "約4分" }
    ],
    questions: [
      { type: "choice", title: "今後のキャリアについて相談したい気持ちはどの程度ありますか。", choices: ["とてもある", "ある", "少しある", "今はない"] },
      { type: "choice", title: "現在の業務内容と将来の希望は一致していますか。", choices: ["かなり一致している", "ある程度一致している", "あまり一致していない", "一致していない"] },
      { type: "text", title: "面談で話したいことがあれば自由に記入してください。" }
    ]
  }
];

export function getSurveyById(id) {
  return surveys.find((survey) => survey.id === id) || surveys[0];
}

const WHO5_CHOICES = [
  "5 いつも",
  "4 ほとんどいつも",
  "3 半分以上の期間",
  "2 半分以下の期間",
  "1 たまに",
  "0 まったくない"
];

const who5Survey = surveys.find((survey) => survey.id === "onboarding");
if (who5Survey) {
  Object.assign(who5Survey, {
    title: "WHO５",
    description:
      "本尺度はあなたの直近の精神的状態について明らかにするものです。出典：World Health Organization. The World Health Organization-Five Well-Being Index（WHO-5）Japanese translation.\n本チェックは医療上の診断を目的とするものではありません。",
    instruction:
      "以下の5つの各項目について、最近2週間のあなたの状態に最も近いものに印をつけてください。数値が高いほど精神的健康状態が高いことを示していますのでご注意ください。",
    due: "2026年4月30日",
    estimatedTime: "3分",
    progress: 0,
    progressText: "未開始",
    summary: [
      { label: "回答状態", value: "未開始" },
      { label: "回答期限", value: "2026年4月30日" },
      { label: "想定時間", value: "3分" }
    ],
    questions: [
      { type: "choice", title: "明るく、楽しい気分で過ごした。", choices: WHO5_CHOICES },
      { type: "choice", title: "落ち着いた、リラックスした気分で過ごした。", choices: WHO5_CHOICES },
      { type: "choice", title: "意欲的で、活動的に過ごした。", choices: WHO5_CHOICES },
      { type: "choice", title: "ぐっすりと休め、気持ちよくめざめた。", choices: WHO5_CHOICES },
      { type: "choice", title: "日常生活の中に、興味のあることがたくさんあった。", choices: WHO5_CHOICES }
    ]
  });
}

const WHO5_CHOICES_UPDATED = [
  "いつも",
  "ほとんどいつも",
  "半分以上の期間を",
  "半分以下の期間を",
  "ほんのたまに",
  "まったくない"
];

if (who5Survey) {
  who5Survey.questions = [
    { type: "choice", title: "明るく、楽しい気分で過ごした", choices: WHO5_CHOICES_UPDATED },
    { type: "choice", title: "落ち着いた、リラックスした気分で過ごした", choices: WHO5_CHOICES_UPDATED },
    { type: "choice", title: "意欲的で、活動的に過ごした", choices: WHO5_CHOICES_UPDATED },
    { type: "choice", title: "ぐっすりと休め、気持ちよくめざめた", choices: WHO5_CHOICES_UPDATED },
    { type: "choice", title: "日常生活の中に、興味のあることがたくさんあった", choices: WHO5_CHOICES_UPDATED }
  ];
}

const WORK_ENGAGEMENT_CHOICES = [
  "全く当てはまらない",
  "当てはまらない",
  "どちらともいえない",
  "当てはまる",
  "とても当てはまる"
];

const workEngagementSurvey = surveys.find((survey) => survey.id === "one-on-one");
if (workEngagementSurvey) {
  Object.assign(workEngagementSurvey, {
    title: "新版ワークエンゲージメント尺度",
    description:
      "既存尺度から、より高い精度でワークエンゲージメントを取得するために、ビッグデータを基に新しく開発されたエンゲージメント尺度です",
    instruction:
      "以下の各項目について、現在のあなたの仕事の状態に最も近いものを選択してください。",
    due: "2026年4月30日",
    estimatedTime: "3分",
    progress: 0,
    progressText: "未開始",
    summary: [
      { label: "回答状態", value: "未開始" },
      { label: "回答期限", value: "2026年4月30日" },
      { label: "想定時間", value: "3分" }
    ],
    questions: [
      { type: "choice", title: "仕事が楽しくてたまらない", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "活発で元気に働くことができていると思う", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "仕事に行くことを考えると晴れやかな気分になる", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "幸福を感じるくらい仕事にのめりこんでいると思う", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "非常に高い集中力で仕事ができていると思う", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "仕事をしていると時間の経つのを忘れてしまう", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "今の仕事に対して高い熱意を持っている", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "今の仕事は生き甲斐であると感じる", choices: WORK_ENGAGEMENT_CHOICES },
      { type: "choice", title: "今の仕事ができていることを誇りに感じる", choices: WORK_ENGAGEMENT_CHOICES }
    ]
  });
}
