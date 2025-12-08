import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Heart, User } from 'lucide-react-native';
import { View } from 'react-native';

export default function ClientLayout() {
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
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
          // Ví dụ: Hiện badge số lượng
          tabBarBadge: 2, 
          tabBarBadgeStyle: { backgroundColor: '#d97706', color: 'white', fontSize: 10 }
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
    </Tabs>
  );
}