HƯỚNG DẪN CÀI ĐẶT VÀ CẤU HÌNH ỨNG DỤNG TÍCH HỢP BITRIX24 OAUTH

BÀI 1 : TRIỂN KHAI CƠ CHẾ OAUTH CỦA BITRIX24 

Mô tả ứng dụng :
Ứng dụng Node.js tích hợp với Bitrix24 thông qua OAuth 2.0, cung cấp các chức năng:
- Nhận sự kiện Install App.
- Lưu access token và refresh token (có thể dùng file hoặc database).
- Renew token khi hết hạn.
- Gọi API bất kỳ với token đang có.

Yêu cầu hệ thống :
- Node.js
- npm 
- Tài khoản Bitrix24 với quyền quản trị viên
- Ngrok hoặc máy chủ có thể truy cập công khai

Bước 1 : Tải và cài đặt Ngrok
- Truy cập https://ngrok.com/download và tải phiên bản phù hợp với hệ điều hành của bạn (Windows, macOS, Linux).
- Giải nén file tải về và khởi động file ngrok trong đó chuyển hướng đến terminal
- Chạy lệnh 'ngrok config add-authtoken $YOUR_AUTHTOKEN' với $YOUR_AUTHTOKEN lấy từ trang https://dashboard.ngrok.com khi người dùng đăng nhập
- Chạy lệnh 'ngrok http 3000' để ngrok lắng nghe trên cổng 3000 và lưu ý là cổng backend cũng phải chạy trên cổng 3000
- Mỗi lần chạy ngrok thì ngrok sẽ cung cấp 1 URL khác nhau 'https://abc123.ngrok.io' -> thay thế bằng dẫn thực của ngrok cung cấp -> Lưu lại

Bước 2 :  Đăng nhập Bitrix24
- Đăng nhập vào bitrix24 với quyền quản trị viên
- Tạo một ứng dụng cục bộ -> Nhập đường dẫn xử lí 'https://abc123.ngrok.io/callback' -> Nhập đường dẫn ban đầu 'https://abc123.ngrok.io' ->
Nhập quyền truy cập crm,log,user,im,... -> Khởi tạo ứng dụng
- Sau khi khởi tạo bitrix sẽ cung cấp cilent_id và cilent_secret -> Lưu lại

Bước 3 : Khởi chạy backend với node.js
- Chạy các lệnh mkdir bitrix24-oauth >> cd bitrix24-oauth >> npm init -y >> npm install express axios dotenv để khởi tạo backend
- Tạo file .env và cấu hình tệp với :
+ CLIENT_ID : client_id mà bitrix cung cấp khi khởi tạo ứng dụng
+ CILENT_SECRET : cilent_secret mà bitrix cung cấp khi khởi tạo ứng dụng
+ REDIRECT_URI : Đường dẫn xử lí 'https://abc123.ngrok.io/callback'
+ BITRIX_DOMAIN : Đường dẫn bitrix của bạn 'yourname.bitrix24.vn'
+ PORT = 3000 : Cổng chạy backend tuỳ chỉnh nhưng phải khớp với cổng chạy ngok

Bước 4a : Tạo các file và code xử lí -> Trong dự án back end BITRIX24-OAUTH -> Chạy backend trên cổng 3000

Bước 4b : Tich hợp ngrok vào backend để khi chạy backend thì sẽ start a tunnel cho ngrok luôn và lưu đường dẫn mà ngrok cung cấp và dùng cho bước 2

Bước 5 : Truy cập http://localhost:3000/install để cài đặt ứng dụng -> Chuyển hướng người dùng đến trang xác thực OAuth để lấy code -> Chuyển hướng tới trang http://localhost:3000/callback -> Nhận code từ query khi người dùng xác thực -> Gửi POST request đến Bitrix24 để đổi code lấy access_token và refresh_token -> Lưu token vào file token.json và thông báo thành công -> Nếu token hết hạn -> Lấy token hiện tại từ file -> Gửi request POST đến https://oauth.bitrix.info/oauth/token với refresh_token -> Lưu token mới vào file và trả về access_token

Bước 6 : Truy cập http://localhost:3000/test-api để gọi API bất kì với token đang có

Bước 7 : Khi nhấn reinstall thì ứng dụng cài đặt lại và mọi thay đổi được lưu vào file bitrix-config.json



                                         - HẾT BÀI 1 - 



BÀI 2 : TẠO GIAO DIỆN CƠ BẢN CHO PHÉP HIỂN THỊ THÊM SỬA XOÁ CONTACT VỚI CÁC THÔNG TIN CƠ BẢN 

Mô tả ứng dụng :
Ứng dụng Vue.js kết hợp Node.js tích hợp với Bitrix24 thông qua OAuth 2.0, cung cấp các chức năng:
- Hiển thị danh sách contact với Tên, Địa chỉ, Số điện thoại, Email, Website, Thông tin chi tiết ngân hàng
- Thêm contact
- Sửa contact
- Xoá contact

Bước 1 : Tạo thêm các code xử lí việc hiển thị, thêm, sửa, xoá contact trong backend như /contacts, /add, /update:id, /delete:id

Bước 2 : Chạy lệnh npm create vite@latest frontend --template vue để tạo dự án vue3 -> npm install để cài dependencies -> npm install axios để nhận dữ liệu từ backend

Bước 3 : Thiết kế giao diện hiển thị, thêm, sửa, xoá contact -> get /contacts để hiển thị danh sách contact -> post /add để thêm contact và lưu vào contact -> put /update:id để sửa thông tin contact và lưu ->delete /delete:id để xoá contact ra khỏi danh sách và lưu contact mới

Bước 4 : Cấu hình cors để frontend để có gửi request đến backend

Bước 5 : Chạy npm run dev để truy cập trên http://localhost:5173 và thực hiện các thao tác như xem danh sách hoặc thêm sửa xoá contact .

                                        - HẾT BÀI 2 -
