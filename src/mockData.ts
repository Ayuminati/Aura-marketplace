
import { Product, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: 'c1', name: 'Alice Smith', email: 'alice@aura.com', role: UserRole.CUSTOMER, balance: 5000 },
  { id: 'v1', name: 'ElectroHub', email: 'vendor@electro.com', role: UserRole.VENDOR },
  { id: 'r1', name: 'Swift Delivery', email: 'rider@aura.com', role: UserRole.RIDER },
  { id: 'a1', name: 'Master Admin', email: 'admin@aura.com', role: UserRole.ADMIN }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    vendorId: 'v1',
    name: 'Aura Pro Wireless Buds',
    description: 'Next-gen audio with active noise cancellation and 40-hour battery life.',
    price: 129.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/buds/600/400',
    stock: 25
  },
  {
    id: 'p2',
    vendorId: 'v1',
    name: 'Nebula Smart Watch',
    description: 'Sleek design with health monitoring and GPS tracking.',
    price: 199.99,
    category: 'Wearables',
    image: 'https://picsum.photos/seed/watch/600/400',
    stock: 15
  },
  {
    id: 'p3',
    vendorId: 'v1',
    name: 'Zenith Mechanical Keyboard',
    description: 'Tactile switches with RGB lighting for the ultimate typing experience.',
    price: 89.50,
    category: 'Accessories',
    image: 'https://picsum.photos/seed/keyboard/600/400',
    stock: 30
  },
  {
    id: 'p4',
    vendorId: 'v2',
    name: 'Artisan Coffee Grinder',
    description: 'Precision burr grinder for the perfect morning brew.',
    price: 45.00,
    category: 'Kitchen',
    image: 'https://picsum.photos/seed/coffee/600/400',
    stock: 10
  }
];
