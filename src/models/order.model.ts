
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
  cakeId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: { label: string; price: number }; // Nếu có size
}

export class Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: number;

  constructor(
    id: string,
    userId: string,
    userName: string,
    userPhone: string,
    userAddress: string,
    items: OrderItem[],
    totalPrice: number,
    status: OrderStatus = 'pending', // Mặc định là Pending
    createdAt: number = Date.now()
  ) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.userPhone = userPhone;
    this.userAddress = userAddress;
    this.items = items;
    this.totalPrice = totalPrice;
    this.status = status;
    this.createdAt = createdAt;
  }

  // Convert để lưu lên Firestore
  toFirestore() {
    return {
      userId: this.userId,
      userName: this.userName,
      userPhone: this.userPhone,
      userAddress: this.userAddress,
      items: this.items,
      totalPrice: this.totalPrice,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}