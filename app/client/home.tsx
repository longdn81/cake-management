import React, { useState, useCallback } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Image, ActivityIndicator, RefreshControl, StatusBar 
} from 'react-native';
import { Search, ShoppingBag, Plus, Star } from 'lucide-react-native'; 
import { useRouter, useFocusEffect } from 'expo-router';

// Controller
import { getCakes } from '../../src/controllers/admin/cake.controller';
import { getBanners } from '../../src/controllers/admin/banner.controller';
import { getCategories } from '../../src/controllers/admin/category.controller';

const THEME_COLOR = '#d97706';

export default function ClientHomeScreen() {
  const router = useRouter();
  
  // State dữ liệu
  const [newCakes, setNewCakes] = useState<any[]>([]);
  const [popularCakes, setPopularCakes] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Giả lập tên User (Sau này lấy từ Auth Context)
  const userName = "Hoang Long";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy dữ liệu
  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const [cakesData, bannersData, catsData] = await Promise.all([
        getCakes(), getBanners(), getCategories()
      ]);
      
      // Xử lý ảnh và data bánh
      const formattedCakes = cakesData.map(item => ({
        ...item,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
        rate: item.rate || 0, // Đảm bảo có rate
      }));

      // 1. Lọc New Cakes: Lấy 8 cái mới nhất (Đảo ngược mảng gốc)
      // Lưu ý: Nếu Firestore trả về cũ -> mới, thì reverse() sẽ ra mới nhất.
      const recentCakes = [...formattedCakes].reverse().slice(0, 8);

      // 2. Lọc Popular Cakes: Sort theo rate giảm dần, lấy 8 cái
      const topRatedCakes = [...formattedCakes]
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 8);

      setNewCakes(recentCakes);
      setPopularCakes(topRatedCakes);
      setBanners(bannersData);
      setCategories(catsData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData() }, []));

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const handleProductPress = (id: string) => {
    if(!id) return;
    router.push({ pathname: "/client/detailCake", params: { id: id } });
  };

  // --- COMPONENT CON: ITEM BÁNH NGANG ---
  const renderCakeItem = (cake: any) => (
    <TouchableOpacity key={cake.id} style={styles.cakeCardHorizontal} onPress={() => handleProductPress(cake.id)}>
        <View style={styles.imageWrapper}>
            <Image source={{ uri: cake.image }} style={styles.cakeImage} />
            {/* Badge Rating trên ảnh */}
            <View style={styles.ratingBadge}>
                <Star size={10} color="#fff" fill="#fff" />
                <Text style={styles.ratingText}>{cake.rate.toFixed(1)}</Text>
            </View>
        </View>
        
        <View style={styles.cakeInfo}>
            <Text style={styles.cakeName} numberOfLines={1}>{cake.name}</Text>
            <Text style={styles.cakeCategory} numberOfLines={1}>{cake.category}</Text>
            
            <View style={styles.cakeFooter}>
                <Text style={styles.cakePrice}>${cake.price}</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Plus size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />
      
      {/* 1. HEADER CAM & SEARCH */}
      <View style={styles.headerContainer}>
         <View style={styles.headerContent}>
             <View>
                 <Text style={styles.greetingText}>Good Morning,</Text>
                 <Text style={styles.userNameText}>{userName} 👋</Text>
             </View>
             <TouchableOpacity style={styles.cartBtnHeader} onPress={() => router.push('/client/cart')}>
                 <ShoppingBag size={24} color={THEME_COLOR} />
             </TouchableOpacity>
         </View>

         {/* Search Bar nằm lơ lửng */}
         <View style={styles.searchWrapper}>
             <Search size={20} color="#9ca3af" style={{marginRight: 10}} />
             <TextInput 
                 style={styles.searchInput}
                 placeholder="Search cake, dessert..."
                 placeholderTextColor="#9ca3af"
             />
         </View>
      </View>

      <ScrollView 
        contentContainerStyle={{paddingTop: 40, paddingBottom: 100}} // PaddingTop để bù cho SearchBar lơ lửng
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME_COLOR]} />}
      >
        
        {/* 2. BANNERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll} contentContainerStyle={{paddingHorizontal: 20}}>
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
            </View>
          ))}
        </ScrollView>

        {/* 3. CATEGORIES */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{paddingHorizontal: 20}}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. NEW CAKES (Horizontal) */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals ✨</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>
        
        {loading && !refreshing ? (
            <ActivityIndicator color={THEME_COLOR} style={{marginLeft: 20}} />
        ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                {newCakes.map(cake => renderCakeItem(cake))}
            </ScrollView>
        )}

        {/* 5. POPULAR CAKES (Horizontal) */}
        <View style={[styles.sectionHeader, {marginTop: 20}]}>
            <Text style={styles.sectionTitle}>Popular Cakes 🔥</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>

        {loading && !refreshing ? (
            <ActivityIndicator color={THEME_COLOR} style={{marginLeft: 20}} />
        ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                {popularCakes.map(cake => renderCakeItem(cake))}
            </ScrollView>
        )}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  
  // --- HEADER STYLES ---
  headerContainer: {
    backgroundColor: THEME_COLOR,
    paddingTop: 50, // Cho tai thỏ
    paddingBottom: 40, // Chừa chỗ cho search bar đè lên
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userNameText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  cartBtnHeader: { 
    backgroundColor: '#fff', padding: 10, borderRadius: 12, 
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 
  },

  // Search Bar (Floating)
  searchWrapper: {
    position: 'absolute', bottom: -25, left: 20, right: 20,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, height: 50, borderRadius: 15,
    shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  // --- SECTIONS ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAllText: { fontSize: 14, color: THEME_COLOR, fontWeight: '600' },

  // Banners
  bannerScroll: { marginTop: 10, marginBottom: 20 },
  bannerCard: { width: 300, height: 150, marginRight: 15, borderRadius: 16, overflow: 'hidden', backgroundColor: '#e5e7eb' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Categories
  categoryScroll: { marginBottom: 20 },
  categoryItem: { marginRight: 20, alignItems: 'center', width: 64 },
  categoryIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  categoryIcon: { width: '60%', height: '60%', resizeMode: 'contain' },
  categoryName: { fontSize: 12, color: '#4b5563', textAlign: 'center', fontWeight: '500' },

  // --- CAKE ITEM HORIZONTAL ---
  cakeCardHorizontal: { 
    width: 160, backgroundColor: '#fff', borderRadius: 16, marginRight: 15, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 
  },
  imageWrapper: { position: 'relative' },
  cakeImage: { width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#f3f4f6' },
  ratingBadge: { 
    position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 
  },
  ratingText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  
  cakeInfo: { padding: 10 },
  cakeName: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  cakeCategory: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  cakeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cakePrice: { fontSize: 16, fontWeight: 'bold', color: THEME_COLOR },
  addBtn: { backgroundColor: THEME_COLOR, padding: 6, borderRadius: 8 },

});