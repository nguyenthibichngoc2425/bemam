const responses = [
  { keys: ["bầu trời", "màu xanh"], text: "Ánh sáng Mặt Trời có nhiều màu. Khi đi qua không khí, màu xanh bị tán xạ nhiều hơn nên mắt mình thấy bầu trời xanh đấy! 🌈" },
  { keys: ["cổ tích", "tình bạn"], texts: [
    "Ngày xửa ngày xưa, Thỏ Trắng và Nhím Nhỏ sống cạnh khu rừng. Một trận mưa cuốn mất cây cầu duy nhất. Thỏ tìm cành cây, Nhím bện dây leo, còn các bạn chim mang lá lớn che mưa. Khi cây cầu hoàn thành, cả khu rừng cùng reo vui. Tình bạn giống một cây cầu: mỗi người góp một chút, mọi người sẽ đi được thật xa. 🏰",
    "Trong tòa lâu đài có chiếc gương chỉ sáng lên khi ai đó nói thật lòng. Công chúa Mi không muốn làm vua cha buồn nên luôn giấu cảm xúc. Một hôm, cô dũng cảm nói: “Con đang lo lắng, nhưng con muốn được giúp đỡ.” Chiếc gương bừng sáng, và nhà vua ôm con thật chặt. Nói ra điều mình cảm thấy cũng là một phép thuật. ✨"
  ] },
  { keys: ["phiêu lưu", "ngoài không gian", "vũ trụ"], texts: [
    "Tên lửa giấy của Na bất ngờ bay lên tận các vì sao. Một chú sao chổi nhỏ bị lạc khỏi đoàn bạn. Na dùng chiếc la bàn may mắn, hỏi đường các hành tinh và dẫn chú về nhà trước khi trời sáng. Na nhận ra chuyến phiêu lưu tuyệt nhất là chuyến đi giúp đỡ một người bạn. 🚀",
    "Linh và chú mèo máy Bíp đáp xuống Hành tinh Cầu Vồng, nơi màu sắc đang biến mất. Hai bạn lần theo những dấu chân lấp lánh, tìm thấy một đám mây buồn. Họ kể chuyện cười và giúp đám mây mưa xuống khu vườn khô. Màu sắc trở lại vì niềm vui được chia sẻ. 🌈"
  ] },
  { keys: ["hài hước", "chú mèo", "mèo"], texts: [
    "Mèo Mun quyết định làm đầu bếp. Bạn nấu một nồi súp cá, nhưng vì mải hát nên cho nhầm... ba chiếc tất vào nồi! Cả căn bếp cười vang. Mèo Mun ghi chú: đầu bếp giỏi phải đọc công thức trước khi hát nhé! 😺",
    "Vịt Bông muốn làm thám tử. Bạn đội mũ rộng đến mức không nhìn thấy đường, rồi điều tra vụ mất bánh. Sau một hồi tìm kiếm, Vịt phát hiện thủ phạm chính là... chiếc bụng đói của mình. Vịt quyết định chia bánh cho các bạn và tự phong mình là “thám tử ăn vặt”. 🦆"
  ] },
  { keys: ["khoa học viễn tưởng", "khoa học", "robot"], texts: [
    "Năm 2040, An gặp rô-bốt Tí Hon trên Mặt Trăng. Tí Hon đo được bụi sao nhưng chưa biết cười. An kể một câu chuyện vui, Tí Hon bật cười bằng âm thanh “bíp-bíp” và phát hiện ra: trí tò mò khiến mọi chuyến thám hiểm thú vị hơn. 🔬",
    "Trong phòng thí nghiệm của bà, Minh chế tạo một hạt giống biết hát. Hạt giống chỉ nảy mầm khi nghe lời tử tế. Minh thử nói “Cảm ơn”, “Mình tin bạn” mỗi ngày. Cuối tuần, một cây xanh vươn lên, trên lá có những nốt nhạc lấp lánh. 🌿"
  ] },
  { keys: ["lòng dũng cảm", "dũng cảm"], texts: [
    "Hạt Mầm Nhỏ sợ bóng tối dưới lòng đất. Mỗi ngày, hạt nghe tiếng mưa, cảm nhận hơi ấm và đẩy lên một chút. Cuối cùng, hạt nhìn thấy ánh mặt trời và nở thành bông hoa rực rỡ. Lòng dũng cảm không phải là không sợ, mà là vẫn thử thêm một bước. 🌱",
    "Sóc Nâu sợ nói trước lớp. Khi bạn Nhím bị ốm, Sóc đứng lên kể thay câu chuyện về khu rừng. Giọng bạn lúc đầu run run, nhưng các bạn vỗ tay động viên. Sóc hiểu rằng can đảm có thể bắt đầu bằng một giọng nói rất nhỏ. 🐿️"
  ] },
  { keys: ["câu chuyện", "kể chuyện"], texts: [
    "Chú chim Nhỏ muốn học bay nhưng cứ sợ mình sẽ rơi. Mẹ dạy chú bắt đầu từ cành thấp, rồi cành cao. Mỗi lần vỗ cánh, chú lại tiến bộ một chút. Đến chiều, chú bay qua khu vườn và mang về một bông hoa tặng mẹ. Kiên trì biến điều khó thành điều có thể. 🐦",
    "Bé Mây nhặt được một chiếc hộp biết phát sáng. Mỗi khi Mây làm một việc tốt, chiếc hộp lại mở ra một ngôi sao giấy. Mây giúp em nhỏ buộc dây giày, tưới cây và chia đồ chơi. Đến tối, căn phòng đầy sao, còn trái tim Mây sáng hơn cả chiếc hộp. ⭐"
  ] },
  { keys: ["câu đố", "đố vui"], text: "Đố bé nhé: Cái gì có nhiều răng nhưng không biết cắn? (Đáp án: cái lược 😊) Bé muốn thử thêm câu đố trong Góc vui chơi không?" },
  { keys: ["xin chào", "hello", "chào"], text: "Chào bé! Hôm nay bé muốn khám phá điều gì nào? Mầm luôn sẵn sàng lắng nghe. 😊" }
];

const $ = (selector) => document.querySelector(selector);
const chatWindow = $("#chatWindow");
const chatInput = $("#chatInput");

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
  chatWindow.append(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getResponse(question) {
  const normalized = question.toLowerCase();
  const match = responses.find((item) => item.keys.some((key) => normalized.includes(key)));
  if (match?.texts) {
    return match.texts[Math.floor(Math.random() * match.texts.length)];
  }
  return match?.text || "Câu hỏi thú vị quá! Mầm chưa có câu trả lời chắc chắn. Bé có thể nói rõ hơn không? Nếu đây là chuyện quan trọng, mình cùng hỏi một người lớn đáng tin cậy nhé. 💛";
}

$("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) {
    chatInput.focus();
    return;
  }
  addMessage(question, "user");
  chatInput.value = "";
  $("#charCount").textContent = "0/240";
  window.setTimeout(() => addMessage(getResponse(question), "bot"), 350);
});

chatInput.addEventListener("input", () => {
  $("#charCount").textContent = `${chatInput.value.length}/240`;
});

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.question;
    chatInput.dispatchEvent(new Event("input"));
    chatInput.focus();
  });
});

document.querySelectorAll(".mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".mode-tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".mode-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    $(`#${tab.dataset.mode}Panel`).classList.add("active");
  });
});

$("#analysisForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#analysisInput").value.trim();
  const result = $("#analysisResult");
  if (!input) {
    result.textContent = "Bé hãy nhập một bài cần phân tích trước nhé.";
    result.className = "analysis-result";
    return;
  }
  const arithmetic = input.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*([+\-x×*/÷])\s*(-?\d+(?:[.,]\d+)?)\s*$/);
  if (arithmetic) {
    const first = Number(arithmetic[1].replace(",", "."));
    const second = Number(arithmetic[3].replace(",", "."));
    const operator = arithmetic[2];
    if ((operator === "/" || operator === "÷") && second === 0) {
      result.textContent = "Mình không thể chia cho 0. Bé thử đổi số chia khác nhé.";
      result.className = "analysis-result";
      return;
    }
    const answer = operator === "+" ? first + second : operator === "-" ? first - second : operator === "/" || operator === "÷" ? first / second : first * second;
    const operationHint = operator === "+" ? `Gộp ${first} và ${second} lại` : operator === "-" ? `Lấy ${first} bớt đi ${second}` : operator === "*" || operator === "x" || operator === "×" ? `Cộng ${first} lại ${second} lần` : `Chia ${first} thành ${second} phần bằng nhau`;
    result.innerHTML = `<strong>Gợi ý từng bước:</strong><br>1. Xác định phép tính: ${first} ${operator} ${second}.<br>2. ${operationHint}.<br>3. Đáp án là <strong>${Number.isInteger(answer) ? answer : answer.toFixed(2)}</strong>. Bé thử tự kiểm tra lại nhé! ✨`;
  } else {
    result.innerHTML = "<strong>Mầm gợi ý:</strong><br>Hãy tìm từ khóa chính, viết ra điều bé đã biết và điều bé muốn tìm hiểu. Sau đó chia câu hỏi thành từng bước nhỏ. 🧠";
  }
  result.className = "analysis-result";
});

$("#resetAnalysis").addEventListener("click", () => {
  $("#analysisInput").value = "";
  $("#analysisResult").textContent = "Kết quả gợi ý sẽ xuất hiện ở đây.";
  $("#analysisResult").className = "analysis-result empty";
});

const quizQuestions = [
  { category: "ĐỐ VUI TỰ NHIÊN", question: "Con vật nào thường được gọi là “vua của rừng xanh”?", answers: [["🐯 Hổ", false], ["🦁 Sư tử", true], ["🐘 Voi", false]] },
  { category: "ĐỐ VUI VŨ TRỤ", question: "Hành tinh nào gần Mặt Trời nhất?", answers: [["🌍 Trái Đất", false], ["☿ Sao Thủy", true], ["🔴 Sao Hỏa", false]] },
  { category: "ĐỐ VUI KHOA HỌC", question: "Nước đóng băng ở nhiệt độ nào?", answers: [["0°C", true], ["50°C", false], ["100°C", false]] },
  { category: "ĐỐ VUI ĐỘNG VẬT", question: "Con vật nào có thể đổi màu để ngụy trang?", answers: [["🦎 Tắc kè", true], ["🐄 Bò", false], ["🐧 Chim cánh cụt", false]] },
  { category: "ĐỐ VUI ĐỊA LÝ", question: "Mặt Trời mọc ở hướng nào?", answers: [["⬅️ Tây", false], ["⬆️ Bắc", false], ["➡️ Đông", true]] },
  { category: "ĐỐ VUI TOÁN HỌC", question: "Số nào lớn hơn 25 nhưng nhỏ hơn 27?", answers: [["24", false], ["26", true], ["28", false]] },
  { category: "ĐỐ VUI TIẾNG VIỆT", question: "Từ nào là một màu sắc?", answers: [["🍌 Vàng", true], ["🏃 Chạy", false], ["📚 Đọc", false]] },
  { category: "ĐỐ VUI MÔI TRƯỜNG", question: "Hành động nào giúp bảo vệ môi trường?", answers: [["Xả rác", false], ["Trồng cây", true], ["Lãng phí nước", false]] },
  { category: "ĐỐ VUI ÂM NHẠC", question: "Nhạc cụ nào thường có phím đen và trắng?", answers: [["🎹 Đàn piano", true], ["🥁 Trống", false], ["🎺 Kèn", false]] },
  { category: "ĐỐ VUI DINH DƯỠNG", question: "Thức uống nào giúp cơ thể đủ nước?", answers: [["Nước lọc", true], ["Nước rửa tay", false], ["Dầu gội", false]] },
  { category: "ĐỐ VUI VŨ TRỤ", question: "Trái Đất có hình dạng gần giống hình gì?", answers: [["Hình cầu", true], ["Hình vuông", false], ["Hình tam giác", false]] }
];
let score = 0;
let quizIndex = 0;
let quizAnswered = false;

function renderQuiz() {
  const quiz = quizQuestions[quizIndex];
  $("#quizCategory").textContent = quiz.category;
  $("#quizQuestion").textContent = quiz.question;
  $("#answers").innerHTML = quiz.answers.map(([label, correct]) => `<button type="button" data-answer="${correct ? "correct" : "wrong"}">${label}</button>`).join("");
  $("#quizFeedback").textContent = "";
  $("#nextQuestion").hidden = true;
  quizAnswered = false;
}

$("#answers").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || quizAnswered) return;
  quizAnswered = true;
  const correct = button.dataset.answer === "correct";
  document.querySelectorAll("#answers button").forEach((item) => item.classList.add(item.dataset.answer === "correct" ? "correct" : "wrong"));
  $("#quizFeedback").textContent = correct ? "Chính xác! Bé giỏi quá 🎉" : "Gần đúng rồi! Mình cùng ghi nhớ đáp án nhé 💛";
  if (correct) $("#score").textContent = ++score;
  $("#nextQuestion").hidden = false;
});

$("#nextQuestion").addEventListener("click", () => {
  quizIndex = (quizIndex + 1) % quizQuestions.length;
  renderQuiz();
});

$("#resetQuiz").addEventListener("click", () => {
  score = 0;
  quizIndex = 0;
  $("#score").textContent = "0";
  renderQuiz();
});

$("#parentButton").addEventListener("click", () => {
  alert("Khu phụ huynh sẽ cần mã PIN trong phiên bản chính thức. Đây là khu vực để xem thời gian dùng ứng dụng và cài đặt an toàn.");
});
