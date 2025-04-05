Hướng dẫn cài đặt và cấu hình ứng dụng tích hợp Bitrix24 OAuth

Mô tả ứng dụng :
Ứng dụng Node.js tích hợp với Bitrix24 thông qua OAuth 2.0, cung cấp các chức năng:
- Nhận sự kiện Install App.
- Lưu access token và refresh token (có thể dùng file hoặc database).
- Renew token khi hết hạn.
- Gọi API bất kỳ với token đang có.

Yêu cầu hệ thống :
- Node.js
- npm (đi kèm với Node.js)
- Tài khoản Bitrix24 với quyền quản trị viên
- Ngrok hoặc máy chủ có thể truy cập công khai

//Bài 1 : Triển khai cơ chế OAuth của Bitrix24

Bước 1 : Tải và cài đặt Ngrok
- Truy cập https://ngrok.com/download và tải phiên bản phù hợp với hệ điều hành của bạn (Windows, macOS, Linux).
- Giải nén file tải về và chạy lệnh sau trong terminal để khởi động Ngrok 
- Vào trang 

