import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, Star, Plus } from 'lucide-react-native';
import { getCakes } from '../../src/controllers/admin/cake.controller';
import { addToCart } from '../../src/controllers/cart.controller';
import { getAuth } from 'firebase/auth';

const THEME_COLOR = '#d97706';

export default function AllProductsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const { type } = useLocalSearchParams(); // Nhận tham số 'new' hoặc 'popular'

  const [cakes, setCakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = type === 'popular' ? 'Popular Cakes 🔥' : 'New Arrivals ✨';

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCakes();
      const formatted = data.map(item => ({
        ...item,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
        rate: item.rate || 0,
      }));

      let finalData = [];
      if (type === 'popular') {
        // Sắp xếp theo rating giảm dần
        finalData = formatted.sort((a, b) => b.rate - a.rate);
      } else {
        // Mặc định là New (đảo ngược mảng để lấy mới nhất)
        finalData = formatted.reverse();
      }
      setCakes(finalData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (id: string) => {
    router.push({ pathname: "/client/detailCake", params: { id: id } });
  };

  const handleQuickAdd = async (cake: any) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login");
    try {
        await addToCart(user.uid, {
            cakeId: cake.id, name: cake.name, image: cake.image,
            price: cake.price, quantity: 1, variant: null
        });
        alert(`Added ${cake.name}`);
    } catch(e) { console.log(e); }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item.id)}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.rateBadge}>
            <Star size={10} color="#fff" fill="#fff"/>
            <Text style={styles.rateText}>{item.rate.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cat}>{item.category}</Text>
        <View style={styles.footer}>
            <Text style={styles.price}>${item.price}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleQuickAdd(item)}>
                <Plus size={16} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME_COLOR} style={{marginTop: 50}} />
      ) : (
        <FlatList
            data={cakes}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={{padding: 20}}
            showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 0, overflow: 'hidden' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  rateBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  rateText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  
  info: { padding: 12 },
  name: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  cat: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: THEME_COLOR },
  addBtn: { backgroundColor: THEME_COLOR, padding: 6, borderRadius: 8 },
});