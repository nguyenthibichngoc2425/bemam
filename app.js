const $ = (selector) => document.querySelector(selector);
const API_BASE = window.MAM_AI_API_BASE || "";
const state = { age: localStorage.getItem("mam-age") || "9-11", messages: [], practice: null };
const browserAI = { engine: null, loading: null, model: "SmolLM2-360M-Instruct-q0f16-MLC" };

async function getBrowserAI() {
  if (!("gpu" in navigator)) throw new Error("Trình duyệt chưa hỗ trợ WebGPU.");
  if (browserAI.engine) return browserAI.engine;
  if (!browserAI.loading) {
    browserAI.loading = import("https://esm.run/@mlc-ai/web-llm").then(async ({ CreateMLCEngine }) => {
      const engine = await CreateMLCEngine(browserAI.model, {
        initProgressCallback: (progress) => {
          $("#connectionStatus").textContent = progress.text || "Đang tải mô hình AI...";
        }
      });
      browserAI.engine = engine;
      return engine;
    }).catch((error) => {
      browserAI.loading = null;
      throw error;
    });
  }
  return browserAI.loading;
}

async function askBrowserAI(messages, system) {
  const engine = await getBrowserAI();
  const result = await engine.chat.completions.create({
    messages: [{ role: "system", content: system }, ...messages],
    temperature: 0.2,
    max_tokens: 700
  });
  const message = result.choices?.[0]?.message?.content?.trim();
  if (!message) throw new Error("Mô hình không trả về nội dung.");
  return message;
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = type === "bot" ? "🌱" : "🧒";
  const content = document.createElement("div");
  const author = document.createElement("strong");
  author.textContent = type === "bot" ? "Mầm" : "Bé";
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  content.append(author, paragraph);
  message.append(avatar, content);
  $("#chatWindow").append(message);
  $("#chatWindow").scrollTop = $("#chatWindow").scrollHeight;
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = busy ? "Mầm đang nghĩ..." : label;
}

async function callApi(path, body) {
  const response = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Không thể kết nối với Mầm.");
  return data;
}

async function askMum(question) {
  try {
    const arithmetic = question.match(/(-?\d+(?:[.,]\d+)?)\s*(?:cộng|\+|trừ|-|nhân|x|×|chia|\/|÷)\s*(-?\d+(?:[.,]\d+)?)/i);
    if (arithmetic) {
      const left = Number(arithmetic[1].replace(",", "."));
      const right = Number(arithmetic[2].replace(",", "."));
      const operator = arithmetic[0].match(/cộng|\+|trừ|-|nhân|x|×|chia|\/|÷/i)?.[0];
      const operations = { cộng: left + right, "+": left + right, trừ: left - right, "-": left - right, nhân: left * right, x: left * right, "×": left * right, chia: right ? left / right : null, "/": right ? left / right : null, "÷": right ? left / right : null };
      if (operator && operations[operator] !== null) {
        $("#connectionStatus").innerHTML = "<i></i> Công cụ toán học trong trình duyệt";
        return { message: `${left} ${operator} ${right} = ${operations[operator]}. Mầm đã kiểm tra phép tính bằng công cụ toán học chạy ngay trên trình duyệt.`, evidence: [], provider: "browser-calculator" };
      }
    }
    const messages = [...state.messages, { role: "user", content: question }];
    const message = await askBrowserAI(messages, `Bạn là Mầm AI, gia sư tiếng Việt cho học sinh ${state.age} tuổi. Giải thích ngắn, chính xác, dễ hiểu, có ví dụ gần gũi. Không bịa nguồn và không yêu cầu thông tin riêng tư.`);
    $("#connectionStatus").innerHTML = "<i></i> AI chạy trong trình duyệt";
    return { message, evidence: [], provider: "browser-webllm" };
  } catch (error) {
    $("#connectionStatus").innerHTML = "<i></i> Chưa tải được mô hình AI";
    return { message: `Mầm chưa thể khởi động AI trong trình duyệt: ${error.message}`, evidence: [] };
  }
}

$("#ageSelect").value = state.age;
$("#ageSelect").addEventListener("change", (event) => { state.age = event.target.value; localStorage.setItem("mam-age", state.age); });
$("#chatInput").addEventListener("input", (event) => { $("#charCount").textContent = `${event.target.value.length}/500`; });
$("#chatForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("#chatInput"); const question = input.value.trim(); if (!question) return;
  addMessage(question, "user"); state.messages.push({ role: "user", content: question }); input.value = ""; $("#charCount").textContent = "0/500";
  const button = $("#sendButton"); setBusy(button, true);
  const answer = await askMum(question);
  const sourceText = answer.evidence?.length ? `\n\nNguồn tham khảo: ${answer.evidence.map((item) => item.source).join("; ")}` : "";
  const answerText = `${answer.message}${sourceText}`;
  addMessage(answerText, "bot"); state.messages.push({ role: "assistant", content: answerText }); setBusy(button, false, "Gửi →");
});

document.querySelectorAll("[data-question]").forEach((button) => button.addEventListener("click", () => {
  $("#chatInput").value = button.dataset.question; $("#chatInput").dispatchEvent(new Event("input")); $("#chatInput").focus();
}));

function activateMode(mode) {
  document.querySelectorAll(".mode-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  document.querySelectorAll(".mode-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${mode}Panel`));
}
document.querySelectorAll(".mode-tab").forEach((tab) => tab.addEventListener("click", () => activateMode(tab.dataset.mode)));
document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => { activateMode(button.dataset.jump); document.querySelector(".mode-tabs").scrollIntoView({ behavior: "smooth" }); }));

$("#analysisForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const input = $("#analysisInput").value.trim(); if (!input) return;
  const result = $("#analysisResult"); const button = event.submitter; setBusy(button, true);
  try {
    const message = await askBrowserAI([{ role: "user", content: input }], `Bạn là gia sư Mầm AI cho học sinh ${state.age} tuổi. Hãy gỡ rối đề bài theo 5 mục: điều cần tìm, kiến thức nền tảng, các bước nhỏ, một câu hỏi gợi ý, đáp án và cách kiểm tra. Liên hệ trực tiếp với đề bài, không nói chung chung.`);
    result.textContent = message; result.className = "analysis-result";
  } catch (error) {
    result.textContent = `Mầm chưa thể chạy AI trong trình duyệt: ${error.message}`;
    result.className = "analysis-result";
  } finally { setBusy(button, false, "Gỡ rối cùng Mầm →"); }
});
$("#resetAnalysis").addEventListener("click", () => { $("#analysisInput").value = ""; $("#analysisResult").textContent = "Gợi ý từng bước sẽ xuất hiện ở đây."; $("#analysisResult").className = "analysis-result empty"; });

function readProgress() { return JSON.parse(localStorage.getItem("mam-progress") || '{"answered":0,"correct":0,"topics":{}}'); }
function saveProgress(topic, correct) { const progress = readProgress(); progress.answered += 1; progress.correct += correct ? 1 : 0; progress.topics[topic] = (progress.topics[topic] || 0) + (correct ? 1 : -1); localStorage.setItem("mam-progress", JSON.stringify(progress)); renderProgress(); }
function renderProgress() {
  const progress = readProgress(); const accuracy = progress.answered ? Math.round(progress.correct / progress.answered * 100) : 0;
  const topics = Object.entries(progress.topics).sort((a, b) => a[1] - b[1]).slice(0, 3);
  $("#progressContent").innerHTML = `<div class="stats-grid"><div><strong>${progress.answered}</strong><span>Câu đã làm</span></div><div><strong>${progress.correct}</strong><span>Câu đúng</span></div><div><strong>${accuracy}%</strong><span>Tỷ lệ đúng</span></div></div><div class="review-box"><strong>Gợi ý ôn tập</strong><p>${topics.length ? `Bé có thể luyện thêm: ${topics.map(([topic]) => topic).join(", ")}.` : "Hoàn thành một bộ bài để Mầm gợi ý chủ đề tiếp theo."}</p></div>`;
}

function validQuestion(question) { return question && typeof question.question === "string" && Array.isArray(question.options) && question.options.length >= 2 && Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length && typeof question.explanation === "string"; }
function renderPractice() {
  const area = $("#practiceArea"); const quiz = state.practice;
  if (!quiz || !quiz.questions.length) { area.textContent = "Chưa có bộ câu hỏi hợp lệ."; area.className = "practice-area empty"; return; }
  const current = quiz.questions[quiz.index]; area.className = "practice-area";
  area.innerHTML = `<div class="practice-progress">Câu ${quiz.index + 1} / ${quiz.questions.length}</div><h3>${escapeHtml(current.question)}</h3><div class="practice-options">${current.options.map((option, index) => `<button type="button" data-option="${index}">${escapeHtml(option)}</button>`).join("")}</div><p class="practice-feedback" id="practiceFeedback"></p>`;
}
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }
$("#practiceForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const button = event.submitter; setBusy(button, true);
  try {
    const count = Number($("#questionCount").value);
    const subject = $("#subjectSelect").value;
    const topic = $("#topicInput").value.trim();
    const difficulty = $("#difficultySelect").value;
    const prompt = `Tạo đúng ${count} câu trắc nghiệm tiếng Việt cho học sinh ${state.age} tuổi, môn ${subject}, chủ đề "${topic}", độ khó "${difficulty}". Chỉ trả về JSON dạng {"questions":[{"question":"...","options":["...","...","..."],"answer":0,"explanation":"..."}]}. answer là chỉ số từ 0. Không thêm markdown.`;
    const raw = await askBrowserAI([{ role: "user", content: prompt }], "Bạn là người tạo bài luyện tập. Mỗi câu có đúng một đáp án, các lựa chọn không trùng nhau và lời giải phải khớp đáp án.");
    const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Mô hình không trả về JSON hợp lệ.");
    const data = JSON.parse(raw.slice(start, end + 1));
    const questions = Array.isArray(data.questions) ? data.questions.filter(validQuestion) : [];
    if (questions.length !== count) throw new Error("Mô hình trả về số câu không hợp lệ.");
    state.practice = { questions, index: 0, score: 0, topic }; renderPractice();
  } catch (error) { $("#practiceArea").textContent = `Chưa thể tạo bài trong trình duyệt: ${error.message}`; $("#practiceArea").className = "practice-area error"; }
  finally { setBusy(button, false, "Tạo bài luyện tập"); }
});
$("#practiceArea").addEventListener("click", (event) => {
  const button = event.target.closest("[data-option]"); if (!button || !state.practice) return;
  const quiz = state.practice; const question = quiz.questions[quiz.index]; const selected = Number(button.dataset.option); const correct = selected === question.answer;
  document.querySelectorAll(".practice-options button").forEach((item) => { item.disabled = true; if (Number(item.dataset.option) === question.answer) item.classList.add("is-correct"); });
  if (!correct) button.classList.add("is-wrong"); if (correct) quiz.score += 1; saveProgress(quiz.topic, correct);
  const feedback = $("#practiceFeedback"); feedback.textContent = correct ? `Chính xác! ${question.explanation}` : `Chưa đúng. ${question.explanation}`;
  setTimeout(() => { quiz.index += 1; if (quiz.index < quiz.questions.length) renderPractice(); else { $("#practiceArea").innerHTML = `<div class="complete-state"><strong>Hoàn thành!</strong><p>Bé đúng ${quiz.score}/${quiz.questions.length} câu. Hãy xem phần Tiến độ để biết nên ôn gì tiếp nhé.</p><button class="primary-button" type="button" data-retry>Tạo bộ khác</button></div>`; } }, 1000);
});
$("#practiceArea").addEventListener("click", (event) => { if (event.target.matches("[data-retry]")) $("#practiceForm").requestSubmit(); });
renderProgress();

function closeParent() { $("#parentModal").hidden = true; }
$("#parentButton").addEventListener("click", () => { $("#parentModal").hidden = false; $("#closeParent").focus(); });
$("#closeParent").addEventListener("click", closeParent); $("#closeParentAction").addEventListener("click", closeParent);
$("#parentModal").addEventListener("click", (event) => { if (event.target === $("#parentModal")) closeParent(); });
