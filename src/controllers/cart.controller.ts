// src/controllers/client/cart.controller.ts
import { collection, addDoc, doc, updateDoc, getDoc, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Order } from "../models/order.model";

// 1. Hàm Thêm vào Giỏ hàng (Logic Cộng dồn số lượng)
export const addToCart = async (uid: string, newItem: any) => {
  try {
    const userRef = doc(db, "users", uid);
    
    // B1: Lấy dữ liệu giỏ hàng hiện tại
    const userDoc = await getDoc(userRef);
    let currentCart: any[] = [];
    
    if (userDoc.exists()) {
      currentCart = userDoc.data().cart || [];
    }

    // B2: Kiểm tra trùng lặp
    // Item được coi là trùng nếu cùng cakeId và cùng variant (label)
    const existingIndex = currentCart.findIndex((item) => {
      const isSameId = item.cakeId === newItem.cakeId;
      // So sánh variant (nếu cả 2 đều null hoặc cùng label)
      const variantLabel1 = item.variant ? item.variant.label : 'std';
      const variantLabel2 = newItem.variant ? newItem.variant.label : 'std';
      const isSameVariant = variantLabel1 === variantLabel2;

      return isSameId && isSameVariant;
    });

    if (existingIndex !== -1) {
      // B3: Nếu ĐÃ CÓ -> Cộng dồn số lượng
      currentCart[existingIndex].quantity += newItem.quantity;
      console.log("Updated quantity for existing item");
    } else {
      // B4: Nếu CHƯA CÓ -> Thêm mới
      currentCart.push(newItem);
      console.log("Added new item to cart");
    }

    // B5: Cập nhật lại toàn bộ giỏ hàng lên Firestore
    await updateDoc(userRef, {
      cart: currentCart
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    throw error;
  }
};

// 2. Hàm cập nhật lại toàn bộ giỏ hàng (Dùng cho Tăng/Giảm/Xóa ở màn hình Cart)
export const updateUserCart = async (uid: string, newCart: any[]) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      cart: newCart
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

// 3. Hàm Tạo Đơn Hàng & Xóa Cart
export const createOrder = async (order: Order) => {
  try {
    // Lưu đơn hàng
    await addDoc(collection(db, "orders"), order.toFirestore());
    
    // Xóa giỏ hàng sau khi đặt
    const userRef = doc(db, "users", order.userId);
    await updateDoc(userRef, {
      cart: [] 
    });
    
    console.log("Order created & Cart cleared!");
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    // Query: userId == userId hiện tại, sắp xếp ngày tạo giảm dần
    const q = query(
      ordersRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc") 
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
    console.error("Error getting user orders:", error);
    return [];
  }
};

// 2. Client cập nhật đơn hàng (Chỉ sửa đc Info hoặc Cancel)
export const clientUpdateOrder = async (orderId: string, updateData: any) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, updateData);
    } catch (error) {
        console.error("Client update order error:", error);
        throw error;
    }
}