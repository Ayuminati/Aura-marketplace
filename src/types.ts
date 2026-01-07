
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  RIDER = 'RIDER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number;
  phone?: string;
  joinedAt?: string;
  bio?: string;
  location?: string;
  businessName?: string; // For Vendors
  vehicleType?: string; // For Riders
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  riderId?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string;
  otp?: string; // One-time password for delivery verification
}

export interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  totalUsers: number;
}
