# 🎮 Wayground Quiz Scraper

Chrome Extension để cào dữ liệu câu hỏi trắc nghiệm từ trang web [wayground.com](https://wayground.com/).

## ✨ Tính năng

- 🔍 Tự động cào tất cả câu hỏi trắc nghiệm trên trang
- ✅ Nhận diện đáp án đúng/sai
- 📥 Xuất dữ liệu ra file JSON
- 🎨 Giao diện đẹp phong cách Mario

## 📋 Cấu trúc JSON đầu ra

```json
[
    {
        "id": 1,
        "question": "Nội dung câu hỏi...",
        "options": {
            "A": "Đáp án A",
            "B": "Đáp án B",
            "C": "Đáp án C",
            "D": "Đáp án D"
        },
        "correctAnswer": "B"
    }
]
```

## 🚀 Cài đặt

1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật **Developer mode** (góc trên bên phải)
3. Click nút **"Load unpacked"**
4. Chọn thư mục chứa extension này

## 📖 Hướng dẫn sử dụng

1. Truy cập trang quiz trên [wayground.com](https://wayground.com/)
2. **Quan trọng:** Đảm bảo trang đã hiển thị đầy đủ các câu hỏi và đáp án
3. Click vào icon extension trên thanh công cụ Chrome
4. Nhấn nút **"Bắt đầu chuyển đổi dữ liệu"**
5. Chờ quá trình cào dữ liệu hoàn tất
6. Nhấn **"Tải xuống JSON"** để lưu file

## 📁 Cấu trúc thư mục

```
📂 extention_tool/
├── 📄 manifest.json      # Cấu hình extension (Manifest V3)
├── 📄 popup.html         # Giao diện popup
├── 📄 popup.css          # Styles
├── 📄 popup.js           # Logic cào dữ liệu
├── 📄 README.md          # Tài liệu hướng dẫn
└── 📂 icons/             # Icon extension
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## ⚙️ Yêu cầu kỹ thuật

- Chrome phiên bản 88 trở lên (hỗ trợ Manifest V3)
- Trang web wayground.com phải hiển thị câu hỏi và đáp án

## 🔧 Cách hoạt động

Extension sử dụng các selector sau để nhận diện dữ liệu:

| Thành phần | Selector |
|------------|----------|
| Câu hỏi | `[data-testid="qdc-inner-card-question"]` |
| Đáp án | `[data-testid^="option-"]` |
| Đáp án đúng | `.text-wds-success-600 i.fas.fa-check-circle` |

## ⚠️ Lưu ý

- Extension chỉ hoạt động trên domain `wayground.com`
- Cần đợi trang load đầy đủ trước khi cào dữ liệu
- Đáp án đúng chỉ được nhận diện khi trang hiển thị kết quả (có icon ✓)

## 📝 Changelog

### v1.0 (2026-01-14)
- 🎉 Phiên bản đầu tiên
- ✅ Cào câu hỏi và đáp án
- ✅ Nhận diện đáp án đúng
- ✅ Xuất file JSON
- 🎨 Giao diện phong cách Mario

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
