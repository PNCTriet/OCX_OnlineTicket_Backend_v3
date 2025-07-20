# 📚 API Documentation

> **Lưu ý về xác thực:**
> - Hệ thống sử dụng xác thực JWT chuẩn HS256 (Legacy JWT Secret của Supabase).
> - Tất cả các API bảo vệ đều yêu cầu header: `Authorization: Bearer <ACCESS_TOKEN>`
> - **Swagger UI:** Truy cập `http://localhost:3000/api/docs` để test API với giao diện web

---

## 1. Auth API
- /auth/login, /auth/register, /auth/me, /auth/logout, /auth/refresh

## 2. Users API
- CRUD /users

## 3. Organizations API
- CRUD /organizations

## 4. Events API
- CRUD /events

## 5. Tickets API
- CRUD /tickets

## 6. Orders API
- CRUD /orders, /orders/:id/items, /orders/:id/payments
- **GET /orders/event/:eventId/items** — Lấy order items theo event ID
- Order Expiration: /orders/expire-expired, /orders/:id/check-expiration
- **PATCH /orders/:id/sending-status** — Cập nhật trạng thái gửi mail ticket cho order (NOT_SENT, SENDING, SENT, FAILED)

## 7. Order Item Codes API (SUPERADMIN only)
- GET /order-item-codes
- GET /order-item-codes/:id
- PATCH /order-item-codes/:id
- DELETE /order-item-codes/:id

## 8. Check-in API
- POST /checkin/verify-qr
- GET /checkin/logs
- GET /checkin/stats/:eventId

## 9. Payment API
- POST /payments/webhook/sepay
- GET /payments/order/:orderId
- GET /payments/match/:orderId
- GET /payments/unmatched
- GET /payments/pending-orders

## 10. Dashboard API
- GET /dashboard/system
- GET /dashboard/system/time
- GET /dashboard/organization/:id
- GET /dashboard/organization/:id/time
- GET /dashboard/organization/:id/export/pdf
- GET /dashboard/organization/:id/export/csv
- POST /dashboard/organization/:id/send-report
- GET /dashboard/event/:id
- GET /dashboard/event/:id/time

---

## **Chi tiết các API mới/cập nhật:**

### 7. Order Item Codes API (SUPERADMIN only)
- **GET** `/order-item-codes` — Lấy danh sách mã code (query: orderItemId)
- **GET** `/order-item-codes/:id` — Xem chi tiết mã code
- **PATCH** `/order-item-codes/:id` — Cập nhật trạng thái mã code (used, used_at)
- **DELETE** `/order-item-codes/:id` — Xoá mã code
- **Required Role:** SUPERADMIN

### 8. Check-in API
- **POST** `/checkin/verify-qr` — Xác thực QR, check-in
- **GET** `/checkin/logs` — Lấy logs check-in (query: eventId, orderId)
- **GET** `/checkin/stats/:eventId` — Thống kê check-in theo event

### 9. Payment API
- **POST** `/payments/webhook/sepay` — Nhận webhook từ Sepay
- **GET** `/payments/order/:orderId` — Lấy payment theo order
- **GET** `/payments/match/:orderId` — Match thủ công payment với order
- **GET** `/payments/unmatched` — Danh sách payment chưa match
- **GET** `/payments/pending-orders` — Danh sách order chờ thanh toán
- **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN (trừ webhook)
- **Logic matching:**
  1. Ưu tiên orderId trong content
  2. Amount + thời gian gần
  3. Email user (nếu có)
  4. Nếu không match, lưu payment PENDING để admin match thủ công

### 10. Dashboard API
- **GET** `/dashboard/system` — Thống kê tổng quan hệ thống
- **GET** `/dashboard/system/time` — Thống kê hệ thống theo thời gian
  - **Query Parameters:**
    - `from` (required): Ngày bắt đầu (YYYY-MM-DD)
    - `to` (required): Ngày kết thúc (YYYY-MM-DD)
    - `groupBy` (optional): 'day' | 'week' | 'month' (default: 'day')
  - **Response:**
    ```json
    [
      {
        "time": "2025-01-16",
        "revenue": 500000,
        "tickets_sold": 10,
        "events_created": 2,
        "organizations_created": 1
      }
    ]
    ```
- **GET** `/dashboard/organization/:id` — Thống kê tổ chức
- **GET** `/dashboard/organization/:id/time` — Thống kê tổ chức theo thời gian
- **GET** `/dashboard/organization/:id/export/pdf|csv` — Xuất báo cáo tổ chức PDF/CSV
- **POST** `/dashboard/organization/:id/send-report` — Gửi báo cáo tổ chức qua email
- **GET** `/dashboard/event/:id` — Thống kê sự kiện
- **GET** `/dashboard/event/:id/time` — Thống kê sự kiện theo thời gian

### 6. Orders API (bổ sung)
- **GET** `/orders/event/:eventId/items` — Lấy order items theo event ID
  - **Required Role:** USER (cần JWT token)
  - **Response:**
    ```json
    {
      "event_id": "event_cuid",
      "event_name": "Event Title",
      "total_items": 5,
      "items": [
        {
          "id": "item_cuid",
          "quantity": 2,
          "price": 100000,
          "order": {
            "id": "order_cuid",
            "status": "PAID",
            "created_at": "2025-01-16T10:30:00Z",
            "user": {
              "id": "user_cuid",
              "email": "user@example.com",
              "first_name": "John",
              "last_name": "Doe"
            }
          },
          "ticket": {
            "id": "ticket_cuid",
            "name": "VIP Ticket",
            "price": 100000,
            "description": "VIP access"
          },
          "codes": [
            {
              "id": "code_cuid",
              "code": "qr_hash",
              "used": false,
              "used_at": null,
              "created_at": "2025-01-16T10:30:00Z"
            }
          ]
        }
      ]
    }
    ```
  - **Description:**
    Lấy tất cả order items của một event cụ thể, bao gồm thông tin order, user, ticket và QR codes.

- **PATCH** `/orders/:id/sending-status` — Cập nhật trạng thái gửi mail ticket cho order
  - **Body:**
    ```json
    { "sending_status": "SENT" }
    ```
  - **Required Role:** USER (chủ order) hoặc ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
  - **Response:**
    ```json
    { "message": "Order sending_status updated", "order": { ...order } }
    ```
  - **Description:**
    Cho phép FE cập nhật trạng thái gửi mail ticket cho order (NOT_SENT, SENDING, SENT, FAILED) sau khi gửi mail thành công/thất bại.

---

## **Phân quyền (Role):**
- USER: Tạo order, xem order của mình
- ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN: Quản lý tất cả order, payment, dashboard
- SUPERADMIN: Quản lý order_item_code

---

## **Ví dụ cURL và response mẫu:**
(Đã có chi tiết ở từng section phía trên, giữ nguyên các ví dụ cũ, bổ sung ví dụ cho các API mới nếu cần)

---

## **Trạng thái hệ thống:**
- Đã hoàn thiện các flow chính: đặt vé, giữ vé, expire, QR code, check-in, payment (Sepay), matching thông minh, API documentation đầy đủ, và có thể mở rộng cho các cổng thanh toán khác.

---

**Next Steps:**
- [ ] Webhook system (gửi webhook cho tổ chức, retry)
- [ ] Unit test, e2e test, checklist production 