# Dashboard API Logic

File này giải thích chi tiết các API thống kê dành cho dashboard hệ thống, tổ chức, sự kiện.

---

## 1. Tổng quan các nhóm API

- **Thống kê toàn hệ thống**: `/dashboard/system`, `/dashboard/system/time`
- **Thống kê theo tổ chức**: `/dashboard/organization/:id`, `/dashboard/organization/:id/time`, xuất PDF/CSV, gửi email báo cáo
- **Thống kê theo sự kiện**: `/dashboard/event/:id`, `/dashboard/event/:id/time`

Tất cả API đều yêu cầu xác thực JWT.

---

## 2. Thống kê toàn hệ thống

### `GET /dashboard/system`
- **Trả về:**
  - Tổng doanh thu (chỉ tính các order đã PAID)
  - Tổng số vé đã bán (chỉ tính từ order đã PAID)
  - Tổng số đơn hàng (phân loại theo status: PAID, PENDING, CANCELLED, EXPIRED, ...)
  - Tổng số sự kiện
  - Tổng số tổ chức
- **Logic:**
  - Doanh thu: Prisma aggregate SUM trên bảng `order` với điều kiện `status = 'PAID'`
  - Vé đã bán: SUM quantity của order_items thuộc order `status = 'PAID'`
  - Đơn hàng: Prisma count trên bảng `order`, group by `status`
  - Sự kiện, tổ chức: count như cũ
- **Response mẫu:**
  ```json
  {
    "total_revenue": 100000000,
    "total_tickets_sold": 5000,
    "total_orders": {
      "PAID": 3000,
      "PENDING": 200,
      "CANCELLED": 100,
      "EXPIRED": 50
    },
    "total_events": 120,
    "total_organizations": 20
  }
  ```

### `GET /dashboard/system/time?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Trả về:**
  - Thống kê doanh thu, vé bán, số sự kiện, số tổ chức mới theo từng mốc thời gian (ngày/tuần/tháng)
- **Logic:**
  - Lọc order, ticket, event, organization theo khoảng thời gian.
  - Doanh thu, vé bán chỉ tính các order `status = 'PAID'`
  - Gom nhóm (group by) theo ngày/tuần/tháng dựa trên trường `created_at`/`updated_at`.
  - Trả về mảng các object `{ time, revenue, tickets_sold, events_created, organizations_created }`

---

## 3. Thống kê theo tổ chức

### `GET /dashboard/organization/:id`
- **Trả về:**
  - Tổng doanh thu, tổng vé bán (chỉ tính order đã PAID), tổng đơn hàng (phân loại theo status), tổng sự kiện của tổ chức
- **Logic:**
  - Aggregate/count với điều kiện `organization_id` và `status = 'PAID'` cho doanh thu, vé bán
  - Đơn hàng: count group by status

### `GET /dashboard/organization/:id/time?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Trả về:**
  - Thống kê doanh thu, vé bán theo từng mốc thời gian cho tổ chức (chỉ tính order đã PAID)
- **Logic:**
  - Lọc order, ticket theo `organization_id`, `status = 'PAID'` và khoảng thời gian.
  - Gom nhóm theo ngày/tuần/tháng.

### `GET /dashboard/organization/:id/export/pdf|csv`
- **Trả về:**
  - File PDF/CSV báo cáo thống kê doanh thu, vé bán theo từng mốc thời gian.
- **Logic:**
  - Gọi lại logic thống kê theo thời gian, render ra PDF (dùng PDFKit) hoặc CSV, trả file về response.

### `POST /dashboard/organization/:id/send-report`
- **Body:** `{ email, from, to, groupBy, format }`
- **Trả về:**
  - Gửi báo cáo PDF/CSV qua email cho người nhận.
- **Logic:**
  - Sinh file PDF/CSV như trên, gửi qua SMTP (nodemailer).

---

## 4. Thống kê theo sự kiện

### `GET /dashboard/event/:id`
- **Trả về:**
  - Tổng doanh thu, tổng vé bán (chỉ tính order đã PAID), tổng đơn hàng (phân loại theo status), tổng lượt check-in của sự kiện
- **Logic:**
  - Aggregate/count với điều kiện `event_id` và `status = 'PAID'` cho doanh thu, vé bán
  - Đơn hàng: count group by status

### `GET /dashboard/event/:id/time?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
- **Trả về:**
  - Thống kê doanh thu, vé bán theo từng mốc thời gian cho sự kiện (chỉ tính order đã PAID)
- **Logic:**
  - Lọc order, ticket theo `event_id`, `status = 'PAID'` và khoảng thời gian.
  - Gom nhóm theo ngày/tuần/tháng.

---

## 5. Ghi chú logic group by thời gian
- **Group by ngày:** YYYY-MM-DD
- **Group by tháng:** YYYY-MM
- **Group by tuần:** Lấy thứ 2 đầu tuần (ISO), định dạng YYYY-MM-DD

---

## 6. Bảo mật
- Tất cả API đều yêu cầu JWT (Bearer token)
- Chỉ user hợp lệ mới truy cập được dashboard

---

## 7. Mở rộng
- Có thể bổ sung thêm các API top sự kiện, top user, conversion rate, v.v. theo chuẩn global nếu cần. 