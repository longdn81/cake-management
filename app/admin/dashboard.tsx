import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ChefHat, Bell } from 'lucide-react-native'; // Thêm Bell icon
import { useFocusEffect, useRouter } from 'expo-router';

// Firebase Imports
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';

import { Banner } from '../../src/models/banner.model';
import { Cake } from '../../src/models/cake.model';
import { Category } from '../../src/models/category.model';

import { getCakes } from '../../src/controllers/admin/cake.controller';
import { getBanners } from '../../src/controllers/admin/banner.controller';
import { getCategories } from '../../src/controllers/admin/category.controller';

import CakeModal from '../../src/views/components/modals/CakeModal';
import CategoryModal from '../../src/views/components/modals/CategoryModal';
import BannerModal from '../../src/views/components/modals/BannerModal';

import { useCallback, useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const auth = getAuth();

  // State User Admin
  const [adminName, setAdminName] = useState('Admin');
  const [adminAvatar, setAdminAvatar] = useState('https://via.placeholder.com/150');

  // State lưu dữ liệu
  const [cakes, setCakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // State Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  //  State lưu thống kê
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
  });

  // 1. Hàm lấy thông tin Admin
  const fetchAdminInfo = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      // 1. Xác định thời gian bắt đầu của ngày hôm nay (00:00:00)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = startOfDay.getTime();

      // 2. Tạo Query lấy đơn hàng từ đầu ngày đến giờ
      const ordersRef = collection(db, "orders");
      const qToday = query(ordersRef, where("createdAt", ">=", startTimestamp));

      // 3. Chạy Promise.all để lấy tất cả dữ liệu cùng lúc
      const [cakesData, bannersData, categoriesData, ordersSnap] = await Promise.all([
        getCakes(),
        getBanners(),
        getCategories(),
        getDocs(qToday) // Lấy các đơn hàng hôm nay
      ]);

      // --- XỬ LÝ DỮ LIỆU THỐNG KÊ ---
      let todayRevenue = 0;
      const todayOrdersCount = ordersSnap.size;

      ordersSnap.forEach((doc) => {
        const data = doc.data();
        // Chỉ cộng tiền những đơn không bị hủy (tuỳ logic của bạn)
        if (data.status !== 'cancelled') {
            todayRevenue += (data.totalPrice || 0);
        }
      });

      setStats({
        ordersToday: todayOrdersCount,
        revenueToday: todayRevenue
      });
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAdminName(data.name || 'Admin'); 
          if(data.avatarUrl) setAdminAvatar(data.avatarUrl);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin admin:", error);
    }
  };

  // 2. Hàm lấy dữ liệu Dashboard
  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const [cakesData, bannersData, categoriesData] = await Promise.all([
        getCakes(),
        getBanners(),
        getCategories()
      ]);

      const formattedCakes = cakesData.map(item => ({
        ...item,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150' 
      }));
      setCakes(formattedCakes);
      setBanners(bannersData);
      setCategories(categoriesData);

    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    };
  };

  useFocusEffect(
    useCallback(() => {
      fetchAdminInfo(); // Lấy thông tin admin
      fetchData();      // Lấy dữ liệu
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdminInfo();
    await fetchData();
  }, []);

  const handleEditCake = (cake: any) => {
    setSelectedCake(cake);
    setModalVisible(true);
  };
  const handleEditCategory = (cat: any) => {
    setSelectedCategory(cat);
    setCategoryModalVisible(true);
  };
  const handleEditBanner = (banner: any) => {
    setSelectedBanner(banner);
    setBannerModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* --- HEADER ADMIN (ĐÃ SỬA) --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            {/* Avatar Admin */}
            <Image source={{ uri: adminAvatar }} style={styles.avatar} />
            <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Welcome Back,</Text>
                <Text style={styles.adminName}>{adminName} 👋</Text>
            </View>
        </View>
        
        {/* Nút Notification giả */}
        <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#374151" />
            <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
      {/* --------------------------- */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#d97706"]} />}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
                <Text style={styles.statValue}>{loading ? "..." : cakes.length}</Text> 
                <Text style={styles.statLabel}>Total Cakes</Text>
             </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
                {loading ? "..." : stats.ordersToday}
            </Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>

          {/* Card 3: Revenue Today */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
                {loading ? "..." : `$${stats.revenueToday.toLocaleString()}`}
            </Text>
            <Text style={styles.statLabel}>Revenue (Today)</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers (Banners)</Text>
          <TouchableOpacity onPress={() => router.push('/admin/Management/BannerManagementScreen')}>
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          {banners.map((banner) => (
            <TouchableOpacity 
                key={banner.id} 
                style={styles.bannerCard}
                onPress={() => handleEditBanner(banner)}
            >
              <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>Limited</Text>
                </View>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerDiscount}>{banner.discount}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.addBannerBtn}
            onPress={() => router.push('/admin/AddScreen/AddBannerScreen')}
          >
              <Plus size={24} color="#d97706" />
              <Text style={styles.addBannerText}>Add Banner</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push('/admin/Management/CategoryManagementScreen')}>
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryItem}
                onPress={() => handleEditCategory(cat)} 
            >
              <View style={styles.categoryIconContainer}>
                <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
           <TouchableOpacity 
              style={styles.categoryItem}
              onPress={() => router.push('/admin/AddScreen/AddCategoryScreen')} 
           >
              <View style={[styles.categoryIconContainer, styles.addCategoryIcon]}>
                <Plus size={24} color="#d97706" />
              </View>
              <Text style={styles.categoryName}>Add New</Text>
            </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product List</Text>
          <TouchableOpacity onPress={() => router.push('/admin/Management/CakeManagementScreen')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

          {loading && !refreshing ? (
           <ActivityIndicator size="large" color="#d97706" style={{marginTop: 20}} />
        ) : (
           <View style={styles.cakeGrid}>
             {cakes.map((cake) => (
               <TouchableOpacity 
                  key={cake.id} 
                  style={styles.cakeCard}
                  onPress={() => handleEditCake(cake)} 
               >
                 <Image source={{ uri: cake.image }} style={styles.cakeImage} />
                 <View style={styles.cakeInfo}>
                   <Text style={styles.cakeName} numberOfLines={1}>{cake.name}</Text>
                   <Text style={styles.cakeCategory}>{cake.category}</Text>
                   <View style={styles.cakeFooter}>
                     <Text style={styles.cakePrice}>${cake.price}</Text>
                     <View style={[
                      styles.statusBadge, 
                      cake.status === 'Low Stock' && styles.statusBadgeWarning,
                      cake.status === 'Out of Stock' && styles.statusBadgeError
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        cake.status === 'Low Stock' && styles.statusTextWarning,
                        cake.status === 'Out of Stock' && styles.statusTextError
                      ]}>
                        {cake.status}
                      </Text>
                    </View>
                   </View>
                 </View>
               </TouchableOpacity>
             ))}
           </View>
        )} 
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/admin/AddScreen/AddCakeScreen')} 
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      <CakeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cake={selectedCake}
        categories={categories}
        onUpdateSuccess={() => fetchData()}
      />
      <CategoryModal 
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        category={selectedCategory}
        onUpdateSuccess={() => fetchData()}
      />
      <BannerModal 
         visible={bannerModalVisible}
         onClose={() => setBannerModalVisible(false)}
         banner={selectedBanner}
         onUpdateSuccess={fetchData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },

  // --- HEADER STYLES (MỚI) ---
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    marginBottom: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
  headerTextContainer: { marginLeft: 12 },
  greeting: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  adminName: { fontSize: 18, color: '#111827', fontWeight: 'bold' },
  
  iconButton: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 12, position: 'relative' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#fff' },
  // ---------------------------

  // Stats Section
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 24, marginTop: 10
  },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12,
    padding: 16, marginHorizontal: 4, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#d97706', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center' },

  // Common Section Headers
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: '#d97706', fontWeight: '600' },

  // Banner Section
  bannerScroll: { paddingLeft: 20, marginBottom: 24 },
  bannerCard: {
    width: 280, height: 140, marginRight: 16,
    borderRadius: 12, overflow: 'hidden', position: 'relative',
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, justifyContent: 'center',
  },
  bannerTag: {
    backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6,
  },
  bannerTagText: { fontSize: 10, fontWeight: '700', color: '#d97706' },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  bannerDiscount: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  
  addBannerBtn: {
    width: 100, height: 140, marginRight: 20,
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#d97706',
    borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  addBannerText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#d97706' },

  // Category Section
  categoryScroll: { paddingLeft: 20, marginBottom: 24 },
  categoryItem: { marginRight: 20, alignItems: 'center', width: 70 },
  categoryIconContainer: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: { width: 32, height: 32, resizeMode: 'contain' },
  categoryName: { fontSize: 12, fontWeight: '500', color: '#374151', textAlign: 'center' },
  addCategoryIcon: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#d97706' },

  // Product List (Cake Grid)
  cakeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 80,
  },
  cakeCard: {
    width: '48%', backgroundColor: '#ffffff', borderRadius: 12,
    marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb',
  },
  cakeImage: { width: '100%', height: 120, backgroundColor: '#f3f4f6' },
  cakeInfo: { padding: 12 },
  cakeName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  cakeCategory: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  cakeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cakePrice: { fontSize: 16, fontWeight: '700', color: '#d97706' },
  
  statusBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeWarning: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: '600', color: '#059669' },
  statusTextWarning: { color: '#d97706' },
  statusBadgeError: { backgroundColor: '#fee2e2' },
  statusTextError: { color: '#dc2626' },

  fab: {
    position: 'absolute', bottom: 30, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#d97706',
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
});