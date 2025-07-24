# Hướng dẫn tích hợp webhook thanh toán thành công từ backend

Khi backend xác thực thanh toán thành công (qua Sepay), hệ thống sẽ gửi một webhook callback tới frontend tại endpoint:

```
POST https://otcayxe.com/api/payment-webhook
```

## 1. Payload gửi sang frontend

```json
{
  "orderId": "123456",
  "status": "SUCCESS",
  "amount": 500000,
  "userEmail": "user@example.com",
  "paidAt": "2024-06-01T12:34:56Z"
}
```

- `orderId`: Mã đơn hàng
- `status`: Trạng thái đơn hàng (SUCCESS, FAILED, ...)
- `amount`: Số tiền thanh toán
- `userEmail`: Email người dùng
- `paidAt`: Thời điểm thanh toán thành công (ISO string)

## 2. Yêu cầu phía frontend

- Tạo endpoint nhận webhook:
  - `POST /api/payment-webhook`
- Xác thực nguồn gửi (có thể kiểm tra IP backend hoặc dùng secret key trong header)
- Xử lý payload để cập nhật trạng thái đơn hàng cho user
- Trả về HTTP 200 nếu nhận thành công, HTTP 4xx/5xx nếu lỗi

## 3. Ví dụ code (Node.js/Express)

```js
app.post('/api/payment-webhook', (req, res) => {
  const { orderId, status, amount, userEmail, paidAt } = req.body;
  // TODO: Kiểm tra xác thực nguồn gửi (nên dùng secret hoặc IP whitelist)
  // TODO: Cập nhật trạng thái đơn hàng trong DB frontend
  console.log('Received payment webhook:', req.body);
  res.status(200).json({ message: 'Webhook received' });
});
```

## 4. Lưu ý bảo mật
- Nên xác thực nguồn gửi webhook (secret key hoặc IP whitelist)
- Log lại các webhook nhận được để kiểm tra/debug
- Có thể trả về HTTP 200 ngay, xử lý async nếu cần

## 5. Retry
- Nếu frontend trả về lỗi, backend sẽ log lại để retry gửi webhook sau (nên có cơ chế retry hoặc thông báo admin) 