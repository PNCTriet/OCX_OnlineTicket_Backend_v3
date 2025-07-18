# 🔐 Role-Based Authorization Guide

> **Hướng dẫn sử dụng RoleGuard** để bảo vệ API theo role của user

---

## 📋 Tổng Quan

Hệ thống sử dụng **RoleGuard** để kiểm tra quyền truy cập dựa trên role của user. Có 4 roles chính:

| Role | Mô tả | Quyền truy cập |
|------|-------|----------------|
| `USER` | Người dùng thường | Chỉ xem thông tin cá nhân |
| `ADMIN_ORGANIZER` | Admin tổ chức | Quản lý events, tickets, orders |
| `OWNER_ORGANIZER` | Chủ sở hữu tổ chức | Toàn quyền trong organization |
| `SUPERADMIN` | Super admin hệ thống | Toàn quyền hệ thống |

---

## 🛠️ Cách Sử Dụng RoleGuard

### 1. **Import RoleGuard và Roles Decorator**

```typescript
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';
```

### 2. **Áp dụng cho Controller Method**

```typescript
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
@ApiBearerAuth()
@Get('admin-only')
async adminOnlyEndpoint() {
  // Chỉ ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN mới truy cập được
}
```

### 3. **Các Pattern Sử Dụng**

#### **Pattern 1: Chỉ Admin/Organizer**
```typescript
@Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
```

#### **Pattern 2: Chỉ Owner/SuperAdmin**
```typescript
@Roles(UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
```

#### **Pattern 3: Chỉ SuperAdmin**
```typescript
@Roles(UserRole.SUPERADMIN)
```

#### **Pattern 4: Tất cả User đã đăng nhập**
```typescript
@UseGuards(JwtAuthGuard) // Không cần @Roles
```

---

## 📝 Ví Dụ Thực Tế

### **Events Controller**
```typescript
@Controller('events')
export class EventsController {
  
  // Tất cả user có thể xem events
  @Get()
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  // Chỉ admin/organizer mới tạo được event
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Post()
  async createEvent(@Body() data: CreateEventDto) {
    return this.eventsService.createEvent(data);
  }

  // Chỉ owner/superadmin mới xóa được event
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
```

### **Orders Controller**
```typescript
@Controller('orders')
export class OrdersController {
  
  // User có thể tạo order
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createOrder(@Body() data: CreateOrderDto) {
    return this.ordersService.createOrder(data);
  }

  // Chỉ admin mới expire orders
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Post('expire-expired')
  async expireExpiredOrders() {
    return this.ordersService.expireExpiredOrders();
  }
}
```

---

## 🔧 Cập Nhật Module Dependencies

### **Bước 1: Import AuthModule**
```typescript
// your-module.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Thêm AuthModule để sử dụng RoleGuard
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

### **Bước 2: Import trong Controller**
```typescript
// your.controller.ts
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';
```

---

## 🚨 Error Handling

### **403 Forbidden Response**
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN",
  "error": "Forbidden"
}
```

### **401 Unauthorized Response**
```json
{
  "statusCode": 401,
  "message": "User not authenticated",
  "error": "Unauthorized"
}
```

---

## 📊 Best Practices

### **1. Phân Cấp Quyền Rõ Ràng**
- **READ operations:** Thường cho phép tất cả user đã đăng nhập
- **WRITE operations:** Yêu cầu ADMIN_ORGANIZER trở lên
- **DELETE operations:** Yêu cầu OWNER_ORGANIZER trở lên
- **SYSTEM operations:** Chỉ SUPERADMIN

### **2. Naming Convention**
```typescript
// Tốt
@Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)

// Tránh
@Roles(UserRole.USER) // USER thường không cần role guard
```

### **3. Swagger Documentation**
```typescript
@ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
@ApiBearerAuth()
```

---

## 🔄 Migration Checklist

### **Khi thêm RoleGuard cho API mới:**

1. ✅ **Import dependencies**
   ```typescript
   import { RoleGuard, Roles } from '../auth/role.guard';
   import { UserRole } from '@prisma/client';
   ```

2. ✅ **Thêm guards**
   ```typescript
   @UseGuards(JwtAuthGuard, RoleGuard)
   ```

3. ✅ **Thêm role decorator**
   ```typescript
   @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
   ```

4. ✅ **Thêm Swagger decorators**
   ```typescript
   @ApiBearerAuth()
   @ApiResponse({ status: 403, description: 'Access denied' })
   ```

5. ✅ **Cập nhật module imports**
   ```typescript
   imports: [AuthModule]
   ```

6. ✅ **Test với các role khác nhau**
   - Test với USER role (nên fail)
   - Test với ADMIN_ORGANIZER role (nên pass)
   - Test với OWNER_ORGANIZER role (nên pass)

---

## 🎯 Ví Dụ Hoàn Chỉnh

### **Dashboard Controller**
```typescript
@Controller('dashboard')
export class DashboardController {
  
  // Chỉ admin/organizer mới xem được dashboard
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Get('organization/:id')
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  async getOrganizationDashboard(@Param('id') id: string) {
    return this.dashboardService.getOrganizationStats(id);
  }

  // Chỉ superadmin mới xem system dashboard
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Get('system')
  @ApiResponse({ status: 403, description: 'Access denied. SuperAdmin role required.' })
  async getSystemDashboard() {
    return this.dashboardService.getSystemStats();
  }
}
```

---

## 📚 Tài Liệu Tham Khảo

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
- [Prisma UserRole Enum](https://pris.ly/d/schema-enums)

---

**🎉 Với RoleGuard này, bạn có thể bảo vệ bất kỳ API nào theo role một cách dễ dàng và nhất quán!** 