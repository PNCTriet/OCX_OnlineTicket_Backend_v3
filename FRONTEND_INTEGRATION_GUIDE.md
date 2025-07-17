# 🎫 Frontend Integration Guide - OCX Online Ticketing System

> **Hướng dẫn tích hợp Frontend với Backend API**  
> **Base URL:** `http://localhost:3000` (Development)  
> **Swagger UI:** `http://localhost:3000/api/docs`

---

## 📋 **Table of Contents**

1. [🔐 Authentication Flow](#-authentication-flow)
2. [👤 User Management](#-user-management)
3. [🏢 Organization Management](#-organization-management)
4. [🎪 Event Management](#-event-management)
5. [🎫 Ticket Management](#-ticket-management)
6. [🛒 Order Management](#-order-management)
7. [📊 Dashboard & Analytics](#-dashboard--analytics)
8. [🔧 Error Handling](#-error-handling)
9. [📱 Frontend Implementation Examples](#-frontend-implementation-examples)
10. [🚀 Quick Start Checklist](#-quick-start-checklist)

---

## 🔐 **Authentication Flow**

### **1. Login Flow**

```javascript
// 1. Login để lấy JWT token
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Lưu token vào localStorage hoặc state management
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### **2. Google OAuth Flow**

```javascript
// Frontend sử dụng Supabase Auth cho Google OAuth
// Backend sẽ tự động tạo user mapping khi nhận JWT từ Google

// 1. Setup Supabase Auth (frontend)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// 2. Google OAuth login
const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (error) throw error;
    
    // Sau khi login thành công, lấy access_token
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    // Lưu token để gọi API backend
    localStorage.setItem('access_token', accessToken);
    
    return data;
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
};
```

### **3. Token Management**

```javascript
// Utility functions cho token management
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await fetch('http://localhost:3000/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data.access_token;
    } else {
      // Token expired, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Interceptor cho API calls
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // Token expired, try refresh
      await refreshToken();
      // Retry request
      return fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
```

### **4. Get Current User**

```javascript
const getCurrentUser = async () => {
  try {
    const response = await apiCall('http://localhost:3000/auth/me');
    const data = await response.json();
    
    if (response.ok) {
      return data.user;
    } else {
      throw new Error(data.message || 'Failed to get user');
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};
```

---

## 👤 **User Management**

### **1. Get User Profile**

```javascript
const getUserProfile = async (userId) => {
  try {
    const response = await apiCall(`http://localhost:3000/users/${userId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get user profile');
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};
```

### **2. Update User Profile**

```javascript
const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await apiCall(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Example usage
const updateProfile = async () => {
  const profileData = {
    first_name: 'Nguyen',
    last_name: 'Van A',
    phone: '0123456789',
    avatar_url: 'https://example.com/avatar.png'
  };
  
  try {
    const updatedUser = await updateUserProfile(userId, profileData);
    console.log('Profile updated:', updatedUser);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

---

## 🏢 **Organization Management**

### **1. Get Organizations List**

```javascript
const getOrganizations = async () => {
  try {
    const response = await apiCall('http://localhost:3000/organizations');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get organizations');
    }
  } catch (error) {
    console.error('Get organizations error:', error);
    throw error;
  }
};
```

### **2. Get Organization Details**

```javascript
const getOrganizationDetails = async (orgId) => {
  try {
    const response = await apiCall(`http://localhost:3000/organizations/${orgId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get organization');
    }
  } catch (error) {
    console.error('Get organization error:', error);
    throw error;
  }
};
```

### **3. Create Organization**

```javascript
const createOrganization = async (orgData) => {
  try {
    const response = await apiCall('http://localhost:3000/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create organization');
    }
  } catch (error) {
    console.error('Create organization error:', error);
    throw error;
  }
};

// Example usage
const createOrg = async () => {
  const orgData = {
    name: 'Howls Studio',
    description: 'Tổ chức sự kiện âm nhạc',
    contact_email: 'contact@howls.studio',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    logo_url: 'https://howls.studio/logo.png',
    website: 'https://howls.studio'
  };
  
  try {
    const newOrg = await createOrganization(orgData);
    console.log('Organization created:', newOrg);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};
```

---

## 🎪 **Event Management**

### **1. Get Events List**

```javascript
const getEvents = async () => {
  try {
    const response = await apiCall('http://localhost:3000/events');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get events');
    }
  } catch (error) {
    console.error('Get events error:', error);
    throw error;
  }
};
```

### **2. Get Event Details**

```javascript
const getEventDetails = async (eventId) => {
  try {
    const response = await apiCall(`http://localhost:3000/events/${eventId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get event');
    }
  } catch (error) {
    console.error('Get event error:', error);
    throw error;
  }
};
```

### **3. Create Event**

```javascript
const createEvent = async (eventData) => {
  try {
    const response = await apiCall('http://localhost:3000/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create event');
    }
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

// Example usage
const createNewEvent = async () => {
  const eventData = {
    organization_id: 'org_cuid',
    title: 'Sự kiện âm nhạc Howls',
    description: 'Đêm nhạc Howls Studio',
    location: 'Nhà hát Hòa Bình',
    start_date: '2025-08-01T19:00:00.000Z',
    end_date: '2025-08-01T22:00:00.000Z',
    banner_url: 'https://howls.studio/banner.png',
    status: 'DRAFT'
  };
  
  try {
    const newEvent = await createEvent(eventData);
    console.log('Event created:', newEvent);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};
```

---

## 🎫 **Ticket Management**

### **1. Get Tickets for Event**

```javascript
const getEventTickets = async (eventId) => {
  try {
    const response = await apiCall(`http://localhost:3000/tickets/event/${eventId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get tickets');
    }
  } catch (error) {
    console.error('Get tickets error:', error);
    throw error;
  }
};
```

### **2. Get All Tickets**

```javascript
const getAllTickets = async () => {
  try {
    const response = await apiCall('http://localhost:3000/tickets');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get tickets');
    }
  } catch (error) {
    console.error('Get tickets error:', error);
    throw error;
  }
};
```

### **3. Create Ticket**

```javascript
const createTicket = async (ticketData) => {
  try {
    const response = await apiCall('http://localhost:3000/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create ticket');
    }
  } catch (error) {
    console.error('Create ticket error:', error);
    throw error;
  }
};

// Example usage
const createNewTicket = async () => {
  const ticketData = {
    event_id: 'event_cuid',
    name: 'Vé VIP',
    description: 'Ghế VIP gần sân khấu',
    price: 1000000,
    total_qty: 100,
    sale_start: '2025-08-01T08:00:00.000Z',
    sale_end: '2025-08-01T20:00:00.000Z',
    status: 'ACTIVE'
  };
  
  try {
    const newTicket = await createTicket(ticketData);
    console.log('Ticket created:', newTicket);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};
```

---

## 🛒 **Order Management**

### **1. Create Order**

```javascript
const createOrder = async (orderData) => {
  try {
    const response = await apiCall('http://localhost:3000/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create order');
    }
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// Example usage
const createNewOrder = async () => {
  const orderData = {
    organization_id: 'cmd5g7d2w0003v78sdjha8onv',
    event_id: 'cmd5gmqgp0005v78s79bina9z',
    items: [
      {
        ticket_id: 'cmd5gug760007v78s3vxefcmd',
        quantity: 2
      }
    ]
  };
  
  try {
    const newOrder = await createOrder(orderData);
    console.log('Order created:', newOrder);
    
    // Lưu order ID để tracking
    localStorage.setItem('current_order_id', newOrder.id);
    
    return newOrder;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
```

### **2. Get Order Details**

```javascript
const getOrderDetails = async (orderId) => {
  try {
    const response = await apiCall(`http://localhost:3000/orders/${orderId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get order');
    }
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};
```

### **3. Cancel Order**

```javascript
const cancelOrder = async (orderId) => {
  try {
    const response = await apiCall(`http://localhost:3000/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
};
```

### **4. Get User Orders**

```javascript
const getUserOrders = async () => {
  try {
    const response = await apiCall('http://localhost:3000/orders');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get orders');
    }
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};
```

### **5. Order Status Tracking**

```javascript
// Order status constants
const ORDER_STATUS = {
  PENDING: 'PENDING',
  RESERVED: 'RESERVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

// Check if order can be cancelled
const canCancelOrder = (order) => {
  return order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.RESERVED;
};

// Check if order is expired
const isOrderExpired = (order) => {
  if (order.status === ORDER_STATUS.EXPIRED) return true;
  
  if (order.reserved_until) {
    const reservedUntil = new Date(order.reserved_until);
    const now = new Date();
    return now > reservedUntil;
  }
  
  return false;
};

// Format order status for display
const getOrderStatusText = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: 'Chờ thanh toán',
    [ORDER_STATUS.RESERVED]: 'Đã tạm giữ',
    [ORDER_STATUS.PAID]: 'Đã thanh toán',
    [ORDER_STATUS.CANCELLED]: 'Đã huỷ',
    [ORDER_STATUS.EXPIRED]: 'Hết hạn'
  };
  
  return statusMap[status] || status;
};
```

---

## 📊 **Dashboard & Analytics**

### **1. System Dashboard**

```javascript
const getSystemDashboard = async () => {
  try {
    const response = await apiCall('http://localhost:3000/dashboard/system');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get system dashboard');
    }
  } catch (error) {
    console.error('Get system dashboard error:', error);
    throw error;
  }
};
```

### **2. Organization Dashboard**

```javascript
const getOrganizationDashboard = async (orgId) => {
  try {
    const response = await apiCall(`http://localhost:3000/dashboard/organization/${orgId}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get organization dashboard');
    }
  } catch (error) {
    console.error('Get organization dashboard error:', error);
    throw error;
  }
};
```

### **3. Organization Time Series Data**

```javascript
const getOrganizationTimeData = async (orgId, fromDate, toDate, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
      groupBy: groupBy
    });
    
    const response = await apiCall(`http://localhost:3000/dashboard/organization/${orgId}/time?${params}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to get time data');
    }
  } catch (error) {
    console.error('Get time data error:', error);
    throw error;
  }
};
```

### **4. Export Reports**

```javascript
const exportOrganizationReport = async (orgId, format = 'csv', fromDate, toDate, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
      groupBy: groupBy
    });
    
    const response = await apiCall(`http://localhost:3000/dashboard/organization/${orgId}/export/${format}?${params}`);
    
    if (response.ok) {
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${orgId}-${fromDate}-${toDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      throw new Error('Failed to export report');
    }
  } catch (error) {
    console.error('Export report error:', error);
    throw error;
  }
};
```

### **5. Send Report via Email**

```javascript
const sendReportEmail = async (orgId, email, fromDate, toDate, groupBy = 'day', format = 'csv') => {
  try {
    const response = await apiCall(`http://localhost:3000/dashboard/organization/${orgId}/send-report`, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        from: fromDate,
        to: toDate,
        groupBy: groupBy,
        format: format
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to send report');
    }
  } catch (error) {
    console.error('Send report error:', error);
    throw error;
  }
};
```

---

## 🔧 **Error Handling**

### **1. Centralized Error Handler**

```javascript
class APIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const handleAPIError = (error) => {
  if (error instanceof APIError) {
    // Handle specific API errors
    switch (error.statusCode) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden - show access denied message
        showNotification('Bạn không có quyền truy cập tính năng này', 'error');
        break;
      case 404:
        // Not found - show not found message
        showNotification('Không tìm thấy dữ liệu', 'error');
        break;
      case 400:
        // Bad request - show validation error
        showNotification(error.message || 'Dữ liệu không hợp lệ', 'error');
        break;
      default:
        // Other errors
        showNotification('Đã xảy ra lỗi, vui lòng thử lại', 'error');
    }
  } else {
    // Network or other errors
    console.error('API Error:', error);
    showNotification('Lỗi kết nối, vui lòng kiểm tra mạng', 'error');
  }
};
```

### **2. Common Error Messages**

```javascript
const ERROR_MESSAGES = {
  // Authentication errors
  'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
  'User already registered': 'Email đã được đăng ký',
  'Unauthorized': 'Phiên đăng nhập đã hết hạn',
  
  // Order errors
  'Ticket not found': 'Vé không tồn tại',
  'Ticket is not active': 'Vé không còn hoạt động',
  'Insufficient tickets': 'Không đủ vé để mua',
  'Cannot cancel order': 'Không thể huỷ đơn hàng này',
  
  // General errors
  'Network error': 'Lỗi kết nối mạng',
  'Server error': 'Lỗi máy chủ',
  'Validation error': 'Dữ liệu không hợp lệ'
};

const getErrorMessage = (error) => {
  return ERROR_MESSAGES[error] || error || 'Đã xảy ra lỗi không xác định';
};
```

---

## 📱 **Frontend Implementation Examples**

### **1. React Hook for API Calls**

```javascript
import { useState, useEffect } from 'react';

const useAPI = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(url, options);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        throw new Error(result.message || 'API call failed');
      }
    } catch (err) {
      setError(err.message);
      handleAPIError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

// Usage example
const EventList = () => {
  const { data: events, loading, error } = useAPI('http://localhost:3000/events');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {events?.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### **2. Order Creation Flow**

```javascript
const OrderCreationFlow = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        organization_id: selectedEvent.organization_id,
        event_id: selectedEvent.id,
        items: selectedTickets.map(ticket => ({
          ticket_id: ticket.id,
          quantity: ticket.quantity
        }))
      };
      
      const order = await createOrder(orderData);
      
      // Redirect to payment page or order confirmation
      window.location.href = `/order/${order.id}/payment`;
      
    } catch (error) {
      console.error('Order creation failed:', error);
      showNotification('Không thể tạo đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Event selection */}
      <EventSelector onSelect={setSelectedEvent} />
      
      {/* Ticket selection */}
      {selectedEvent && (
        <TicketSelector 
          eventId={selectedEvent.id}
          onSelect={setSelectedTickets}
        />
      )}
      
      {/* Create order button */}
      <button 
        onClick={handleCreateOrder}
        disabled={loading || selectedTickets.length === 0}
      >
        {loading ? 'Đang tạo đơn hàng...' : 'Tạo đơn hàng'}
      </button>
    </div>
  );
};
```

### **3. Real-time Order Status**

```javascript
const OrderStatusTracker = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderStatus = async () => {
    try {
      const orderData = await getOrderDetails(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchOrderStatus, 30000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div>Loading order status...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="order-status">
      <h3>Order #{order.id}</h3>
      <div className={`status ${order.status.toLowerCase()}`}>
        {getOrderStatusText(order.status)}
      </div>
      
      {order.reserved_until && (
        <div className="reserved-until">
          Tạm giữ đến: {new Date(order.reserved_until).toLocaleString()}
        </div>
      )}
      
      {canCancelOrder(order) && (
        <button onClick={() => cancelOrder(order.id)}>
          Huỷ đơn hàng
        </button>
      )}
    </div>
  );
};
```

---

## 🚀 **Quick Start Checklist**

### **1. Environment Setup**
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in Supabase credentials
- [ ] Set up Google OAuth (if needed)

### **2. Authentication Integration**
- [ ] Implement login flow
- [ ] Set up token management
- [ ] Add Google OAuth (optional)
- [ ] Test authentication

### **3. Core Features**
- [ ] Event listing and details
- [ ] Ticket selection
- [ ] Order creation
- [ ] Order status tracking
- [ ] Order cancellation

### **4. User Management**
- [ ] User profile display
- [ ] Profile editing
- [ ] Order history

### **5. Organization Features**
- [ ] Organization dashboard
- [ ] Event management
- [ ] Ticket management
- [ ] Analytics and reports

### **6. Testing**
- [ ] Test all API endpoints
- [ ] Test error handling
- [ ] Test authentication flow
- [ ] Test order creation flow

### **7. Production Ready**
- [ ] Update base URL for production
- [ ] Set up proper error handling
- [ ] Add loading states
- [ ] Implement proper validation

---

## 📞 **Support & Resources**

- **API Documentation:** `http://localhost:3000/api/docs`
- **Backend Repository:** [Link to backend repo]
- **Issue Tracking:** [Link to issues]

---

**🎯 Happy Coding!**  
*Nếu có thắc mắc, hãy liên hệ team backend hoặc tạo issue trong repository.* 