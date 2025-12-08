import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ChefHat } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { Banner } from '../../src/models/banner.model';
import { Cake } from '../../src/models/cake.model';
import { Category } from '../../src/models/category.model';

import { getCakes } from '../../src/controllers/admin/cake.controller';
import { getBanners } from '../../src/controllers/admin/banner.controller';
import { getCategories } from '../../src/controllers/admin/category.controller';

import CakeModal from '../../src/views/components/modals/CakeModal';
import CategoryModal from '../../src/views/components/modals/CategoryModal';

import { useCallback, useEffect, useState } from 'react';


export default function HomeScreen() {
  const router = useRouter();

  // 2. State lưu dữ liệu
  const [cakes, setCakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ---> STATE CHO MODAL EDIT <---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any>(null);
  // ---> STATE CHO MODAL CATEGORY (MỚI) <---
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // 3. Hàm lấy dữ liệu
  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      // Chạy song song 3 request: Cakes, Banners, Categories
      const [cakesData, bannersData, categoriesData] = await Promise.all([
        getCakes(),
        getBanners(),
        getCategories() // <-- GỌI HÀM LẤY CATEGORY
      ]);

      // 1. Xử lý dữ liệu Cake
      const formattedCakes = cakesData.map(item => ({
        ...item,
        // Model Cake là mảng images[], lấy ảnh đầu tiên
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150' 
      }));
      setCakes(formattedCakes);

      // 2. Xử lý dữ liệu Banner
      // Model Banner đã chuẩn rồi, gán trực tiếp
      setBanners(bannersData);
      // C. Xử lý dữ liệu Category
      setCategories(categoriesData);

    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    };
  };

  // 4. Gọi hàm khi màn hình mở lên
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // 5. Hàm xử lý khi kéo xuống để reload
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);
  // ---> 4. HÀM MỞ MODAL KHI BẤM VÀO BÁNH <---
  const handleEditCake = (cake: any) => {
    console.log("Edit cake:", cake.name);
    setSelectedCake(cake); // Lưu bánh được chọn
    setModalVisible(true); // Hiện modal
  };
  // ---> HÀM MỞ MODAL CATEGORY <---
  const handleEditCategory = (cat: any) => {
    console.log("Edit category:", cat.name);
    setSelectedCategory(cat);
    setCategoryModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.title}>Cake Management</Text>
        </View>
        <View style={styles.logoContainer}>
          <ChefHat size={32} color="#d97706" />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cakes..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
                <Text style={styles.statValue}>{loading ? "..." : cakes.length}</Text> 
                <Text style={styles.statLabel}>Total Cakes</Text>
             </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$850</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers (Banners)</Text>
          <TouchableOpacity onPress={() => console.log('Manage Banners')}>
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          {/* Map dữ liệu thật từ state banners */}
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              {/* Lưu ý: Model Banner dùng trường `imageUrl` */}
              <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>Limited</Text>
                </View>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerDiscount}>{banner.discount}</Text>
              </View>
            </View>
          ))}
          {/* Nút thêm banner nhanh */}
          <TouchableOpacity 
            style={styles.addBannerBtn}
            onPress={() => router.push('/admin/AddScreen/AddBannerScreen')} // <--- THÊM DÒNG NÀY
          >
             <Plus size={24} color="#d97706" />
             <Text style={styles.addBannerText}>Add Banner</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3. CATEGORIES SECTION (UI MỚI) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity 
             onPress={() => router.push('/admin/Management/CategoryManagementScreen')} // <--- SỬA DÒNG NÀY
          >
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryItem}
                // ---> GẮN SỰ KIỆN TẠI ĐÂY <---
                onPress={() => handleEditCategory(cat)} 
            >
              <View style={styles.categoryIconContainer}>
                {/* Model Category có trường `icon` chứa URL ảnh */}
                <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
          {/* Nút thêm category nhanh */}
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
        {/* 4. PRODUCT LIST SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product List</Text>
          <TouchableOpacity 
             onPress={() => router.push('/admin/Management/CakeManagementScreen')} 
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {/* load cakes */}
          {loading && !refreshing ? (
           <ActivityIndicator size="large" color="#d97706" style={{marginTop: 20}} />
        ) : (
           <View style={styles.cakeGrid}>
             {cakes.map((cake) => (
               <TouchableOpacity 
                  key={cake.id} 
                  style={styles.cakeCard}
                  onPress={() => handleEditCake(cake)} // <--- BẮT SỰ KIỆN TẠI ĐÂY
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
                      cake.status === 'Out of Stock' && styles.statusBadgeError // <--- Thêm dòng này (Màu đỏ nền)
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        cake.status === 'Low Stock' && styles.statusTextWarning,
                        cake.status === 'Out of Stock' && styles.statusTextError // <--- Thêm dòng này (Màu đỏ chữ)
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
        categories={categories} // Truyền list danh mục để chọn trong modal
        onUpdateSuccess={() => {
            fetchData(); // Reload lại Dashboard sau khi sửa xong
        }}
      />
      <CategoryModal 
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        category={selectedCategory}
        onUpdateSuccess={() => {
            fetchData(); // Reload lại Dashboard sau khi sửa xong danh mục
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- 1. Main Container & Layout ---
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },

  // --- 2. Header & Search ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: { fontSize: 14, color: '#6b7280' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 2 },
  logoContainer: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', marginHorizontal: 20, marginVertical: 16,
    paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: '#111827' },

  // --- 3. Stats Section (Thống kê) ---
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 24,
  },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12,
    padding: 16, marginHorizontal: 4, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#d97706', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center' },

  // --- 4. Common Section Headers ---
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: '#d97706', fontWeight: '600' },

  // --- 5. Banner Section (Mới thêm) ---
  bannerScroll: {
    paddingLeft: 20, marginBottom: 24,
  },
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
  
  // Nút Add Banner
  addBannerBtn: {
    width: 100, height: 140, marginRight: 20,
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#d97706',
    borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  addBannerText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#d97706' },

  // --- 6. Category Section (Mới thêm) ---
  categoryScroll: {
    paddingLeft: 20, marginBottom: 24,
  },
  categoryItem: {
    marginRight: 20, alignItems: 'center', width: 70,
  },
  categoryIconContainer: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: { width: 32, height: 32, resizeMode: 'contain' },
  categoryName: { fontSize: 12, fontWeight: '500', color: '#374151', textAlign: 'center' },
  addCategoryIcon: {
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#d97706',
  },

  // --- 7. Product List (Cake Grid) ---
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
  
  // Status Badge
  statusBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeWarning: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: '600', color: '#059669' },
  statusTextWarning: { color: '#d97706' },
  statusBadgeError: { backgroundColor: '#fee2e2' }, // Màu nền đỏ nhạt
  statusTextError: { color: '#dc2626' },

  // --- 8. Floating Action Button ---
  fab: {
    position: 'absolute', bottom: 30, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#d97706',
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
});