import React, { useState, useCallback } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { Search, ShoppingBag, Plus } from 'lucide-react-native'; 
import { useRouter, useFocusEffect } from 'expo-router';

// TÁI SỬ DỤNG CONTROLLER TỪ ADMIN (Rất tiện!)
import { getCakes } from '../../src/controllers/admin/cake.controller';
import { getBanners } from '../../src/controllers/admin/banner.controller';
import { getCategories } from '../../src/controllers/admin/category.controller';

export default function ClientHomeScreen() {
  const router = useRouter();
  
  // State dữ liệu
  const [cakes, setCakes] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy dữ liệu
  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      // Gọi 3 API cùng lúc
      const [cakesData, bannersData, catsData] = await Promise.all([
        getCakes(), getBanners(), getCategories()
      ]);
      
      // Xử lý ảnh bánh (lấy ảnh đầu tiên)
      const formattedCakes = cakesData.map(item => ({
        ...item,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150'
      }));

      setCakes(formattedCakes);
      setBanners(bannersData);
      setCategories(catsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động tải khi vào màn hình
  useFocusEffect(useCallback(() => { fetchData() }, []));

  // Kéo xuống reload
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  // Xử lý khi bấm vào bánh (Sau này sẽ dẫn sang trang product)
  const handleProductPress = (id: string) => {
    console.log("Xem chi tiết bánh:", id);
    // router.push(`/client/product/${id}`); // Tạm thời comment vì chưa tạo trang product
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Client */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.title}>Let's order fresh cake!</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/client/cart')}>
          <ShoppingBag size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* 2. Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
            style={styles.searchInput} 
            placeholder="Search your favorite cake..." 
            placeholderTextColor="#9ca3af" 
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#d97706"]} />}
      >
        
        {/* 3. Banners Slider */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
            </View>
          ))}
        </ScrollView>

        {/* 4. Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. Popular Cakes (Product List) */}
        <Text style={styles.sectionTitle}>Popular Cakes</Text>
        
        {loading && !refreshing ? (
            <ActivityIndicator color="#d97706" size="large" />
        ) : (
            <View style={styles.cakeGrid}>
            {cakes.map((cake) => (
                <TouchableOpacity key={cake.id} style={styles.cakeCard} onPress={() => handleProductPress(cake.id)}>
                <Image source={{ uri: cake.image }} style={styles.cakeImage} />
                <View style={styles.cakeInfo}>
                    <Text style={styles.cakeName} numberOfLines={1}>{cake.name}</Text>
                    <View style={styles.cakeFooter}>
                        <Text style={styles.cakePrice}>${cake.price}</Text>
                        <TouchableOpacity style={styles.addBtn}>
                            <Plus size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                </TouchableOpacity>
            ))}
            </View>
        )}
        
        {/* Padding bottom để không bị tab bar che mất */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  greeting: { fontSize: 14, color: '#6b7280' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  cartBtn: { padding: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },

  bannerScroll: { marginBottom: 25 },
  bannerCard: { width: 300, height: 140, marginRight: 15, borderRadius: 16, overflow: 'hidden', backgroundColor: '#e5e7eb' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#111827' },
  
  categoryScroll: { marginBottom: 25 },
  categoryItem: { marginRight: 20, alignItems: 'center', width: 60 },
  categoryIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  categoryIcon: { width: '100%', height: '100%', resizeMode: 'cover' },
  categoryName: { fontSize: 12, color: '#4b5563', textAlign: 'center' },

  cakeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cakeCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  cakeImage: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  cakeInfo: { padding: 10 },
  cakeName: { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#111827' },
  cakeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cakePrice: { fontSize: 16, fontWeight: 'bold', color: '#d97706' },
  addBtn: { backgroundColor: '#d97706', padding: 6, borderRadius: 8 },
});