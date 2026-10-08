# Hướng dẫn Push Code và Tạo Pull Request (PR) lên GitHub

Tài liệu này ghi lại các bước để lưu các thay đổi hiện tại vào một branch mới, push lên GitHub và tạo Pull Request.

---

## Các bước thực hiện

### Bước 1: Tạo branch mới và chuyển sang branch đó
Tạo một branch mới cho tính năng/tài liệu mới (thay `feature/system-engineer-docs` bằng tên branch mong muốn):

```bash
git checkout -b feature/system-engineer-docs
```

---

### Bước 2: Commit các thay đổi đã staged
Ghi nhận (commit) các thay đổi đã được add/staged vào branch mới:

```bash
git commit -m "docs: add system engineer documentation and research files"
```

---

### Bước 3: Push branch mới lên Remote GitHub
Đẩy branch mới vừa tạo lên repository trên GitHub:

```bash
git push -u origin feature/system-engineer-docs
```

---

### Bước 4: Tạo Pull Request (PR) trên GitHub

1. Truy cập vào repository của dự án trên **GitHub**.
2. Ngay trên giao diện chính, GitHub sẽ hiển thị thông báo gợi ý:
   > **"feature/system-engineer-docs had recent pushes"**
3. Nhấp vào nút **Compare & pull request**.
4. Chọn branch đích cần merge vào (ví dụ: `main` hoặc `develop`).
5. Điền tiêu đề, nội dung mô tả cho PR và bấm **Create pull request**.

---

> **Mẹo (Tùy chọn):** Nếu bạn đã cài đặt GitHub CLI (`gh`), bạn có thể tạo PR trực tiếp từ terminal bằng lệnh:
> ```bash
> gh pr create --base main --title "docs: add system engineer documentation"
> ```
