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
- GET /payments/event/:eventId
- GET /payments/event/:eventId/revenue-summary

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

## 11. Email API
- POST /email/send-tickets/:orderId
- POST /email/send-confirmation/:orderId

## 12. Event Settings API
- GET /events/:eventId/settings
- PUT /events/:eventId/settings

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
- **GET** `/payments/event/:eventId` — Lấy tất cả payment của event (với pagination)
- **GET** `/payments/event/:eventId/revenue-summary` — Lấy tổng doanh thu và thống kê event
- **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN (trừ webhook)
- **Logic matching:**
  1. Ưu tiên orderId trong content
  2. Amount + thời gian gần
  3. Email user (nếu có)
  4. Nếu không match, lưu payment PENDING để admin match thủ công

**Payment Event APIs:**
- **GET** `/payments/event/:eventId` — Lấy danh sách payment của event
  - **Query Parameters:**
    - `limit` (optional): Số lượng records trả về (default: 3000)
    - `offset` (optional): Số lượng records bỏ qua (default: 0)
  - **Response:**
    ```json
    {
      "event": { "id": "event_cuid", "title": "Event Title" },
      "payments": [
        {
          "id": "payment_cuid",
          "amount": 199000,
          "status": "SUCCESS",
          "order": {
            "id": "order_cuid",
            "user": { "email": "user@example.com" },
            "order_items": [
              {
                "ticket": { "name": "Vé Đứng", "price": 199000 }
              }
            ]
          }
        }
      ],
      "pagination": { "total": 150, "limit": 3000, "offset": 0, "hasMore": false },
      "summary": { "totalRevenue": 29850000, "totalPayments": 150 }
    }
    ```

- **GET** `/payments/event/:eventId/revenue-summary` — Lấy tổng doanh thu và thống kê
  - **Description:** Tính tổng doanh thu, thống kê theo ngày, breakdown theo ticket type
  - **Response:**
    ```json
    {
      "event": { "id": "event_cuid", "title": "Event Title" },
      "summary": {
        "totalRevenue": 29850000,
        "totalPayments": 150,
        "totalOrders": 150,
        "averageOrderValue": 199000
      },
      "dailyStats": [
        {
          "date": "2025-07-27T00:00:00Z",
          "revenue": 1990000,
          "paymentCount": 10
        }
      ],
      "ticketStats": [
        {
          "ticket_name": "Vé Đứng",
          "total_quantity": 100,
          "total_revenue": 19900000,
          "order_count": 100
        }
      ]
    }
    ```

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

### 11. Email API
- **POST** `/email/send-tickets/:orderId` — Gửi email vé điện tử với PDF đính kèm
  - **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
  - **Description:** Gửi email chứa vé điện tử PDF cho đơn hàng đã thanh toán thành công
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Email sent successfully with PDF tickets attached",
      "ticketsSent": 3,
      "orderNumber": "order_cuid",
      "sentAt": "2024-01-15T14:30:25.000Z",
      "emailId": "resend_email_id",
      "attachments": ["file1.pdf", "file2.pdf", "file3.pdf"]
    }
    ```
  - **Error Responses:**
    - `400`: Đơn hàng chưa thanh toán hoặc không tìm thấy
    - `403`: Không có quyền truy cập

- **POST** `/email/send-confirmation/:orderId` — Gửi email xác nhận đặt vé thành công
  - **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
  - **Description:** Gửi email xác nhận đặt vé (không kèm PDF) để thông báo cho user biết đơn hàng đã được ghi nhận
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Order confirmation email sent successfully",
      "orderNumber": "order_cuid",
      "sentAt": "2024-01-15T14:30:25.000Z",
      "emailId": "resend_email_id"
    }
    ```
  - **Error Responses:**
    - `400`: Không tìm thấy đơn hàng hoặc email user
    - `403`: Không có quyền truy cập

### 12. Event Settings API
- **GET** `/events/:eventId/settings` — Lấy cài đặt email tự động cho event
  - **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
  - **Description:** Lấy cài đặt auto send confirm email và ticket email cho event
  - **Response:**
    ```json
    {
      "auto_send_confirm_email": true,
      "auto_send_ticket_email": false
    }
    ```
  - **Error Responses:**
    - `404`: Event not found
    - `403`: Access denied

- **PUT** `/events/:eventId/settings` — Cập nhật cài đặt email tự động cho event
  - **Required Role:** ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
  - **Description:** Cập nhật cài đặt auto send confirm email và ticket email cho event
  - **Body:**
    ```json
    {
      "auto_send_confirm_email": true,
      "auto_send_ticket_email": false
    }
    ```
  - **Response:** Tương tự GET
  - **Error Responses:**
    - `404`: Event not found
    - `403`: Access denied

**Logic Auto Send Email:**
1. **Auto send confirm email = true, Auto send ticket email = false:**
   - ✅ Gửi confirm email tự động khi order PAID
   - ❌ Không gửi ticket email tự động
   - 📧 Ticket email phải gửi thủ công qua API

2. **Auto send ticket email = true (bất kể confirm email):**
   - ✅ Gửi ticket email tự động khi order PAID
   - ❌ Không gửi confirm email (dù có bật hay không)
   - 📧 Confirm email không được gửi

3. **Cả hai đều false:**
   - ❌ Không gửi email tự động
   - 📧 Phải gửi thủ công qua API

**Luồng Email:**
1. **Email xác nhận:** Gửi ngay sau khi đặt vé thành công để thông báo cho user
2. **Email vé điện tử:** Gửi sau khi thanh toán thành công với PDF vé đính kèm
3. **Auto Email:** Tự động gửi email dựa trên cài đặt của event khi thanh toán thành công

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