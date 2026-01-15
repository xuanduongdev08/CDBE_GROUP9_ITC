# Electro Shop - Tổng Quan Dự Án Backend

## 📋 Tóm Tắt Dự Án

**Electro Shop** là một ứng dụng thương mại điện tử toàn diện chuyên về bán phụ kiện máy tính (PC). Backend được xây dựng bằng **Node.js** và **Express.js**, sử dụng **MongoDB** để lưu trữ dữ liệu. Dự án cung cấp một REST API hoàn chỉnh để quản lý sản phẩm, người dùng, đơn hàng, giỏ hàng và các chức năng quản trị.

---

## 🎯 Loại Dự Án

- **Nền tảng Thương mại điện tử Backend**
- **Danh mục**: Cửa hàng Phụ kiện PC
- **Công nghệ**: Node.js, Express.js, MongoDB, EJS, Bootstrap
- **Kiến trúc**: Mẫu MVC (Model-View-Controller)

---

## 🏗️ Cấu Trúc Dự Án

```
BE/
├── config/              # Các file cấu hình
│   └── database.js     # Thiết lập kết nối MongoDB
├── controllers/        # Lớp logic kinh doanh
│   ├── authController.js
│   ├── categoriesController.js
│   ├── ordersController.js
│   ├── productsController.js
│   ├── searchController.js
│   └── usersController.js
├── middleware/        # Express middleware
│   ├── auth.js
│   ├── authMiddleware.js
│   ├── authorizeMiddleware.js
│   ├── errorHandler.js
│   └── permissions.js
├── models/           # Mongoose schemas (Mô hình dữ liệu)
│   ├── Address.js
│   ├── Admin.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Category.js
│   ├── Contact.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── PaymentMethod.js
│   ├── Product.js
│   ├── Review.js
│   ├── SavedCart.js
│   └── User.js
├── routes/           # Routes API và trang web
│   ├── admin.js
│   ├── api.js
│   ├── auth.js
│   ├── index.js
│   └── api/         # Routes API RESTful (v1)
│       ├── authRoutes.js
│       ├── categoriesRoutes.js
│       ├── ordersRoutes.js
│       ├── productsRoutes.js
│       ├── searchRoutes.js
│       ├── usersRoutes.js
│       └── v1.js
├── scripts/          # Các script hữu ích
│   ├── create-admin.js
│   └── import-data.js
├── utils/           # Các hàm trợ giúp
│   ├── responseFormatter.js
│   └── sendEmail.js
├── views/           # Templates EJS
│   ├── admin/       # Các view dashboard quản trị
│   ├── auth/        # Các view xác thực
│   ├── partials/    # Các thành phần template tái sử dụng
│   └── [trang khác]
├── css/             # File CSS
├── js/              # JavaScript frontend
├── img/             # Hình ảnh
├── lib/             # Thư viện bên thứ ba
├── scss/            # Sass stylesheets
├── server.js        # Điểm vào chính
├── package.json     # Danh sách các gói
└── plt_shop.sql     # Schema cơ sở dữ liệu
```

---

## 🔌 Công Nghệ Cốt Lõi & Các Gói Phụ Thuộc

### Framework Backend
- **Express.js** (4.18.2) - Web framework
- **Node.js** - Runtime environment

### Cơ Sở Dữ Liệu
- **MongoDB** - Cơ sở dữ liệu NoSQL
- **Mongoose** (8.0.3) - Object modeling cho MongoDB

### Xác Thực & Bảo Mật
- **bcryptjs** (2.4.3) - Mã hóa mật khẩu
- **jsonwebtoken** (9.0.2) - JWT authentication
- **helmet** (7.1.0) - Security headers
- **express-rate-limit** (7.1.5) - Giới hạn tỉ lệ yêu cầu
- **express-session** (1.17.3) - Quản lý phiên
- **connect-mongo** (5.1.0) - Lưu trữ phiên trên MongoDB

### Rendering Frontend
- **EJS** (3.1.9) - Template engine
- **Bootstrap** - UI framework

### Các Tiện Ích
- **multer** (1.4.5) - Xử lý tải lên tập tin
- **nodemailer** (6.9.7) - Dịch vụ gửi email
- **body-parser** (1.20.2) - Phân tích request body
- **method-override** (3.0.0) - Override HTTP method
- **dotenv** (16.3.1) - Biến môi trường
- **nodemon** (3.0.2) - Tự động tải lại khi phát triển

---

## 🗄️ Các Mô Hình Dữ Liệu

Ứng dụng sử dụng các collections MongoDB sau:

| Mô Hình | Mục Đích |
|-------|---------|
| **User** | Tài khoản khách hàng với thông tin hồ sơ |
| **Admin** | Tài khoản quản trị viên với quyền hạn |
| **Product** | Sản phẩm phụ kiện PC với giá và tồn kho |
| **Category** | Phân loại sản phẩm |
| **Cart** | Giỏ hàng của người dùng |
| **CartItem** | Các mục trong giỏ hàng |
| **Order** | Đơn hàng mua |
| **OrderItem** | Các mục dòng trong đơn hàng |
| **Address** | Địa chỉ giao hàng và thanh toán |
| **PaymentMethod** | Thông tin thanh toán |
| **Review** | Đánh giá và xếp hạng sản phẩm |
| **SavedCart** | Lịch sử giỏ hàng đã lưu |
| **Contact** | Các bài gửi biểu mẫu liên hệ |

---

## 🔐 Các Tính Năng Chính

### Xác Thực & Phân Quyền
- Đăng ký và đăng nhập người dùng
- Xác thực quản trị viên
- Xác thực dựa trên JWT token
- Kiểm soát truy cập dựa trên vai trò
- Mã hóa mật khẩu bằng bcryptjs

### Quản Lý Sản Phẩm
- Duyệt sản phẩm theo danh mục
- Tính năng tìm kiếm sản phẩm
- Chi tiết sản phẩm và thông số kỹ thuật
- Quản lý tồn kho
- Hỗ trợ giá giảm
- Đánh giá và xếp hạng sản phẩm

### Giỏ Hàng
- Thêm/xóa mục khỏi giỏ hàng
- Lưu giỏ hàng để dùng sau
- Giỏ hàng bền vững

### Quản Lý Đơn Hàng
- Đặt hàng
- Theo dõi lịch sử đơn hàng
- Xem chi tiết đơn hàng
- Hỗ trợ phương thức thanh toán
- Theo dõi trạng thái đơn hàng

### Bảng Điều Khiển Quản Trị
- Quản lý người dùng
- Quản lý tồn kho sản phẩm
- Quản lý danh mục
- Quản lý đơn hàng
- Xử lý các yêu cầu liên hệ
- Báo cáo bán hàng

### Bảo Mật
- Giới hạn tỉ lệ trên các endpoint API
- Bảo mật dựa trên phiên
- Content Security Policy (CSP)
- Mã hóa mật khẩu
- Xác thực đầu vào
- Middleware xử lý lỗi

---

## 🚀 Bắt Đầu

### Yêu Cầu Trước
- Node.js (v14 hoặc cao hơn)
- MongoDB (instance cục bộ hoặc trên cloud)
- npm hoặc yarn

### Cài Đặt

1. **Clone/Giải nén dự án**
   ```bash
   cd BE
   ```

2. **Cài đặt các gói phụ thuộc**
   ```bash
   npm install
   ```

3. **Cấu hình các biến môi trường**
   Tạo file `.env` trong thư mục gốc với:
   ```env
   MONGODB_URI=mongodb://localhost:27017/plt_shop
   SESSION_SECRET=your_session_secret
   JWT_SECRET=your_jwt_secret
   RATE_LIMIT_API=300
   RATE_LIMIT_LOGIN=5
   SMTP_SERVICE=gmail
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

4. **Tạo tài khoản quản trị** (tùy chọn)
   ```bash
   npm run create-admin
   ```

5. **Khởi động server**
   ```bash
   # Phát triển với tự động tải lại
   npm run dev

   # Sản xuất
   npm start
   ```

6. **Truy cập ứng dụng**
   - Frontend: http://localhost:3000
   - Bảng Điều Khiển Quản Trị: http://localhost:3000/admin

---

## 📡 Các API Endpoints

### Routes Xác Thực (`/api/auth`)
- `POST /register` - Đăng ký người dùng mới
- `POST /login` - Đăng nhập người dùng
- `POST /logout` - Đăng xuất người dùng
- `GET /profile` - Lấy hồ sơ người dùng

### Routes Sản Phẩm (`/api/products`)
- `GET /` - Lấy tất cả sản phẩm với phân trang
- `GET /:id` - Lấy chi tiết sản phẩm
- `GET /category/:categoryId` - Lấy sản phẩm theo danh mục
- `POST /` - Tạo sản phẩm (quản trị)
- `PUT /:id` - Cập nhật sản phẩm (quản trị)
- `DELETE /:id` - Xóa sản phẩm (quản trị)

### Routes Danh Mục (`/api/categories`)
- `GET /` - Lấy tất cả danh mục
- `GET /:id` - Lấy chi tiết danh mục
- `POST /` - Tạo danh mục (quản trị)
- `PUT /:id` - Cập nhật danh mục (quản trị)
- `DELETE /:id` - Xóa danh mục (quản trị)

### Routes Đơn Hàng (`/api/orders`)
- `GET /` - Lấy đơn hàng của người dùng
- `GET /:id` - Lấy chi tiết đơn hàng
- `POST /` - Tạo đơn hàng
- `PUT /:id` - Cập nhật trạng thái đơn hàng (quản trị)

### Routes Người Dùng (`/api/users`)
- `GET /` - Lấy tất cả người dùng (quản trị)
- `GET /:id` - Lấy hồ sơ người dùng
- `PUT /:id` - Cập nhật hồ sơ người dùng
- `DELETE /:id` - Xóa người dùng (quản trị)

### Routes Tìm Kiếm (`/api/search`)
- `GET /` - Tìm kiếm sản phẩm theo truy vấn

---

## 🔧 Phát Triển

### Các Script Khả Dụng

```bash
# Khởi động server phát triển với tự động tải lại
npm run dev

# Khởi động server sản xuất
npm start

# Tạo người dùng quản trị
npm run create-admin
```

### Middleware Stack
- **Xác Thực**: JWT và xác thực dựa trên phiên
- **Phân Quyền**: Kiểm soát truy cập dựa trên vai trò
- **Xử Lý Lỗi**: Xử lý lỗi tập trung
- **Giới Hạn Tỉ Lệ**: Ngăn chặn lạm dụng API
- **Bảo Mật**: Security headers và CSP

---

## 📝 Khởi Tạo Cơ Sở Dữ Liệu

Dự án bao gồm schema cơ sở dữ liệu trong `plt_shop.sql`. Để khởi tạo:

1. Nhập schema SQL nếu sử dụng SQL truyền thống
2. Hoặc sử dụng các mô hình Mongoose sẽ tự động tạo collections

Sử dụng script import-data nếu có dữ liệu mẫu:
```bash
node scripts/import-data.js
```

---

## 🛡️ Các Tính Năng Bảo Mật

- **Mã Hóa Mật Khẩu**: bcryptjs với salt rounds
- **Giới Hạn Tỉ Lệ**: Giới hạn có thể cấu hình trên endpoint API và đăng nhập
- **Quản Lý Phiên**: Lưu trữ phiên an toàn trên MongoDB
- **JWT Tokens**: Xác thực không trạng thái
- **Content Security Policy**: Ngăn chặn tấn công XSS
- **Helmet**: Security HTTP headers
- **Xác Thực Đầu Vào**: Xác thực cấp schema với Mongoose
- **Xử Lý Lỗi**: Ngăn chặn rò rỉ thông tin nhạy cảm

---

## 📊 Thông Báo Email

Ứng dụng sử dụng **Nodemailer** cho chức năng email:
- Xác nhận đơn hàng
- Email đặt lại mật khẩu
- Thông báo người dùng

Cấu hình cài đặt SMTP trong file `.env`.

---

## 🎨 Công Nghệ Frontend

- **Templating**: EJS
- **UI Framework**: Bootstrap 5
- **Thư viện JavaScript**:
  - Owl Carousel (carousel sản phẩm)
  - WOW.js (scroll animations)
  - Lightbox (thư viện ảnh)
  - CounterUp (hoạt hình thống kê)

---

## 🐛 Xử Lý Lỗi

Ứng dụng bao gồm xử lý lỗi toàn diện:
- Custom error handler middleware
- 404 Not Found handler
- Validation error responses
- Rate limit exceeded handler
- Database connection error handling

---

## 📈 Tối Ưu Hóa Hiệu Suất

- Giới hạn tỉ lệ để ngăn chặn quá tải
- Tối ưu hóa truy vấn Mongoose
- Caching file tĩnh
- Quản lý phiên với MongoDB store
- Các tài sản CSS và JS được biên dịch

---

## 🔄 Tải Lên Tập Tin

Ứng dụng sử dụng **Multer** để tải lên tập tin:
- Hình ảnh sản phẩm
- Ảnh đại diện người dùng
- Tải lên tài liệu

Cấu hình thư mục tải lên và giới hạn kích thước tệp trong controller files.

---

## 📄 Giấy Phép

Dự án này sử dụng template HTML Codex.
- Template: [Electro - Electronics Website Template](https://htmlcodex.com/electronics-website-template)
- Giấy Phép: https://htmlcodex.com/license

---

## 📞 Hỗ Trợ

Đối với các vấn đề hoặc câu hỏi:
1. Kiểm tra kết nối cơ sở dữ liệu trong `config/database.js`
2. Xác minh cấu hình file `.env`
3. Kiểm tra logs server Express để có chi tiết lỗi
4. Xem xét thiết lập middleware trong `server.js`

---

## 🎓 Tài Nguyên Học Tập

Dự án này minh họa:
- Thiết kế REST API
- Mẫu kiến trúc MVC
- MongoDB với Mongoose ODM
- Các mẫu Express.js middleware
- Xác thực phiên và JWT
- Best practices xử lý lỗi
- Giới hạn tỉ lệ và bảo mật
- Tích hợp dịch vụ email
- Xử lý tải lên tập tin

---

**Lần Cập Nhật Cuối**: Tháng 1 năm 2026
