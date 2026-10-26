const AGE_RANGES = new Set(["6-8", "9-11", "12-14"]);

export function classifyTask(text) {
  const value = text.toLowerCase();
  const hasMath = /(?:\d+\s*[+\-x×*/÷]\s*\d+|phương trình|diện tích|chu vi|phân số|tỉ lệ)/u.test(value);
  const needsGuidance = /(?:giải|tính|chứng minh|phân tích|làm thế nào|bài tập)/u.test(value);
  const needsClarification = value.length < 8 || /(?:đó|này|cái này)$/u.test(value.trim());
  return {
    domain: hasMath ? "math" : /(?:cây|động vật|vật lý|hóa|sinh|khoa học)/u.test(value) ? "science" : "general",
    taskType: hasMath || needsGuidance ? "guided-solution" : "explanation",
    complexity: value.length > 180 || (value.match(/\?/gu) || []).length > 1 ? "multi-step" : "standard",
    needsTool: hasMath,
    needsClarification
  };
}

export function calculateExpression(input) {
  const candidate = input.match(/-?\d+(?:[.,]\d+)?\s*[+\-x×*/÷]\s*-?\d+(?:[.,]\d+)?/u)?.[0];
  if (!candidate) return null;
  const expression = candidate.replace(/,/gu, ".").replace(/[×x]/gu, "*").replace(/÷/gu, "/").trim();
  if (!/^-?\d+(?:\.\d+)?\s*[+\-*/]\s*-?\d+(?:\.\d+)?$/u.test(expression)) return null;
  const match = expression.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/u);
  if (!match) return null;
  const first = Number(match[1]); const operator = match[2]; const second = Number(match[3]);
  if (operator === "/" && second === 0) return { valid: false, error: "Không thể chia cho 0." };
  const result = operator === "+" ? first + second : operator === "-" ? first - second : operator === "*" ? first * second : first / second;
  return { valid: Number.isFinite(result), first, operator, second, result };
}

export function validatePracticeQuestions(questions, expectedCount) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) return { valid: false, errors: ["Số lượng câu hỏi không đúng yêu cầu."] };
  const errors = [];
  questions.forEach((item, index) => {
    if (!item || typeof item.question !== "string" || item.question.trim().length < 8) errors.push(`Câu ${index + 1}: nội dung quá ngắn.`);
    if (!Array.isArray(item.options) || item.options.length < 2 || item.options.some((option) => typeof option !== "string" || !option.trim())) errors.push(`Câu ${index + 1}: lựa chọn không hợp lệ.`);
    if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= (item.options?.length || 0)) errors.push(`Câu ${index + 1}: đáp án nằm ngoài lựa chọn.`);
    if (typeof item.explanation !== "string" || item.explanation.trim().length < 8) errors.push(`Câu ${index + 1}: thiếu lời giải.`);
    if (new Set(item.options || []).size !== (item.options || []).length) errors.push(`Câu ${index + 1}: có lựa chọn trùng.`);
  });
  return { valid: errors.length === 0, errors };
}

export function normalizeAge(age) {
  return AGE_RANGES.has(age) ? age : "9-11";
}

export function buildChatInstruction(age, messages, classification) {
  const ageText = { "6-8": "câu ngắn và ví dụ quen thuộc", "9-11": "giải thích theo ý rõ ràng và có ví dụ", "12-14": "thuật ngữ cơ bản kèm định nghĩa" }[age];
  const toolNote = classification.needsTool ? "Nếu có biểu thức số học, hãy dùng kết quả công cụ được cung cấp, không tự đoán." : "Nếu thiếu dữ kiện, nêu giả định hoặc hỏi lại.";
  return `Bạn là Mầm AI, trợ lý học tập cho học sinh ${age} tuổi. Hãy dùng ${ageText}, hướng dẫn để em tự hiểu, không yêu cầu dữ liệu riêng tư. ${toolNote} Không tiết lộ suy nghĩ nội bộ; chỉ trình bày các bước giải thích có thể kiểm tra.\nPhân loại: ${JSON.stringify(classification)}\nHội thoại:\n${messages.map((item) => `${item.role}: ${item.content}`).join("\n")}`;
}
