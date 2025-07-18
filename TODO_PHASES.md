# 🧾 Backend Ticketing System - Todo List by Phases

> **Multi-tenant online ticketing system** với NestJS + Prisma + Supabase  
> **Mục tiêu:** API-first backend phục vụ mua vé, thanh toán, checkin, và dashboard thống kê

---

## 🚀 Phase 1: Project Setup & Authentication
- [x] Khởi tạo project NestJS, cài đặt Prisma, Supabase, cấu hình env
- [x] Thiết lập schema, migration, kết nối database
- [x] Tích hợp Supabase Auth, tạo Auth module, JWT guard
- [x] Xây dựng API: `/auth/register`, `/auth/login`, `/auth/me`
- [x] Viết tài liệu API (API_DOCUMENTATION.md)
- [x] Sửa lỗi JWT authentication và mapping user local

---

## 🔐 Phase 2: Authorization & User/Organization
- [x] Enum roles: USER, ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
- [x] Guard kiểm tra phân quyền theo từng API
- [x] Decorator `@Roles()` cho controller
- [x] Module users: CRUD user, mapping supabase_id
- [x] Module organizations: CRUD tổ chức, phân quyền
- [x] API: `/users`, `/organizations`, `/user-organizations`
- [x] Thêm `@ApiBearerAuth()` cho tất cả protected endpoints

---

## 🎫 Phase 3: Event & Ticket Management
- [x] Module events: CRUD sự kiện
  - [x] API: `GET /events`, `GET /events/:id`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
- [x] Module tickets: CRUD vé sự kiện
  - [x] API: `GET /tickets`, `GET /tickets/:id`, `POST /tickets`, `PUT /tickets/:id`, `DELETE /tickets/:id`, `GET /tickets/event/:event_id`
- [x] Quản lý số lượng vé, thời gian mở bán, trạng thái vé

---

## 🧾 Phase 4: Order & Booking
- [x] Module orders: tạo đơn hàng, kiểm tra tồn kho
  - [x] API: `POST /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `GET /orders`
- [x] Tạm giữ vé (`reserved_until`), huỷ đơn tự động nếu timeout
- [x] Quản lý trạng thái đơn: PENDING, RESERVED, PAID, CANCELLED, EXPIRED
- [x] Logic nghiệp vụ: kiểm tra tồn kho, transaction, hoàn trả vé khi huỷ
- [x] **Scheduled task** để tự động chuyển PENDING → EXPIRED sau 10 phút
- [x] **Order expiration system** với cron job mỗi 5 phút
- [x] **API expire orders**: `POST /orders/expire-expired`, `GET /orders/:id/check-expiration`

---

## 📩 Phase 6: Email & QR Automation
- [x] **QR Code Generation** cho từng order item
  - [x] Upload QR lên Supabase Storage
  - [x] Unique QR data với hash, timestamp, order info
  - [x] QR Service với verify và generate methods
- [x] **Tự động generate QR** khi tạo order
- [x] **QR code data structure** với orderId, orderItemId, ticketId, quantity, timestamp, hash
- [x] **QR code verification** với timestamp validation (24 giờ)

---

## ✅ Phase 7: Check-in System
- [x] **Module checkin**: xác thực QR, ghi log checkin
- [x] **API**: `POST /checkin/verify-qr`, `GET /checkin/logs`, `GET /checkin/stats/:eventId`
- [x] **QR code verification** và check-in logic
- [x] **Kiểm tra hợp lệ**: order status PAID, chưa check-in, đúng event timing
- [x] **Event timing check**: 2 giờ trước/sau event
- [x] **Duplicate prevention**: Không cho check-in 2 lần
- [x] **Check-in logs** và thống kê
- [x] **Check-in stats** theo event

---

## 💸 Phase 5: Payment Gateway Integration
- [ ] Module payments: tích hợp Stripe, Momo
- [ ] API: `POST /orders/:id/pay`, webhook cập nhật trạng thái
- [ ] Xử lý thanh toán, cập nhật đơn hàng khi thành công
- [ ] Lưu log giao dịch, trạng thái payment

---

## 📊 Phase 8: Dashboard & Analytics
- [x] Module dashboard: tổng quan doanh thu, vé bán, hiệu suất sự kiện
- [x] API: `/dashboard/system`, `/dashboard/organization/:id`, `/dashboard/event/:id`
- [x] Thống kê theo tổ chức, sự kiện, khung giờ
- [x] Export CSV, PDF, gửi báo cáo qua email
- [x] Thống kê doanh thu theo ngày, tháng, năm
- [ ] Các thống kê phụ vụ cho project theo tiêu chuẩn global

---

## 🌐 Phase 9: Webhook & Retry
- [ ] Module webhook_logs: ghi log khi đơn hàng tạo, thanh toán, checkin
- [ ] Gửi webhook cho tổ chức, retry tự động nếu lỗi (BullMQ)
- [ ] API: `/webhooks`

---

## 🛠️ Phase 10: DevOps, Testing, Documentation
- [ ] Viết unit test, e2e test cho các module chính
- [x] Tích hợp Swagger cho API docs
- [x] Chuẩn hoá README, tài liệu API, hướng dẫn deploy
- [ ] Checklist production: env, SSL, domain, monitoring, backup

---

## 🎯 **Tính năng mới đã hoàn thành:**

### ✅ **QR Code System:**
- [x] **QR Service** với generate và upload lên Supabase Storage
- [x] **Unique QR data** với orderId, orderItemId, ticketId, quantity, timestamp, hash
- [x] **QR verification** với timestamp validation (24 giờ)
- [x] **Auto-generate QR** khi tạo order
- [x] **QR code URL** lưu vào order_item.qr_code

### ✅ **Check-in System:**
- [x] **Check-in Service** với verify QR và xử lý check-in
- [x] **Check-in Controller** với API endpoints
- [x] **Check-in validation**: order PAID, chưa check-in, đúng event timing
- [x] **Check-in logs** và thống kê
- [x] **Event timing check**: 2 giờ trước/sau event

### ✅ **Order Expiration System:**
- [x] **Scheduled task** chạy mỗi 5 phút để expire orders
- [x] **Auto hoàn trả vé** khi order expire
- [x] **API expire orders**: `POST /orders/expire-expired`
- [x] **Check expiration**: `GET /orders/:id/check-expiration`

### ✅ **Enhanced Order Management:**
- [x] **10 phút reservation** thay vì 15 phút
- [x] **QR codes trong order response**
- [x] **Enhanced order details** với QR codes
- [x] **Type safety** với OrderItem type

---

**🎉 Phase 4, 6, 7 đã hoàn thành với đầy đủ tính năng QR Code và Check-in!**

**📋 Next Priority:** Phase 5 (Payment Gateway) và Phase 9 (Webhook System) 