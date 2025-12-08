import { Tabs,useRouter } from 'expo-router';
import { Home, ShoppingBag, Package, User, ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';


export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#d97706',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ size, color }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AddScreen/AddCakeScreen"
        options={{
          href: null, // Ẩn khỏi menu dưới
          tabBarStyle: { display: 'none' }, // Ẩn thanh tab bar khi vào trang này
          headerShown: true, // Hiện header
          title: 'Create New Cake',
          // Thay thế headerBackTitle bằng headerLeft
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 16 }} // Căn lề trái cho đẹp
            >
              <ChevronLeft size={28} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="AddScreen/AddBannerScreen"
        options={{
          href: null, // Ẩn khỏi menu dưới
          tabBarStyle: { display: 'none' }, // Ẩn thanh tab bar khi vào trang này
          headerShown: true,
          title: 'Add New Banner',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 16 }}
            >
              <ChevronLeft size={28} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="AddScreen/AddCategoryScreen"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
          headerShown: true,
          title: 'Add New Category',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <ChevronLeft size={28} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
