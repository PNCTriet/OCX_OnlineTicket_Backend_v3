# 🧾 Backend Ticketing System - Todo List by Phases

> **Multi-tenant online ticketing system** với NestJS + Prisma + Supabase  
> **Mục tiêu:** API-first backend phục vụ mua vé, thanh toán, checkin, và dashboard thống kê

---

## 🚀 Phase 1: Project Setup & Authentication
- [x] Project setup, Prisma, Supabase Auth, JWT Middleware, User mapping

## 🚦 Phase 2: Vé điện tử & QR Code
- [x] CRUD Order/OrderItem
- [x] Sinh QR code cho từng vé (order_item_code) khi order PAID
- [x] API CRUD cho order_item_code (SUPERADMIN)
- [x] API checkin sử dụng order_item_code
- [x] Swagger & API doc cho order_item_code

## 🎫 Phase 3: Event & Ticket Management
- [x] CRUD Event, Ticket, quản lý số lượng, trạng thái, thời gian mở bán

## 🧾 Phase 4: Order & Booking
- [x] CRUD Order, OrderItem
- [x] Tạm giữ vé (reserved_until), huỷ đơn tự động nếu timeout
- [x] Trạng thái đơn: PENDING, RESERVED, PAID, CANCELLED, EXPIRED
- [x] Scheduled task tự động expire order
- [x] API expire orders, check expiration

## 💸 Phase 5: Payment Gateway Integration
- [x] Tích hợp Sepay webhook: POST /payments/webhook/sepay
- [x] API: GET /payments/order/:orderId, /payments/match/:orderId, /payments/unmatched, /payments/pending-orders
- [x] Logic matching thông minh: orderId trong content, amount+time, email, fallback admin match
- [x] Lưu log giao dịch, trạng thái payment

## 📩 Phase 6: Email & QR Automation
- [x] QR code upload Supabase Storage, unique QR data, verify QR

## ✅ Phase 7: Check-in System
- [x] API: POST /checkin/verify-qr, GET /checkin/logs, GET /checkin/stats/:eventId
- [x] Check-in validation: order PAID, chưa check-in, đúng event, event timing, duplicate prevention

## 📊 Phase 8: Dashboard & Analytics
- [x] API: /dashboard/system, /dashboard/organization/:id, /dashboard/event/:id, /dashboard/organization/:id/export/pdf|csv, /dashboard/organization/:id/send-report
- [x] Thống kê doanh thu, vé bán, đơn hàng, xuất CSV/PDF, gửi email

## 🌐 Phase 9: Webhook & Retry
- [ ] Webhook_logs, gửi webhook cho tổ chức, retry tự động nếu lỗi

## 🛠️ Phase 10: DevOps, Testing, Documentation
- [ ] Unit test, e2e test cho các module chính
- [x] Swagger API docs, chuẩn hoá tài liệu

---

## 🎯 **Tính năng đã hoàn thành:**
- [x] QR Code System: Sinh mã khi order PAID, lưu order_item_code, API quản lý (SUPERADMIN)
- [x] Check-in System: API verify QR, logs, stats, validation rules
- [x] Order Expiration: Scheduled task, API expire/check-expiration
- [x] Payment: Webhook Sepay, matching logic, CRUD, unmatched, pending orders
- [x] Dashboard: System/org/event, export CSV/PDF, gửi email

---

## 🚀 **API chính hiện có:**
- Auth: /auth/login, /auth/register, /auth/me, /auth/logout, /auth/refresh
- User: CRUD /users
- Organization: CRUD /organizations
- Event: CRUD /events
- Ticket: CRUD /tickets
- Order: CRUD /orders, /orders/:id/items, /orders/:id/payments
- Order Expiration: /orders/expire-expired, /orders/:id/check-expiration
- Order Item Code (SUPERADMIN): /order-item-codes, /order-item-codes/:id
- Check-in: /checkin/verify-qr, /checkin/logs, /checkin/stats/:eventId
- Payment: /payments/webhook/sepay, /payments/order/:orderId, /payments/match/:orderId, /payments/unmatched, /payments/pending-orders
- Dashboard: /dashboard/system, /dashboard/organization/:id, /dashboard/event/:id, /dashboard/organization/:id/export/pdf|csv, /dashboard/organization/:id/send-report

---

**Next Steps:**
- [ ] Phase 9: Webhook system (gửi webhook cho tổ chức, retry)
- [ ] Phase 10: Unit test, e2e test, checklist production

---

**Hệ thống đã hoàn thiện các flow chính: đặt vé, giữ vé, expire, QR code, check-in, payment (Sepay), matching thông minh, API documentation đầy đủ, và có thể mở rộng cho các cổng thanh toán khác.** 