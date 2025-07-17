# 📚 API Documentation

> **Lưu ý về xác thực:**
> - Hệ thống sử dụng xác thực JWT chuẩn HS256 (Legacy JWT Secret của Supabase).
> - Biến môi trường: `SUPABASE_JWT_SECRET` (bắt buộc), `SUPABASE_JWT_ALGORITHM=HS256` (mặc định).
> - Tất cả các API bảo vệ (orders, dashboard, ...) đều yêu cầu header:
>   `Authorization: Bearer <ACCESS_TOKEN>`
> - Để lấy access token, hãy đăng nhập qua `/auth/login` và dùng giá trị `access_token` trả về.
> - **Swagger UI:** Truy cập `http://localhost:3000/api/docs` để test API với giao diện web
> - **Authorize trong Swagger:** Click nút "Authorize" (🔒) và nhập `Bearer <ACCESS_TOKEN>`
> - Trong các ví dụ cURL bên dưới, hãy thay `<ACCESS_TOKEN>` bằng token thực tế của bạn.

---

## 🔐 **Authentication Flow**

### 1. **Login để lấy JWT Token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trietnguyenpham@gmail.com", "password": "123123"}'
```

### 2. **Authorize trong Swagger:**
- Vào `http://localhost:3000/api/docs`
- Click nút **"Authorize"** (🔒)
- Nhập: `Bearer YOUR_JWT_TOKEN`
- Click "Authorize" → "Close"

### 3. **Test API với JWT:**
- Tất cả API có biểu tượng 🔒 sẽ tự động gửi JWT token
- Không cần nhập token thủ công cho từng request

---

## 1. Auth API

> Hệ thống xác thực sử dụng Supabase Auth + NestJS

---

## 1.1. Đăng ký tài khoản

### Endpoint
- **POST** `/auth/register`

### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Response
- Nếu thành công:
```json
{
  "user": { ... },
  "message": "Please check your email to confirm registration."
}
```
- Nếu lỗi:
```json
{
  "error": "Email already registered"
}
```

### Test cURL
```sh
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}'
```

---

## 1.2. Đăng nhập

### Endpoint
- **POST** `/auth/login`

### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Response
- Nếu thành công:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6IkFMYVBndjVpNjN6VnFNZjEiLCJ0eXAiOiJKV1QifQ...",
  "refresh_token": "2kez5k7pqefy",
  "user": {
    "id": "bddbe590-ab98-41c1-94cb-737300695027",
    "email": "trietnguyenpham@gmail.com",
    "role": "authenticated",
    ...
  }
}
```
- Nếu lỗi:
```json
{
  "error": "Invalid login credentials"
}
```

### Test cURL
```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}'
```

---

## 1.3. Lấy thông tin user hiện tại (yêu cầu JWT)

### Endpoint
- **GET** `/auth/me`

### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

### Response
- Nếu token hợp lệ:
```json
{
  "user": {
    "id": "cmd4rgj6g0000jk44y1fhwyl1",
    "supabase_id": "bddbe590-ab98-41c1-94cb-737300695027",
    "email": "trietnguyenpham@gmail.com",
    "first_name": null,
    "last_name": null,
    "role": "USER",
    "created_at": "2025-07-16T07:58:53.085Z",
    "updated_at": "2025-07-16T19:28:21.293Z"
  }
}
```
- Nếu token không hợp lệ:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Test cURL
```sh
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 1.4. Đăng xuất (yêu cầu JWT)

### Endpoint
- **POST** `/auth/logout`

### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

### Response
- Nếu thành công:
```json
{
  "message": "Logged out successfully"
}
```
- Nếu lỗi:
```json
{
  "error": "Error message"
}
```

### Test cURL
```sh
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 1.5. Refresh Token

### Endpoint
- **POST** `/auth/refresh`

### Request Body
```json
{
  "refresh_token": "your_refresh_token"
}
```

### Response
- Nếu thành công:
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "user": { ... }
}
```
- Nếu lỗi:
```json
{
  "error": "Invalid refresh token"
}
```

### Test cURL
```sh
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your_refresh_token"}'
```

---

## 1.6. Error Handling

### Các lỗi thường gặp:

#### Email đã tồn tại khi đăng ký:
```json
{
  "error": "User already registered"
}
```

#### Sai email/password khi đăng nhập:
```json
{
  "error": "Invalid login credentials"
}
```

#### Token hết hạn hoặc không hợp lệ:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Refresh token không hợp lệ:
```json
{
  "error": "Invalid refresh token"
}
```

---

## 1.7. Case test thực tế

### Đăng ký user mới
```sh
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@1234"}'
```

### Đăng nhập user đã đăng ký
```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trietnguyenpham@gmail.com","password":"123123"}'
```

### Lấy thông tin user hiện tại
```sh
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Refresh token khi access token hết hạn
```sh
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

### Đăng xuất
```sh
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 1.8. Lưu ý
- Password phải đủ mạnh theo yêu cầu của Supabase.
- Sau khi đăng ký, user cần xác nhận email (check email để activate tài khoản).
- Access token có thời hạn, nếu hết hạn cần dùng refresh token để lấy token mới.
- Sau khi logout, token sẽ không còn hiệu lực.
- **Swagger UI:** Tất cả API protected đều có biểu tượng 🔒 và yêu cầu authorize trước khi test.

---

## 2. Users API

> CRUD user, mapping supabase_id. (Hiện tại chưa phân quyền, sẽ bổ sung ở phase sau)

### 2.1. Tạo user
- **POST** `/users`
- **Body:**
```json
{
  "supabase_id": "uuid",
  "email": "user@gmail.com",
  "first_name": "Nguyen",
  "last_name": "Van A",
  "phone": "0123456789",
  "avatar_url": "https://example.com/avatar.png"
}
```
- **Response:**
```json
{
  "id": "...",
  "supabase_id": "...",
  "email": "...",
  ...
}
```

### 2.2. Lấy danh sách user
- **GET** `/users`
- **Response:**
```json
[
  { "id": "...", "email": "...", ... },
  ...
]
```

### 2.3. Lấy chi tiết user
- **GET** `/users/:id`
- **Response:**
```json
{
  "id": "...",
  "email": "...",
  ...
}
```

### 2.4. Cập nhật user
- **PATCH** `/users/:id`
- **Body:**
```json
{
  "first_name": "Nguyen",
  "last_name": "Van B"
}
```
- **Response:**
```json
{
  "id": "...",
  "first_name": "Nguyen",
  "last_name": "Van B",
  ...
}
```

### 2.5. Xóa user
- **DELETE** `/users/:id`
- **Response:**
```json
{
  "id": "...",
  ...
}
```

---

## 3. Organizations API

> CRUD tổ chức, phân quyền sẽ bổ sung ở phase sau.

### 3.1. Tạo tổ chức
- **POST** `/organizations`
- **Body:**
```json
{
  "name": "Howls Studio",
  "description": "Tổ chức sự kiện âm nhạc",
  "contact_email": "contact@howls.studio",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "logo_url": "https://howls.studio/logo.png",
  "website": "https://howls.studio"
}
```
- **Response:**
```json
{
  "id": "...",
  "name": "Howls Studio",
  ...
}
```

### 3.2. Lấy danh sách tổ chức
- **GET** `/organizations`
- **Response:**
```json
[
  { "id": "...", "name": "...", ... },
  ...
]
```

### 3.3. Lấy chi tiết tổ chức
- **GET** `/organizations/:id`
- **Response:**
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

### 3.4. Cập nhật tổ chức
- **PATCH** `/organizations/:id`
- **Body:**
```json
{
  "name": "Howls Studio New"
}
```
- **Response:**
```json
{
  "id": "...",
  "name": "Howls Studio New",
  ...
}
```

### 3.5. Xóa tổ chức
- **DELETE** `/organizations/:id`
- **Response:**
```json
{
  "id": "...",
  ...
}
```

---

## 4. Events API

> CRUD sự kiện. (Hiện tại chưa phân quyền, sẽ bổ sung ở phase sau)

### 4.1. Tạo sự kiện
- **POST** `/events`
- **Body:**
```json
{
  "organization_id": "org_cuid",
  "title": "Sự kiện âm nhạc Howls",
  "description": "Đêm nhạc Howls Studio",
  "location": "Nhà hát Hòa Bình",
  "start_date": "2025-08-01T19:00:00.000Z",
  "end_date": "2025-08-01T22:00:00.000Z",
  "banner_url": "https://howls.studio/banner.png",
  "status": "DRAFT"
}
```
- **Response:**
```json
{
  "id": "...",
  "organization_id": "...",
  "title": "...",
  ...
}
```

### 4.2. Lấy danh sách sự kiện
- **GET** `/events`
- **Response:**
```json
[
  { "id": "...", "title": "...", ... },
  ...
]
```

### 4.3. Lấy chi tiết sự kiện
- **GET** `/events/:id`
- **Response:**
```json
{
  "id": "...",
  "title": "...",
  ...
}
```

### 4.4. Cập nhật sự kiện
- **PATCH** `/events/:id`
- **Body:**
```json
{
  "title": "Sự kiện mới"
}
```
- **Response:**
```json
{
  "id": "...",
  "title": "Sự kiện mới",
  ...
}
```

### 4.5. Xóa sự kiện
- **DELETE** `/events/:id`
- **Response:**
```json
{
  "id": "...",
  ...
}
```

---

## 5. Tickets API

> CRUD vé sự kiện, quản lý số lượng, thời gian mở bán, trạng thái vé. (Hiện tại chưa phân quyền, sẽ bổ sung ở phase sau)

### 5.1. Tạo vé
- **POST** `/tickets`
- **Body:**
```json
{
  "event_id": "event_cuid",
  "name": "Vé VIP",
  "description": "Ghế VIP gần sân khấu",
  "price": 1000000,
  "total_qty": 100,
  "sale_start": "2025-08-01T08:00:00.000Z",
  "sale_end": "2025-08-01T20:00:00.000Z",
  "status": "ACTIVE"
}
```
- **Response:**
```json
{
  "id": "...",
  "event_id": "...",
  "name": "...",
  ...
}
```

### 5.2. Lấy danh sách vé
- **GET** `/tickets`
- **Response:**
```json
[
  { "id": "...", "name": "...", ... },
  ...
]
```

### 5.3. Lấy chi tiết vé
- **GET** `/tickets/:id`
- **Response:**
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

### 5.4. Cập nhật vé
- **PATCH** `/tickets/:id`
- **Body:**
```json
{
  "name": "Vé VIP mới"
}
```
- **Response:**
```json
{
  "id": "...",
  "name": "Vé VIP mới",
  ...
}
```

### 5.5. Xóa vé
- **DELETE** `/tickets/:id`
- **Response:**
```json
{
  "id": "...",
  ...
}
```

### 5.6. Lấy vé theo sự kiện
- **GET** `/tickets/event/:event_id`
- **Response:**
```json
[
  { "id": "...", "event_id": "...", ... },
  ...
]
```

---

## 6. Orders API

> **Core business logic** - Tạo đơn hàng, kiểm tra tồn kho, quản lý trạng thái. (Yêu cầu JWT)

### 6.1. Tạo đơn hàng

#### Endpoint
- **POST** `/orders`

#### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

#### Request Body
```json
{
  "organization_id": "cmd5g7d2w0003v78sdjha8onv",
  "event_id": "cmd5gmqgp0005v78s79bina9z",
  "items": [
    {
      "ticket_id": "cmd5gug760007v78s3vxefcmd",
      "quantity": 2
    }
  ]
}
```

#### Response
- Nếu thành công:
```json
{
  "id": "cmd6ctsyr0001jkhlwwr0dsis",
  "user_id": "cmd4rgj6g0000jk44y1fhwyl1",
  "organization_id": "cmd5g7d2w0003v78sdjha8onv",
  "event_id": "cmd5gmqgp0005v78s79bina9z",
  "total_amount": "2000000",
  "status": "PENDING",
  "reserved_until": "2025-07-16T19:43:43.490Z",
  "created_at": "2025-07-16T19:28:43.491Z",
  "updated_at": "2025-07-16T19:28:43.491Z"
}
```

#### Logic nghiệp vụ:
- ✅ **Kiểm tra tồn kho:** `ticket.total_qty - ticket.sold_qty >= quantity`
- ✅ **Kiểm tra trạng thái:** Ticket phải có status = "ACTIVE"
- ✅ **Tính tổng tiền:** Tự động tính dựa trên `ticket.price * quantity`
- ✅ **Transaction:** Đảm bảo consistency khi tạo order + cập nhật sold_qty
- ✅ **Tạm giữ vé:** `reserved_until = now + 15 phút`
- ✅ **Cập nhật sold_qty:** Tăng số lượng đã bán ngay khi tạo order
- ⚠️ **TODO:** Tự động chuyển PENDING → EXPIRED sau 15 phút

#### Test cURL
```sh
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "cmd5g7d2w0003v78sdjha8onv",
    "event_id": "cmd5gmqgp0005v78s79bina9z",
    "items": [
      {"ticket_id": "cmd5gug760007v78s3vxefcmd", "quantity": 2}
    ]
  }'
```

---

### 6.2. Xem chi tiết đơn hàng

#### Endpoint
- **GET** `/orders/:id`

#### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

#### Response
```json
{
  "id": "cmd6ctsyr0001jkhlwwr0dsis",
  "user_id": "cmd4rgj6g0000jk44y1fhwyl1",
  "organization_id": "cmd5g7d2w0003v78sdjha8onv",
  "event_id": "cmd5gmqgp0005v78s79bina9z",
  "total_amount": "2000000",
  "status": "PENDING",
  "reserved_until": "2025-07-16T19:43:43.490Z",
  "created_at": "2025-07-16T19:28:43.491Z",
  "updated_at": "2025-07-16T19:28:43.491Z",
  "user": {
    "id": "cmd4rgj6g0000jk44y1fhwyl1",
    "email": "trietnguyenpham@gmail.com",
    "first_name": null,
    "last_name": null
  },
  "organization": {
    "id": "cmd5g7d2w0003v78sdjha8onv",
    "name": "Howls Studio"
  },
  "event": {
    "id": "cmd5gmqgp0005v78s79bina9z",
    "title": "Sự kiện âm nhạc Howls"
  },
  "order_items": [
    {
      "id": "order_item_cuid",
      "ticket_id": "cmd5gug760007v78s3vxefcmd",
      "quantity": 2,
      "price": 1000000,
      "ticket": {
        "id": "cmd5gug760007v78s3vxefcmd",
        "name": "Vé VIP",
        "description": "Ghế VIP gần sân khấu"
      }
    }
  ]
}
```

#### Test cURL
```sh
curl -X GET http://localhost:3000/orders/cmd6ctsyr0001jkhlwwr0dsis \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### 6.3. Huỷ đơn hàng

#### Endpoint
- **POST** `/orders/:id/cancel**

#### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

#### Response
- Nếu thành công:
```json
{
  "message": "Order cancelled successfully"
}
```

#### Logic nghiệp vụ:
- ✅ **Kiểm tra trạng thái:** Chỉ cho phép cancel khi status = "PENDING" hoặc "RESERVED"
- ✅ **Hoàn trả vé:** Giảm `ticket.sold_qty` về số lượng ban đầu
- ✅ **Transaction:** Đảm bảo consistency khi hoàn trả vé + cập nhật status
- ✅ **Cập nhật status:** Đổi thành "CANCELLED"

#### Test cURL
```sh
curl -X POST http://localhost:3000/orders/cmd6ctsyr0001jkhlwwr0dsis/cancel \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### 6.4. Danh sách đơn hàng

#### Endpoint
- **GET** `/orders`

#### Header
- `Authorization: Bearer <ACCESS_TOKEN>`

#### Response
```json
[
  {
    "id": "cmd6ctsyr0001jkhlwwr0dsis",
    "user_id": "cmd4rgj6g0000jk44y1fhwyl1",
    "organization_id": "cmd5g7d2w0003v78sdjha8onv",
    "total_amount": "2000000",
    "status": "PENDING",
    "reserved_until": "2025-07-16T19:43:43.490Z",
    "created_at": "2025-07-16T19:28:43.491Z",
    "user": { ... },
    "organization": { ... },
    "event": { ... },
    "order_items": [ ... ]
  }
]
```

#### Test cURL
```sh
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### 6.5. Error Handling

#### Ticket không tồn tại:
```json
{
  "statusCode": 404,
  "message": "Ticket ticket_cuid not found"
}
```

#### Ticket không active:
```json
{
  "statusCode": 400,
  "message": "Ticket Vé VIP is not active"
}
```

#### Không đủ vé:
```json
{
  "statusCode": 400,
  "message": "Insufficient tickets for Vé VIP"
}
```

#### Order không tồn tại:
```json
{
  "statusCode": 404,
  "message": "Order order_cuid not found"
}
```

#### Không thể huỷ order:
```json
{
  "statusCode": 400,
  "message": "Cannot cancel order with status PAID"
}
```

---

### 6.6. Trạng thái đơn hàng (OrderStatus)

| Status | Mô tả | Có thể cancel? |
|--------|-------|----------------|
| **PENDING** | Đơn hàng mới tạo, chưa thanh toán | ✅ |
| **RESERVED** | Đã tạm giữ vé, chờ thanh toán | ✅ |
| **PAID** | Đã thanh toán thành công | ❌ |
| **CANCELLED** | Đã huỷ đơn hàng | ❌ |
| **EXPIRED** | Hết hạn tạm giữ (15 phút) | ❌ |

---

### 6.7. Case test thực tế

#### Tạo đơn hàng mới:
```sh
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "cmd5g7d2w0003v78sdjha8onv",
    "event_id": "cmd5gmqgp0005v78s79bina9z",
    "items": [
      {"ticket_id": "cmd5gug760007v78s3vxefcmd", "quantity": 2}
    ]
  }'
```

#### Xem chi tiết đơn hàng:
```sh
curl -X GET http://localhost:3000/orders/cmd6ctsyr0001jkhlwwr0dsis \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Huỷ đơn hàng:
```sh
curl -X POST http://localhost:3000/orders/cmd6ctsyr0001jkhlwwr0dsis/cancel \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Xem danh sách đơn hàng:
```sh
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### 6.8. Lưu ý quan trọng

- **Tạm giữ vé:** Order được tạm giữ 15 phút, sau đó tự động huỷ nếu chưa thanh toán
- **Transaction:** Tất cả thao tác tạo/huỷ order đều sử dụng database transaction
- **Concurrent access:** Hệ thống xử lý được nhiều user cùng mua vé (tránh oversell)
- **Inventory check:** Kiểm tra tồn kho nghiêm ngặt trước khi tạo order
- **Hoàn trả vé:** Khi huỷ order, số lượng vé được hoàn trả về ban đầu
- **⚠️ TODO:** Cần implement scheduled task để tự động chuyển PENDING → EXPIRED sau 15 phút

---

### 6.9. CRUD Order Items

#### Lấy danh sách order items
- **GET** `/orders/{orderId}/items`
- **Header:** `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
[
  {
    "id": "order_item_id",
    "order_id": "order_id",
    "ticket_id": "ticket_id",
    "quantity": 2,
    "price": 1000000,
    "ticket": { "id": "ticket_id", "name": "Vé VIP" }
  }
]
```

#### Thêm order item
- **POST** `/orders/{orderId}/items`
- **Body:**
```json
{
  "ticket_id": "ticket_id",
  "quantity": 2
}
```
- **Response:**
```json
{
  "id": "order_item_id",
  "order_id": "order_id",
  "ticket_id": "ticket_id",
  "quantity": 2,
  "price": 1000000,
  "ticket": { "id": "ticket_id", "name": "Vé VIP" }
}
```

#### Sửa order item
- **PATCH** `/orders/{orderId}/items/{itemId}`
- **Body:**
```json
{
  "quantity": 3
}
```
- **Response:**
```json
{
  "id": "order_item_id",
  "quantity": 3,
  ...
}
```

#### Xoá order item
- **DELETE** `/orders/{orderId}/items/{itemId}`
- **Response:**
```json
{ "message": "Order item deleted successfully" }
```

### 6.10. CRUD Payments

#### Lấy danh sách payments
- **GET** `/orders/{orderId}/payments`
- **Header:** `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
[
  {
    "id": "payment_id",
    "order_id": "order_id",
    "amount": 2000000,
    "payment_method": "STRIPE",
    "transaction_id": "txn_123456",
    "status": "SUCCESS"
  }
]
```

#### Thêm payment
- **POST** `/orders/{orderId}/payments`
- **Body:**
```json
{
  "amount": 2000000,
  "payment_method": "STRIPE",
  "transaction_id": "txn_123456",
  "status": "SUCCESS"
}
```
- **Response:**
```json
{
  "id": "payment_id",
  "order_id": "order_id",
  "amount": 2000000,
  "payment_method": "STRIPE",
  "transaction_id": "txn_123456",
  "status": "SUCCESS"
}
```

#### Sửa payment
- **PATCH** `/orders/{orderId}/payments/{paymentId}`
- **Body:**
```json
{
  "status": "FAILED"
}
```
- **Response:**
```json
{
  "id": "payment_id",
  "status": "FAILED",
  ...
}
```

#### Xoá payment
- **DELETE** `/orders/{orderId}/payments/{paymentId}`
- **Response:**
```json
{ "message": "Payment deleted successfully" }
```

### 6.11. Lưu ý phân quyền
- Tất cả các API CRUD order_items và payments đều yêu cầu JWT, phân quyền role như API orders.
- USER chỉ thao tác với order của mình, ADMIN/OWNER/SUPERADMIN thao tác với tất cả.

---

## 7. Dashboard & Báo cáo API

> Thống kê hệ thống, tổ chức, sự kiện, xuất báo cáo PDF/CSV, gửi email báo cáo.

---

### 7.1. Thống kê tổng quan hệ thống
- **GET** `/dashboard/system`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
{
  "total_revenue": 100000000,
  "total_tickets_sold": 5000,
  "total_orders": 2000,
  "total_events": 50,
  "total_organizations": 10
}
```

### 7.2. Thống kê tổ chức
- **GET** `/dashboard/organization/:id`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
{
  "organization_id": "org_cuid",
  "total_revenue": 50000000,
  "total_tickets_sold": 2000,
  "total_orders": 800,
  "total_events": 10
}
```

### 7.3. Thống kê tổ chức theo thời gian
- **GET** `/dashboard/organization/:id/time?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
[
  { "time": "2025-08-01", "revenue": 1000000, "tickets_sold": 50 },
  { "time": "2025-08-02", "revenue": 2000000, "tickets_sold": 100 }
]
```

### 7.4. Xuất báo cáo tổ chức PDF
- **GET** `/dashboard/organization/:id/export/pdf?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
  - File PDF báo cáo thống kê tổ chức (download)

### 7.5. Xuất báo cáo tổ chức CSV
- **GET** `/dashboard/organization/:id/export/csv?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
  - File CSV báo cáo thống kê tổ chức (download)

### 7.6. Gửi báo cáo tổ chức qua email
- **POST** `/dashboard/organization/:id/send-report`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Body:**
```json
{
  "email": "recipient@example.com", // Địa chỉ email nhận báo cáo (bắt buộc)
  "from": "2025-08-01",            // Ngày bắt đầu thống kê (bắt buộc)
  "to": "2025-08-31",              // Ngày kết thúc thống kê (bắt buộc)
  "groupBy": "day",                // Nhóm theo: day|week|month (mặc định: day)
  "format": "csv"                  // Định dạng: csv|pdf (mặc định: csv)
}
```
- **Response:**
```json
{
  "message": "Email sent successfully"
}
```
- **Lưu ý:**
  - Trường `email` là bắt buộc, hệ thống sẽ gửi báo cáo tới địa chỉ này.
  - Nếu không nhập email sẽ không biết gửi cho ai.
  - Các trường `from`, `to` là bắt buộc để xác định khoảng thời gian thống kê.
  - `groupBy` và `format` là tuỳ chọn.

- **Test cURL:**
```sh
curl -X POST http://localhost:3000/dashboard/organization/org_cuid/send-report \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recipient@example.com",
    "from": "2025-08-01",
    "to": "2025-08-31",
    "groupBy": "day",
    "format": "csv"
  }'
```

### 7.7. Thống kê sự kiện
- **GET** `/dashboard/event/:id`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
{
  "event_id": "event_cuid",
  "total_revenue": 10000000,
  "total_tickets_sold": 500,
  "total_orders": 200
}
```

### 7.8. Thống kê sự kiện theo thời gian
- **GET** `/dashboard/event/:id/time?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Header:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response:**
```json
[
  { "time": "2025-08-01", "revenue": 100000, "tickets_sold": 10 },
  { "time": "2025-08-02", "revenue": 200000, "tickets_sold": 20 }
]
```

---

## 🔧 **Swagger UI Integration**

### Truy cập Swagger UI:
- **URL:** `http://localhost:3000/api/docs`
- **Features:**
  - ✅ Tất cả API endpoints được document đầy đủ
  - ✅ Request/Response examples cho từng API
  - ✅ Authorize button để test với JWT token
  - ✅ Try it out functionality cho mọi endpoint
  - ✅ Auto-generated API documentation

### Cách sử dụng Swagger:
1. **Login để lấy token:**
   - Vào `POST /auth/login`
   - Click "Try it out"
   - Nhập email/password
   - Copy `access_token` từ response

2. **Authorize:**
   - Click nút "Authorize" (🔒) ở góc trên bên phải
   - Nhập: `Bearer YOUR_JWT_TOKEN`
   - Click "Authorize" → "Close"

3. **Test API:**
   - Tất cả API có biểu tượng 🔒 sẽ tự động gửi JWT token
   - Click "Try it out" trên bất kỳ endpoint nào
   - Nhập parameters nếu cần
   - Click "Execute"

---

## 📊 **Current Status**

### ✅ **Completed Features:**
- Authentication & Authorization (JWT + Supabase)
- User & Organization CRUD
- Event & Ticket Management
- Order Creation & Management
- Dashboard & Analytics
- PDF/CSV Export
- Email Report Sending
- Swagger UI Integration

### 🔄 **In Progress:**
- Order Expiration System (scheduled task)

### ⏳ **Pending:**
- Payment Gateway Integration
- QR Code Generation
- Check-in System
- Webhook System
- Unit Testing

---

## 🚀 **Quick Start Guide**

### 1. **Setup Environment:**
```bash
cp env.example .env
# Fill in your Supabase credentials
```

### 2. **Install Dependencies:**
```bash
npm install
```

### 3. **Setup Database:**
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. **Start Development Server:**
```bash
npm run start:dev
```

### 5. **Access Swagger UI:**
- Open: `http://localhost:3000/api/docs`
- Login via `POST /auth/login`
- Authorize with JWT token
- Test all APIs

---

**🎯 Next Steps:** Implement order expiration system to complete the core business logic. 