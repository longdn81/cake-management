import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Order } from "../../models/order.model";

// 1. Lấy danh sách tất cả đơn hàng
export const getOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    // Sắp xếp theo ngày tạo mới nhất trước
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Map data từ Firestore sang Model Order
      orders.push(new Order(
        doc.id,
        data.userId,
        data.userName,
        data.userPhone,
        data.userAddress,
        data.items,
        data.totalPrice,
        data.status,
        data.createdAt
      ));
    });
    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
};

// 2. Cập nhật trạng thái đơn hàng (Pending -> Completed / Cancelled)
export const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus
    });
    console.log(`Order ${orderId} updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, data: any) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, data);
    console.log(`Order ${orderId} updated successfully`);
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};