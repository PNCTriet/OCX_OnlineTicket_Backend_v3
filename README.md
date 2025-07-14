
# 🧾 Backend Bán Vé Online – Overview

## 🧩 Tổng Quan
Hệ thống backend hỗ trợ nền tảng bán vé online theo mô hình **multi-tenant**, nơi mỗi tổ chức (organization) có thể tạo sự kiện riêng, phát hành vé, xử lý thanh toán và theo dõi check-in. Dữ liệu được phân quyền nghiêm ngặt theo tổ chức và người dùng.

## 🌐 Tech Stack

| Thành phần            | Công nghệ sử dụng                 | Vai trò chính                                             |
| --------------------- | --------------------------------- | --------------------------------------------------------- |
| **Framework Backend** | `NestJS`                          | Modular backend framework, Dependency Injection, scalable |
| **Database**          | `Supabase` (PostgreSQL)           | Cơ sở dữ liệu chính, hỗ trợ realtime, RLS, policy         |
| **ORM**               | `Prisma`                          | Query database, định nghĩa schema rõ ràng                 |
| **Auth**              | `Supabase Auth + Local Mapping`   | Xác thực người dùng, role lưu tại DB local                |
| **Queue & Jobs**      | `BullMQ` (Redis)                  | Xử lý tác vụ bất đồng bộ như gửi email, webhook           |
| **Email service**     | `Resend` / `SendGrid`             | Gửi vé điện tử, thông báo                                 |
| **QR Code**           | `node-qrcode`                     | Sinh mã QR để check-in                                   |
| **Realtime**          | `Supabase Realtime` / `Socket.IO` | Hỗ trợ check-in realtime                                 |
| **File Storage**      | `Supabase Storage`                | Lưu banner, mã QR                                         |
| **Monitoring**        | `Sentry`, `PostHog` (optional)    | Theo dõi lỗi và hành vi người dùng                        |
| **BI / Dashboard**    | `Metabase` hoặc custom API        | Thống kê, báo cáo                                         |

## 🧱 Kiến Trúc

- **Multi-Tenant:** Mỗi `User` có thể thuộc nhiều `Organization` thông qua bảng `UserOrganization`. Toàn bộ entity (event, ticket, order, ...) đều gắn `organization_id`.
- **Role-Based Access:** Quyền truy cập được kiểm soát qua enum `UserRole`. Guard đảm bảo user chỉ thao tác với tổ chức mình thuộc về.
- **Email/QR Automation:** Hệ thống queue gửi mail tự động sau thanh toán, đính kèm mã QR, log trạng thái gửi.

## 📁 Cấu trúc thư mục đề xuất

```
src/
├── auth/               // Xử lý xác thực Supabase, JWT middleware
├── users/              // Thông tin người dùng, phân quyền
├── organizations/      // Tổ chức sự kiện
├── events/             // CRUD sự kiện
├── tickets/            // CRUD loại vé
├── orders/             // Tạo và quản lý đơn hàng
├── payments/           // Xử lý thanh toán
├── checkin/            // API check-in từ mã QR
├── queue/              // BullMQ worker cho email, webhook
├── common/             // Guard, Decorator, Interceptor, DTO
└── main.ts             // Entry point chính
```

## 🔐 Bảo mật & Phân quyền

- Tích hợp Supabase Auth (JWT)
- Mapping `supabase_id` sang user trong bảng `users`
- Guard kiểm tra quyền truy cập theo tổ chức
- Bảo vệ tất cả route ghi dữ liệu bằng middleware và decorator tùy biến

## 🌍 API Design

- RESTful chuẩn hoá: `GET`, `POST`, `PUT`, `DELETE`
- Swagger UI để kiểm thử API
- Middleware decode token, inject `user`, `roles`, `organization_id`
- Đảm bảo separation giữa FE/BE, dễ mở rộng về sau cho mobile app

## ✅ Khả năng mở rộng

- Tích hợp thêm Momo/Stripe không ảnh hưởng core logic
- Mỗi tổ chức có thể quản lý webhook riêng
- Có thể deploy tách riêng worker queue để xử lý async (email, webhook, thống kê...)

---

**Powered by NestJS + Prisma + Supabase + Redis + Cursor IDE.**
