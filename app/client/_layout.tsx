import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Heart, User, ShoppingBag } from 'lucide-react-native';
import { View } from 'react-native';

// 1. Import Firebase
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig'; // Đảm bảo đường dẫn đúng
import { useEffect, useState } from 'react';

const THEME_COLOR = '#d97706';

  
export default function ClientLayout() {
  // 2. State lưu số lượng giỏ hàng
  const [cartCount, setCartCount] = useState(0);
  const auth = getAuth();

  // 3. Lắng nghe thay đổi của giỏ hàng (Real-time)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Tạo listener lắng nghe thay đổi của document user
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const cart = data.cart || [];
        // Cập nhật số lượng (dựa trên độ dài mảng cart)
        setCartCount(cart.length);
        
        // Nếu muốn đếm tổng số lượng item (ví dụ mua 2 cái bánh A thì tính là 2):
        // const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        // setCartCount(total);
      } else {
        setCartCount(0);
      }
    });

    // Cleanup listener khi component unmount (để tránh rò rỉ bộ nhớ)
    return () => unsub();
  }, []); 
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của Tabs (Chúng ta tự custom trong từng trang)
        tabBarActiveTintColor: '#d97706', // Màu cam khi được chọn
        tabBarInactiveTintColor: '#9ca3af', // Màu xám khi không chọn
        tabBarShowLabel: true, // Hiện chữ bên dưới icon
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          elevation: 0, // Bỏ bóng trên Android cho phẳng đẹp
        },
      }}
    >
      {/* 1. Trang Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      {/* 2. Trang Yêu thích */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />

      {/* 3. Trang Giỏ hàng */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
          // Chỉ hiện Badge nếu số lượng > 0
          tabBarBadge: cartCount > 0 ? cartCount : undefined, 
          tabBarBadgeStyle: { backgroundColor: THEME_COLOR, color: 'white', fontSize: 10 }
        }}
      />

      {/* 4. Trang Cá nhân */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="detailCake" // Tên phải trùng với tên file detailCake.tsx
        options={{
          href: null, // Ẩn khỏi menu tabs
          tabBarStyle: { display: 'none' }, // Ẩn thanh tab bar khi vào trang này
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="your_orders" 
        options={{
          href: null, // Ẩn khỏi menu
          tabBarStyle: { display: 'none' }, // Ẩn thanh tab khi vào trang này
          headerShown: false,
        }}
      />
    </Tabs>
  );
}