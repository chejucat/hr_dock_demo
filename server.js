const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const PORT = process.env.PORT ? Number(process.env.PORT) : 8123;
const HOST = "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

ensureDataFile();

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
  }
}

function safeResolve(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const normalized = decoded === "/" ? "/index.html" : decoded;
  const target = path.resolve(ROOT, `.${normalized}`);

  if (!target.startsWith(ROOT)) {
    return null;
  }

  return target;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha512";
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return { salt, hash, iterations, keyLength, digest };
}

function verifyPassword(password, user) {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, user.iterations, user.keyLength, user.digest)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

async function handleApi(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method Not Allowed" });
    return true;
  }

  let payload;
  try {
    const rawBody = await readBody(req);
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch (_error) {
    sendJson(res, 400, { message: "Invalid request body." });
    return true;
  }

  if (req.url === "/api/signup") {
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(payload.email);
    const company = String(payload.company || "").trim();
    const password = String(payload.password || "");
    const passwordConfirm = String(payload.passwordConfirm || "");

    if (!name || !email || !company || !password || !passwordConfirm) {
      sendJson(res, 400, { message: "すべての項目を入力してください。" });
      return true;
    }

    if (password.length < 8) {
      sendJson(res, 400, { message: "パスワードは8文字以上で入力してください。" });
      return true;
    }

    if (password !== passwordConfirm) {
      sendJson(res, 400, { message: "確認用パスワードが一致しません。" });
      return true;
    }

    const users = readUsers();
    const existing = users.find((user) => user.email === email);
    if (existing || email === "admin@hrdock.jp") {
      sendJson(res, 409, { message: "そのメールアドレスはすでに登録されています。" });
      return true;
    }

    const passwordData = hashPassword(password);
    users.push({
      id: crypto.randomUUID(),
      name,
      email,
      company,
      passwordHash: passwordData.hash,
      salt: passwordData.salt,
      iterations: passwordData.iterations,
      keyLength: passwordData.keyLength,
      digest: passwordData.digest,
      createdAt: new Date().toISOString()
    });
    writeUsers(users);

    sendJson(res, 201, {
      message: "会員登録が完了しました。登録した情報でログインできます。",
      user: { name, email, company }
    });
    return true;
  }

  if (req.url === "/api/login") {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");

    if (!email || !password) {
      sendJson(res, 400, { message: "メールアドレスとパスワードを入力してください。" });
      return true;
    }

    if (email === "admin@hrdock.jp" && password === "hrdock-demo") {
      sendJson(res, 200, {
        message: "ログインに成功しました。ポータルへ移動します。",
        user: { name: "Demo Admin", email, company: "HR dock survey" }
      });
      return true;
    }

    const users = readUsers();
    const user = users.find((item) => item.email === email);
    if (!user || !verifyPassword(password, user)) {
      sendJson(res, 401, { message: "認証情報が正しくありません。" });
      return true;
    }

    sendJson(res, 200, {
      message: "ログインに成功しました。ポータルへ移動します。",
      user: {
        name: user.name,
        email: user.email,
        company: user.company
      }
    });
    return true;
  }

  if (req.url === "/api/profile") {
    const currentEmail = normalizeEmail(payload.currentEmail);
    const nextName = String(payload.name || "").trim();
    const nextEmail = normalizeEmail(payload.email);
    const nextCompany = String(payload.company || "").trim();
    const currentPassword = String(payload.currentPassword || "");
    const newPassword = String(payload.newPassword || "");
    const newPasswordConfirm = String(payload.newPasswordConfirm || "");
    const wantsPasswordChange = Boolean(currentPassword || newPassword || newPasswordConfirm);

    if (!currentEmail || !nextName || !nextEmail || !nextCompany) {
      sendJson(res, 400, { message: "すべての項目を入力してください。" });
      return true;
    }

    if (currentEmail === "admin@hrdock.jp") {
      sendJson(res, 400, { message: "デモアカウントの登録情報は変更できません。" });
      return true;
    }

    const users = readUsers();
    const userIndex = users.findIndex((item) => item.email === currentEmail);
    if (userIndex === -1) {
      sendJson(res, 404, { message: "更新対象のユーザーが見つかりませんでした。" });
      return true;
    }

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !newPasswordConfirm) {
        sendJson(res, 400, { message: "パスワードを変更する場合は3項目すべてを入力してください。" });
        return true;
      }

      if (newPassword.length < 8) {
        sendJson(res, 400, { message: "新しいパスワードは8文字以上で入力してください。" });
        return true;
      }

      if (newPassword !== newPasswordConfirm) {
        sendJson(res, 400, { message: "新しいパスワードの確認が一致しません。" });
        return true;
      }

      if (!verifyPassword(currentPassword, users[userIndex])) {
        sendJson(res, 401, { message: "現在のパスワードが正しくありません。" });
        return true;
      }
    }

    const duplicatedUser = users.find((item, index) => index !== userIndex && item.email === nextEmail);
    if (duplicatedUser) {
      sendJson(res, 409, { message: "そのメールアドレスはすでに利用されています。" });
      return true;
    }

    const nextPasswordData = wantsPasswordChange ? hashPassword(newPassword) : null;
    users[userIndex] = {
      ...users[userIndex],
      name: nextName,
      email: nextEmail,
      company: nextCompany,
      passwordHash: nextPasswordData ? nextPasswordData.hash : users[userIndex].passwordHash,
      salt: nextPasswordData ? nextPasswordData.salt : users[userIndex].salt,
      iterations: nextPasswordData ? nextPasswordData.iterations : users[userIndex].iterations,
      keyLength: nextPasswordData ? nextPasswordData.keyLength : users[userIndex].keyLength,
      digest: nextPasswordData ? nextPasswordData.digest : users[userIndex].digest,
      updatedAt: new Date().toISOString()
    };
    writeUsers(users);

    sendJson(res, 200, {
      message: wantsPasswordChange ? "登録情報とパスワードを更新しました。" : "登録情報を更新しました。",
      user: {
        name: users[userIndex].name,
        email: users[userIndex].email,
        company: users[userIndex].company
      }
    });
    return true;
  }

  return false;
}

function serveStatic(req, res) {
  const target = safeResolve(req.url);
  if (!target) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(target, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if ((req.url || "").startsWith("/api/")) {
      const handled = await handleApi(req, res);
      if (!handled) {
        sendJson(res, 404, { message: "Not Found" });
      }
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
});

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.values(interfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    });
  });

  return addresses;
}

server.listen(PORT, HOST, () => {
  console.log(`Local server running: http://127.0.0.1:${PORT}`);
  getLanAddresses().forEach((address) => {
    console.log(`LAN access: http://${address}:${PORT}`);
  });
});
