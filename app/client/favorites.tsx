import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, ShoppingBag, HeartOff } from 'lucide-react-native';

// Firebase
import { getAuth } from 'firebase/auth';
import { doc, getDoc, documentId, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';

// Model
import { Cake } from '../../src/models/cake.model';

const THEME_COLOR = '#d97706';

export default function FavoritesScreen() {
  const router = useRouter();
  const auth = getAuth();
  
  const [favoriteCakes, setFavoriteCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      if (!refreshing) setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        setFavoriteCakes([]);
        return;
      }

      // 1. Lấy mảng ID favorites từ User
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;
      
      const favoriteIds = userDoc.data().favorites || [];

      if (favoriteIds.length === 0) {
        setFavoriteCakes([]);
        return;
      }

      // 2. Query lấy thông tin bánh theo mảng ID
      // Lưu ý: Firestore 'in' query giới hạn tối đa 10 phần tử mỗi lần gọi.
      // Nếu danh sách > 10, cần chia nhỏ mảng (batching). Ở đây làm demo cho < 10.
      // Giải pháp thực tế: Lấy tất cả bánh về rồi lọc (nếu ít) hoặc chia batch.
      
      // Cách đơn giản và an toàn nhất cho người mới: Promise.all từng cái (hơi chậm nếu list dài nhưng chắc chắn chạy)
      const promises = favoriteIds.map(async (id: string) => {
         const cakeDoc = await getDoc(doc(db, "cakes", id));
         if (cakeDoc.exists()) {
             return Cake.fromFirestore(cakeDoc);
         }
         return null;
      });

      const results = await Promise.all(promises);
      // Lọc bỏ những cái null (ví dụ bánh đã bị xóa khỏi hệ thống nhưng user vẫn còn lưu ID)
      const validCakes = results.filter((cake): cake is Cake => cake !== null);

      setFavoriteCakes(validCakes);

    } catch (error) {
      console.error("Lỗi lấy danh sách yêu thích:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchFavorites();
  }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, []);

  const renderItem = ({ item }: { item: Cake }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({ pathname: "/client/detailCake", params: { id: item.id } })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.image} />
      <View style={styles.info}>
        <View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
        </View>
        <View style={styles.footer}>
            <Text style={styles.price}>${item.price}</Text>
            {item.rate > 0 && (
                <View style={styles.rating}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{item.rate}</Text>
                </View>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Favorites</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      ) : (
        <FlatList
            data={favoriteCakes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME_COLOR]} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <HeartOff size={64} color="#e5e7eb" />
                    <Text style={styles.emptyText}>No favorites yet.</Text>
                    <Text style={styles.emptySubText}>Start exploring and like some cakes!</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { padding: 20 },
  
  // Card Styles (Giống CakeManagement nhưng đơn giản hơn)
  card: { 
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  category: { fontSize: 13, color: '#6b7280' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: THEME_COLOR },
  rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#b45309', marginLeft: 4 },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
});