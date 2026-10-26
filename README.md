# Mầm AI

Mầm AI là website demo trợ lý học tập cá nhân hóa cho học sinh 6–14 tuổi. Frontend dùng HTML/CSS/JavaScript thuần; backend dùng Node.js + Express, gọi AI online bằng HTTP `fetch` và hỗ trợ Gemini, Ollama hoặc OpenAI-compatible.

## Chạy bản giao diện

Mở `index.html` bằng trình duyệt để xem giao diện. Khi chưa chạy backend, ứng dụng hiển thị **Chế độ demo** và chỉ trả lời fallback rõ ràng; không giả vờ đó là câu trả lời do AI tạo.

## Chạy AI cục bộ (phương án A: Ollama)

1. Cài Node.js 18+ và Ollama.
2. Mở PowerShell:

   ```powershell
   ollama pull llama3.2:3b
   npm install
   npm start
   ```

3. Mở `http://localhost:3000`. Ollama chỉ lắng nghe trên máy local, không mở cổng 11434 trực tiếp ra Internet.
4. Có thể sao chép `.env.example` thành `.env` để đổi model hoặc cổng. Không đưa `.env` lên GitHub.

Model 3B cần khoảng 4–6 GB RAM khả dụng; máy yếu có thể phản hồi chậm. Kết quả AI có thể sai, vì vậy phụ huynh nên kiểm tra nội dung quan trọng.

## Chạy AI online (phương án chính: Gemini)

Phương án này không tải model AI về máy và không cần cài Ollama. Backend gọi Gemini qua HTTP bằng `fetch` có sẵn trong Node.js, không dùng thư viện AI riêng.

1. Tạo API key Gemini trong Google AI Studio.
2. Tạo file `.env` trong thư mục dự án từ `.env.example`.
3. Điền:

   ```env
   AI_PROVIDER=gemini
   GEMINI_MODEL=gemini-3.8-flash
   GEMINI_API_KEY=điền_api_key_của_bạn
   ```

4. Chạy:

   ```powershell
   npm install
   npm start
   ```

5. Mở `http://localhost:3000`.

API key chỉ nằm trong backend `.env`, không được đưa vào GitHub hoặc frontend. Hạn mức miễn phí, model và chính sách giá có thể thay đổi theo tài khoản; cần kiểm tra trong Google AI Studio.

## Chạy AI cục bộ (phương án B: LM Studio, không cần Ollama)

Nếu không tải được Ollama, dùng LM Studio:

1. Cài LM Studio.
2. Tải một model chat trong LM Studio (ví dụ Qwen Instruct bản nhỏ vừa máy).
3. Bật **Local Server** trong LM Studio (OpenAI-compatible API), thường ở `http://127.0.0.1:1234/v1`.
4. Tạo file `.env` từ `.env.example`, rồi đặt:

   ```env
   AI_PROVIDER=openai-compatible
   OPENAI_BASE_URL=http://127.0.0.1:1234/v1
   OPENAI_MODEL=<model-id-trong-lm-studio>
   OPENAI_API_KEY=
   ```

5. Chạy backend:

   ```powershell
   npm install
   npm start
   ```

> Lưu ý: `OPENAI_MODEL` phải đúng tên model mà server LM Studio đang expose. Nếu sai tên, backend sẽ báo lỗi kết nối/provider.

## Chạy AI online (phương án C: OpenAI-compatible cloud)

Bạn có thể dùng một dịch vụ OpenAI-compatible có gói free/trial.

- Đặt:

  ```env
  AI_PROVIDER=openai-compatible
  OPENAI_BASE_URL=<base-url-cua-dich-vu>/v1
  OPENAI_MODEL=<model-id>
  OPENAI_API_KEY=<api-key>
  ```

- API key chỉ lưu ở backend `.env`, không đưa vào frontend.

## Chạy benchmark 30 câu

Sau khi backend đang chạy ở một cửa sổ PowerShell khác:

```powershell
npm run benchmark
```

Lệnh gửi 30 câu trong `benchmark-cases.json` đến API và ghi kết quả thực tế vào `benchmark-results.json` (file này không được commit). Kết quả hiện chỉ đo lỗi kỹ thuật, phân loại nhiệm vụ và thời gian phản hồi; chưa tự chấm “đúng kiến thức”. Muốn đo độ chính xác, cần bổ sung đáp án/tiêu chí tham chiếu đã được giáo viên kiểm duyệt cho từng ca.

## Kiến trúc lõi AI giai đoạn 1

`ai-core.js` hiện có ba thành phần xác định được:

- `classifyTask`: định tuyến sơ bộ theo lĩnh vực, loại nhiệm vụ, độ phức tạp và nhu cầu công cụ. Đây là router dự phòng, không phải mô hình hiểu biết hoàn hảo.
- `calculateExpression`: tính biểu thức đơn giản bằng parser giới hạn, không dùng `eval` và không cho mô hình thực thi mã.
- `validatePracticeQuestions`: kiểm tra số lượng, lựa chọn trùng, chỉ số đáp án, nội dung và lời giải trước khi trả kết quả.

`knowledge.js` và `knowledge-base.json` là RAG khởi đầu dạng retrieval có nguồn: tài liệu được tách thành các chunk nhỏ, chấm điểm từ khóa đã chuẩn hóa và đưa các chunk phù hợp vào prompt. Đây chưa phải semantic embedding; đó là giới hạn có chủ ý để chạy được trên máy local nhẹ và không tuyên bố khả năng tìm kiếm ngữ nghĩa khi chưa có embedding model. Mỗi chunk có tên nguồn và URL để kiểm tra.

Không gọi mô hình lần hai chỉ để giả làm bộ kiểm chứng; các phép tính và quy tắc xác thực sẽ ưu tiên công cụ xác định.

## Triển khai

GitHub Pages chỉ phục vụ frontend tĩnh nên không thể chạy Node.js. Workflow `.github/workflows/pages.yml` triển khai giao diện. Muốn dùng AI qua Internet, triển khai `server.js` trên máy chủ riêng có HTTPS, rồi cấu hình `window.MAM_AI_API_BASE` hoặc reverse proxy cùng tên miền. Không public trực tiếp dịch vụ model nội bộ; chỉ public API backend, giới hạn tần suất ở lớp proxy/hosting và đặt `ALLOWED_ORIGIN` đúng origin GitHub Pages.

Khu phụ huynh hiện là khu thông tin, không phải hệ thống tài khoản hoặc hồ sơ bảo mật. Tiến độ chỉ lưu trong `localStorage` trên trình duyệt hiện tại.
