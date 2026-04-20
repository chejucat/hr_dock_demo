import { surveys } from "./survey-data.js";

const storageKeys = {
  auth: "hrdock-authenticated",
  user: "hrdock-user",
  flash: "hrdock-flash-message",
  staticUsers: "hrdock-static-users",
  draftPrefix: "hrdock-survey-draft-",
  resultPrefix: "hrdock-survey-result-"
};

const loginViewEl = document.getElementById("loginView");
const appViewEl = document.getElementById("appView");
const loginAuthViewEl = document.getElementById("loginAuthView");
const signupAuthViewEl = document.getElementById("signupAuthView");
const loginFormEl = document.getElementById("loginForm");
const signupFormEl = document.getElementById("signupForm");
const emailInputEl = document.getElementById("emailInput");
const passwordInputEl = document.getElementById("passwordInput");
const loginStatusEl = document.getElementById("loginStatus");
const signupStatusEl = document.getElementById("signupStatus");
const openSignupButtonEl = document.getElementById("openSignupButton");
const backToLoginButtonEl = document.getElementById("backToLoginButton");
const logoutButtonEl = document.getElementById("logoutButton");
const signupNameInputEl = document.getElementById("signupNameInput");
const signupEmailInputEl = document.getElementById("signupEmailInput");
const signupCompanyInputEl = document.getElementById("signupCompanyInput");
const signupPasswordInputEl = document.getElementById("signupPasswordInput");
const signupPasswordConfirmInputEl = document.getElementById("signupPasswordConfirmInput");
const surveyListEl = document.getElementById("surveyList");
const surveyCountTagEl = document.getElementById("surveyCountTag");
const listDetailTitleEl = document.getElementById("listDetailTitle");
const listDetailDescriptionEl = document.getElementById("listDetailDescription");
const previewAnswerButtonEl = document.getElementById("previewAnswerButton");
const previewResumeButtonEl = document.getElementById("previewResumeButton");
const previewResultButtonEl = document.getElementById("previewResultButton");
const surveyStatusEl = document.getElementById("surveyStatus");
const profileUserIdEl = document.getElementById("profileUserId");
const profileEmailEl = document.getElementById("profileEmail");
const profileNameEl = document.getElementById("profileName");
const profileCompanyEl = document.getElementById("profileCompany");
const editProfileButtonEl = document.getElementById("editProfileButton");
const openHistoryButtonEl = document.getElementById("openHistoryButton");
const profileModalEl = document.getElementById("profileModal");
const profileFormEl = document.getElementById("profileForm");
const profileEditNameInputEl = document.getElementById("profileEditNameInput");
const profileEditEmailInputEl = document.getElementById("profileEditEmailInput");
const profileEditCompanyInputEl = document.getElementById("profileEditCompanyInput");
const profileCurrentPasswordInputEl = document.getElementById("profileCurrentPasswordInput");
const profileNewPasswordInputEl = document.getElementById("profileNewPasswordInput");
const profileNewPasswordConfirmInputEl = document.getElementById("profileNewPasswordConfirmInput");
const profileStatusEl = document.getElementById("profileStatus");
const closeProfileModalButtonEl = document.getElementById("closeProfileModalButton");
const cancelProfileModalButtonEl = document.getElementById("cancelProfileModalButton");
const historyModalEl = document.getElementById("historyModal");
const historyListEl = document.getElementById("historyList");
const closeHistoryModalButtonEl = document.getElementById("closeHistoryModalButton");
const closeHistoryFooterButtonEl = document.getElementById("closeHistoryFooterButton");

let activeSurveyId = surveys[0].id;

function setStatus(target, message, type = "") {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.className = `status${type ? ` ${type}` : ""}`;
}

function clearStatuses() {
  setStatus(loginStatusEl, "");
  setStatus(signupStatusEl, "");
  setStatus(surveyStatusEl, "");
  setStatus(profileStatusEl, "");
}

function showApp(isAuthenticated) {
  loginViewEl.classList.toggle("hidden", isAuthenticated);
  appViewEl.classList.toggle("hidden", !isAuthenticated);
}

function persistAuthState(isAuthenticated, user = null) {
  localStorage.setItem(storageKeys.auth, isAuthenticated ? "true" : "false");
  if (user) {
    localStorage.setItem(storageKeys.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(storageKeys.user);
  }
}

function isStaticDemoMode() {
  return (
    window.location.protocol === "file:" ||
    window.location.hostname.endsWith("github.io")
  );
}

function getStaticUsers() {
  const raw = localStorage.getItem(storageKeys.staticUsers);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveStaticUsers(users) {
  localStorage.setItem(storageKeys.staticUsers, JSON.stringify(users));
}

function buildStaticResponse(ok, status, payload) {
  return {
    response: {
      ok,
      status
    },
    result: payload
  };
}

function handleStaticApi(url, payload) {
  const email = String(payload?.email || "").trim().toLowerCase();
  const users = getStaticUsers();

  if (url === "/api/login") {
    if (email === "admin@hrdock.jp" && payload.password === "hrdock-demo") {
      return buildStaticResponse(true, 200, {
        message: "ログインしました。デモ版で表示しています。",
        user: { name: "Demo Admin", email, company: "HR dock survey" }
      });
    }

    const user = users.find((item) => item.email === email);
    if (!user || user.password !== payload.password) {
      return buildStaticResponse(false, 401, {
        message: "認証情報が正しくありません。"
      });
    }

    return buildStaticResponse(true, 200, {
      message: "ログインしました。",
      user: {
        name: user.name,
        email: user.email,
        company: user.company
      }
    });
  }

  if (url === "/api/signup") {
    const name = String(payload?.name || "").trim();
    const company = String(payload?.company || "").trim();
    const password = String(payload?.password || "");
    const passwordConfirm = String(payload?.passwordConfirm || "");

    if (!name || !email || !company || !password || !passwordConfirm) {
      return buildStaticResponse(false, 400, {
        message: "すべての項目を入力してください。"
      });
    }

    if (password.length < 8) {
      return buildStaticResponse(false, 400, {
        message: "パスワードは8文字以上で入力してください。"
      });
    }

    if (password !== passwordConfirm) {
      return buildStaticResponse(false, 400, {
        message: "確認用パスワードが一致しません。"
      });
    }

    if (users.some((item) => item.email === email) || email === "admin@hrdock.jp") {
      return buildStaticResponse(false, 409, {
        message: "そのメールアドレスはすでに使用されています。"
      });
    }

    users.push({
      id: crypto.randomUUID?.() || `user-${Date.now()}`,
      name,
      email,
      company,
      password
    });
    saveStaticUsers(users);

    return buildStaticResponse(true, 201, {
      message: "会員登録が完了しました。",
      user: { name, email, company }
    });
  }

  if (url === "/api/profile") {
    const currentEmail = String(payload?.currentEmail || "").trim().toLowerCase();
    const name = String(payload?.name || "").trim();
    const nextEmail = String(payload?.email || "").trim().toLowerCase();
    const company = String(payload?.company || "").trim();
    const currentPassword = String(payload?.currentPassword || "");
    const newPassword = String(payload?.newPassword || "");
    const newPasswordConfirm = String(payload?.newPasswordConfirm || "");
    const wantsPasswordChange = Boolean(currentPassword || newPassword || newPasswordConfirm);

    if (!name || !nextEmail || !company) {
      return buildStaticResponse(false, 400, {
        message: "すべての項目を入力してください。"
      });
    }

    const userIndex = users.findIndex((item) => item.email === currentEmail);
    if (userIndex === -1) {
      return buildStaticResponse(false, 404, {
        message: "更新対象のユーザーが見つかりません。"
      });
    }

    if (currentEmail !== nextEmail && users.some((item, index) => index !== userIndex && item.email === nextEmail)) {
      return buildStaticResponse(false, 409, {
        message: "そのメールアドレスはすでに使用されています。"
      });
    }

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !newPasswordConfirm) {
        return buildStaticResponse(false, 400, {
          message: "パスワード変更時は3項目すべて入力してください。"
        });
      }
      if (users[userIndex].password !== currentPassword) {
        return buildStaticResponse(false, 401, {
          message: "現在のパスワードが正しくありません。"
        });
      }
      if (newPassword.length < 8) {
        return buildStaticResponse(false, 400, {
          message: "新しいパスワードは8文字以上で入力してください。"
        });
      }
      if (newPassword !== newPasswordConfirm) {
        return buildStaticResponse(false, 400, {
          message: "新しいパスワードの確認が一致しません。"
        });
      }
      users[userIndex].password = newPassword;
    }

    users[userIndex].name = name;
    users[userIndex].email = nextEmail;
    users[userIndex].company = company;
    saveStaticUsers(users);

    return buildStaticResponse(true, 200, {
      message: wantsPasswordChange
        ? "登録情報とパスワードを更新しました。"
        : "登録情報を更新しました。",
      user: {
        name,
        email: nextEmail,
        company
      }
    });
  }

  return buildStaticResponse(false, 404, { message: "Not Found" });
}

function getStoredUser() {
  const rawUser = localStorage.getItem(storageKeys.user);
  if (!rawUser) {
    return {};
  }

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    return {};
  }
}

function showAuthView(view) {
  const showSignup = view === "signup";
  loginAuthViewEl.classList.toggle("hidden", showSignup);
  signupAuthViewEl.classList.toggle("hidden", !showSignup);
  clearStatuses();
}

function getActiveSurvey() {
  return surveys.find((survey) => survey.id === activeSurveyId) || surveys[0];
}

function getDraftForSurvey(surveyId) {
  const raw = localStorage.getItem(`${storageKeys.draftPrefix}${surveyId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function getResultForSurvey(surveyId) {
  const raw = localStorage.getItem(`${storageKeys.resultPrefix}${surveyId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ja-JP");
}

function navigateToSurvey(mode) {
  window.location.href = `./survey.html?survey=${encodeURIComponent(activeSurveyId)}&mode=${encodeURIComponent(mode)}`;
}

function renderSurveyList() {
  surveyListEl.innerHTML = "";
  surveyCountTagEl.textContent = `${surveys.length}件`;

  surveys.forEach((survey) => {
    const article = document.createElement("article");
    article.className = `survey-card${survey.id === activeSurveyId ? " active" : ""}`;
    article.innerHTML = `
      <div class="survey-title-row">
        <button class="survey-name-button" type="button" title="${survey.title}">
          <h4>${survey.title}</h4>
        </button>
      </div>
    `;

    article.querySelector(".survey-name-button").addEventListener("click", () => {
      activeSurveyId = survey.id;
      renderSurveyList();
      renderActiveSurvey();
      setStatus(surveyStatusEl, "");
    });

    surveyListEl.appendChild(article);
  });
}

function renderProfile() {
  const user = getStoredUser();
  const email = user.email || "admin@hrdock.jp";
  const name = user.name || "Demo Admin";
  const company = user.company || "HR dock survey";
  const idSeed = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "USER";

  profileUserIdEl.textContent = `USR-${idSeed.slice(0, 6)}`;
  profileEmailEl.textContent = email;
  profileNameEl.textContent = name;
  profileCompanyEl.textContent = company;
}

function renderActiveSurvey() {
  const activeSurvey = getActiveSurvey();
  const draft = getDraftForSurvey(activeSurvey.id);
  const result = getResultForSurvey(activeSurvey.id);
  const hasDraft = Boolean(draft && draft.responses && Object.keys(draft.responses).length);

  listDetailTitleEl.textContent = activeSurvey.title;
  listDetailDescriptionEl.textContent = activeSurvey.description;
  previewResumeButtonEl.disabled = !hasDraft;
  previewResumeButtonEl.style.opacity = hasDraft ? "1" : "0.45";
  previewResumeButtonEl.style.cursor = hasDraft ? "pointer" : "not-allowed";
  previewResultButtonEl.disabled = !result;
  previewResultButtonEl.style.opacity = result ? "1" : "0.45";
  previewResultButtonEl.style.cursor = result ? "pointer" : "not-allowed";
}

function openProfileModal() {
  const user = getStoredUser();
  const email = user.email || "admin@hrdock.jp";
  const isDemoUser = email === "admin@hrdock.jp";

  profileEditNameInputEl.value = user.name || "Demo Admin";
  profileEditEmailInputEl.value = email;
  profileEditCompanyInputEl.value = user.company || "HR dock survey";
  profileEditEmailInputEl.disabled = isDemoUser;
  setStatus(profileStatusEl, "");
  profileModalEl.classList.remove("hidden");
  profileModalEl.setAttribute("aria-hidden", "false");
}

function closeProfileModal() {
  profileModalEl.classList.add("hidden");
  profileModalEl.setAttribute("aria-hidden", "true");
  profileFormEl.reset();
  profileEditEmailInputEl.disabled = false;
  setStatus(profileStatusEl, "");
}

function renderHistoryList() {
  const historyItems = surveys
    .map((survey) => ({
      survey,
      result: getResultForSurvey(survey.id)
    }))
    .filter((entry) => entry.result)
    .sort((left, right) => new Date(right.result.completedAt) - new Date(left.result.completedAt));

  historyListEl.innerHTML = "";

  if (!historyItems.length) {
    historyListEl.innerHTML = `<div class="history-empty">まだ回答履歴はありません。アンケートに回答するとここに表示されます。</div>`;
    return;
  }

  historyItems.forEach(({ survey, result }) => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-item-head">
        <div>
          <h4>${survey.title}</h4>
          <p>回答日時: ${formatDateTime(result.completedAt)}</p>
        </div>
        <button class="secondary-button" type="button">結果を見る</button>
      </div>
    `;

    item.querySelector("button").addEventListener("click", () => {
      window.location.href = `./result.html?survey=${encodeURIComponent(survey.id)}`;
    });

    historyListEl.appendChild(item);
  });
}

function openHistoryModal() {
  renderHistoryList();
  historyModalEl.classList.remove("hidden");
  historyModalEl.setAttribute("aria-hidden", "false");
}

function closeHistoryModal() {
  historyModalEl.classList.add("hidden");
  historyModalEl.setAttribute("aria-hidden", "true");
}

async function postJson(url, payload) {
  if (isStaticDemoMode()) {
    return handleStaticApi(url, payload);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return { response, result };
  } catch (_error) {
    return handleStaticApi(url, payload);
  }
}

function applyFlashMessage() {
  const rawFlash = localStorage.getItem(storageKeys.flash);
  if (!rawFlash) {
    return;
  }

  try {
    const flash = JSON.parse(rawFlash);
    setStatus(surveyStatusEl, flash.message, flash.type || "success");
  } catch (_error) {
    localStorage.removeItem(storageKeys.flash);
    return;
  }

  localStorage.removeItem(storageKeys.flash);
}

loginFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInputEl.value.trim().toLowerCase();
  const password = passwordInputEl.value;

  if (!email || !password) {
    setStatus(loginStatusEl, "メールアドレスとパスワードを入力してください。", "error");
    return;
  }

  try {
    const { response, result } = await postJson("/api/login", { email, password });
    if (!response.ok) {
      setStatus(loginStatusEl, result.message || "認証に失敗しました。", "error");
      return;
    }

    persistAuthState(true, result.user || { email });
    renderProfile();
    renderActiveSurvey();
    setStatus(loginStatusEl, result.message || "ログインに成功しました。", "success");
    passwordInputEl.value = "";
    showApp(true);
  } catch (_error) {
    setStatus(loginStatusEl, "サーバーへ接続できませんでした。", "error");
  }
});

signupFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = signupNameInputEl.value.trim();
  const email = signupEmailInputEl.value.trim().toLowerCase();
  const company = signupCompanyInputEl.value.trim();
  const password = signupPasswordInputEl.value;
  const passwordConfirm = signupPasswordConfirmInputEl.value;

  if (!name || !email || !company || !password || !passwordConfirm) {
    setStatus(signupStatusEl, "すべての項目を入力してください。", "error");
    return;
  }
  if (password.length < 8) {
    setStatus(signupStatusEl, "パスワードは8文字以上で入力してください。", "error");
    return;
  }
  if (password !== passwordConfirm) {
    setStatus(signupStatusEl, "確認用パスワードが一致しません。", "error");
    return;
  }

  try {
    const { response, result } = await postJson("/api/signup", {
      name,
      email,
      company,
      password,
      passwordConfirm
    });
    if (!response.ok) {
      setStatus(signupStatusEl, result.message || "会員登録に失敗しました。", "error");
      return;
    }

    signupFormEl.reset();
    emailInputEl.value = email;
    passwordInputEl.value = "";
    showAuthView("login");
    setStatus(loginStatusEl, result.message || "会員登録が完了しました。", "success");
  } catch (_error) {
    setStatus(signupStatusEl, "サーバーへ接続できませんでした。", "error");
  }
});

openSignupButtonEl.addEventListener("click", () => {
  signupFormEl.reset();
  showAuthView("signup");
});

backToLoginButtonEl.addEventListener("click", () => {
  showAuthView("login");
});

logoutButtonEl.addEventListener("click", () => {
  persistAuthState(false);
  showApp(false);
  closeProfileModal();
  closeHistoryModal();
  loginFormEl.reset();
  signupFormEl.reset();
  showAuthView("login");
  setStatus(loginStatusEl, "ログアウトしました。", "success");
});

editProfileButtonEl.addEventListener("click", () => {
  openProfileModal();
});

closeProfileModalButtonEl.addEventListener("click", () => {
  closeProfileModal();
});

cancelProfileModalButtonEl.addEventListener("click", () => {
  closeProfileModal();
});

profileModalEl.addEventListener("click", (event) => {
  if (event.target === profileModalEl) {
    closeProfileModal();
  }
});

profileFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const currentUser = getStoredUser();
  const currentEmail = (currentUser.email || "admin@hrdock.jp").trim().toLowerCase();
  const nextProfile = {
    name: profileEditNameInputEl.value.trim(),
    email: profileEditEmailInputEl.value.trim().toLowerCase(),
    company: profileEditCompanyInputEl.value.trim(),
    currentPassword: profileCurrentPasswordInputEl.value,
    newPassword: profileNewPasswordInputEl.value,
    newPasswordConfirm: profileNewPasswordConfirmInputEl.value
  };

  if (!nextProfile.name || !nextProfile.email || !nextProfile.company) {
    setStatus(profileStatusEl, "すべての項目を入力してください。", "error");
    return;
  }

  const wantsPasswordChange =
    Boolean(nextProfile.currentPassword) ||
    Boolean(nextProfile.newPassword) ||
    Boolean(nextProfile.newPasswordConfirm);

  if (wantsPasswordChange) {
    if (!nextProfile.currentPassword || !nextProfile.newPassword || !nextProfile.newPasswordConfirm) {
      setStatus(profileStatusEl, "パスワードを変更する場合は3項目すべてを入力してください。", "error");
      return;
    }

    if (nextProfile.newPassword.length < 8) {
      setStatus(profileStatusEl, "新しいパスワードは8文字以上で入力してください。", "error");
      return;
    }

    if (nextProfile.newPassword !== nextProfile.newPasswordConfirm) {
      setStatus(profileStatusEl, "新しいパスワードの確認が一致しません。", "error");
      return;
    }
  }

  if (currentEmail === "admin@hrdock.jp") {
    if (wantsPasswordChange) {
      setStatus(profileStatusEl, "デモアカウントではパスワード変更はできません。", "error");
      return;
    }

    persistAuthState(true, {
      ...currentUser,
      name: nextProfile.name,
      email: currentEmail,
      company: nextProfile.company
    });
    renderProfile();
    closeProfileModal();
    setStatus(surveyStatusEl, "デモアカウントの表示情報を更新しました。", "success");
    return;
  }

  try {
    const { response, result } = await postJson("/api/profile", {
      currentEmail,
      ...nextProfile
    });

    if (!response.ok) {
      setStatus(profileStatusEl, result.message || "登録情報を更新できませんでした。", "error");
      return;
    }

    persistAuthState(true, result.user || nextProfile);
    renderProfile();
    closeProfileModal();
    setStatus(surveyStatusEl, result.message || "登録情報を更新しました。", "success");
  } catch (_error) {
    setStatus(profileStatusEl, "サーバーへ接続できませんでした。", "error");
  }
});

openHistoryButtonEl.addEventListener("click", () => {
  openHistoryModal();
});

closeHistoryModalButtonEl.addEventListener("click", () => {
  closeHistoryModal();
});

closeHistoryFooterButtonEl.addEventListener("click", () => {
  closeHistoryModal();
});

historyModalEl.addEventListener("click", (event) => {
  if (event.target === historyModalEl) {
    closeHistoryModal();
  }
});

previewAnswerButtonEl.addEventListener("click", () => {
  navigateToSurvey("start");
});

previewResumeButtonEl.addEventListener("click", () => {
  if (!previewResumeButtonEl.disabled) {
    navigateToSurvey("resume");
  }
});

previewResultButtonEl.addEventListener("click", () => {
  const result = getResultForSurvey(activeSurveyId);
  if (!result) {
    setStatus(surveyStatusEl, "まだ結果は保存されていません。先に回答を送信してください。", "error");
    return;
  }

  window.location.href = `./result.html?survey=${encodeURIComponent(activeSurveyId)}`;
});

function initializeApp() {
  renderSurveyList();
  renderProfile();
  renderActiveSurvey();
  applyFlashMessage();
  showAuthView("login");
  showApp(localStorage.getItem(storageKeys.auth) === "true");
}

initializeApp();
