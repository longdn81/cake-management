import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Dimensions, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ChevronLeft, ShoppingBag, Minus, Plus, Heart, Tag, Star
} from 'lucide-react-native';

import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { toggleUserFavorite } from '../../src/controllers/auth.controller';

// Import Controller & Model
import { getCakeById } from '../../src/controllers/admin/cake.controller';
import { Cake } from '../../src/models/cake.model';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#d97706'; // Cam chủ đạo

export default function DetailCakeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const auth = getAuth();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null); 
  
  // State Favorite
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false); // Loading riêng cho nút tim

  useEffect(() => {
    const fetchCakeDetails = async () => {
      // 1. Xử lý ID
      let cakeId = Array.isArray(id) ? id[0] : id;
      if (!cakeId) return;
      cakeId = cakeId.trim();

      // 2. [QUAN TRỌNG] Reset lại trạng thái về chưa like và đang load
      setIsFavorite(false); // <--- THÊM DÒNG NÀY: Mặc định là chưa thích
      setLoading(true);

      try {
        // 3. Lấy thông tin bánh
        const data = await getCakeById(cakeId);
        setCake(data);
        if (data?.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        // 4. Kiểm tra xem User đã like chưa
        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const favorites = userDoc.data().favorites || [];
                
                // Debug: In ra để kiểm tra xem ID có khớp không
                console.log("Current Cake ID:", cakeId);
                console.log("User Favorites:", favorites);

                // Chỉ set true nếu ID thực sự có trong danh sách
                if (favorites.includes(cakeId)) {
                    setIsFavorite(true);
                }
            }
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCakeDetails();
  }, [id]);
  const toggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Vui lòng đăng nhập để lưu yêu thích!");
        return;
    }
    if (!cake) return;

    // UI Optimistic Update (Cập nhật giao diện trước cho mượt)
    const newStatus = !isFavorite;
    setIsFavorite(newStatus); 

    try {
        setFavLoading(true);
        // Gọi controller: nếu đang false -> true (isAdding = true)
        await toggleUserFavorite(user.uid, cake.id, newStatus);
        console.log(newStatus ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
    } catch (error) {
        // Nếu lỗi thì revert lại UI
        setIsFavorite(!newStatus);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
        setFavLoading(false);
    }
  };

  const handleQuantity = (type: 'increase' | 'decrease') => {
    if (type === 'decrease' && quantity > 1) setQuantity(quantity - 1);
    else if (type === 'increase') setQuantity(quantity + 1);
  };

  // --- LOGIC TÍNH GIÁ ---
  const basePrice = selectedVariant ? selectedVariant.price : (cake?.price || 0);
  const discountPercent = cake?.discount || 0;
  
  // Giá sau giảm
  const finalPrice = discountPercent > 0 
      ? basePrice * (1 - discountPercent / 100) 
      : basePrice;

  // Tổng tiền
  const totalPrice = finalPrice * quantity;

  const handleAddToCart = () => {
     if(!cake || !cake.isAvailable) return;
     const sizeLabel = selectedVariant ? `(${selectedVariant.label})` : '';
     alert(`Đã thêm: ${quantity} x ${cake.name} ${sizeLabel}\nTổng: $${totalPrice.toFixed(2)}`);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={THEME_COLOR} /></View>;
  if (!cake) return <View style={styles.center}><Text>Không tìm thấy bánh!</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER BUTTONS */}
      <View style={styles.headerButtons}>
         <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronLeft size={26} color="#fff" />
         </TouchableOpacity>
         <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
            <Heart size={24} color={isFavorite ? THEME_COLOR : "#fff"} fill={isFavorite ? THEME_COLOR : "transparent"} />
         </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        
        {/* IMAGE */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: cake.thumbnail }} style={styles.image} />
          <View style={styles.imageOverlay} />
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
            
            {/* Category Chip */}
            <View style={styles.categoryChip}>
                <Tag size={12} color={THEME_COLOR} style={{marginRight: 4}} />
                <Text style={styles.categoryText}>{cake.category}</Text>
            </View>

            {/* NAME */}
            <Text style={styles.cakeName}>{cake.name}</Text>

            {/* RATING & DISCOUNT ROW */}
            <View style={styles.metaRow}>
                {/* Rating */}
                {cake.rate > 0 && (
                    <View style={styles.ratingBadge}>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" />
                        <Text style={styles.ratingText}>{cake.rate} (Reviews)</Text>
                    </View>
                )}

                {/* Discount Badge */}
                {cake.discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{cake.discount}% OFF</Text>
                    </View>
                )}
            </View>

            {/* PRICE DISPLAY */}
            <View style={styles.priceRow}>
                <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
                {cake.discount > 0 && (
                    <Text style={styles.originalPrice}>${basePrice.toFixed(2)}</Text>
                )}
            </View>

            {/* STATUS (If not Available) */}
            {!cake.isAvailable && (
                <Text style={styles.statusText}>{cake.status}</Text>
            )}

            {/* DESCRIPTION */}
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descText}>
                {cake.description || "Chưa có mô tả cho sản phẩm này."}
            </Text>

            {/* SIZE VARIANTS */}
            {cake.variants && cake.variants.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn kích thước:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
                        {cake.variants.map((v, index) => {
                            const isSelected = selectedVariant?.label === v.label;
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[styles.sizeBadge, isSelected && styles.sizeBadgeSelected]}
                                    onPress={() => setSelectedVariant(v)}
                                >
                                    <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                                        {v.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            )}

            {/* QUANTITY */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Số lượng:</Text>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity('decrease')}>
                        <Minus size={20} color={quantity > 1 ? THEME_COLOR : "#ccc"} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity('increase')}>
                        <Plus size={20} color={THEME_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <TouchableOpacity 
            // Chỉ đổi style xám đi nếu status là 'Out of Stock'
            style={[styles.mainButton, cake.status === 'Out of Stock' && styles.disabledButton]} 
            onPress={handleAddToCart}
            // Chỉ disable nút nếu status là 'Out of Stock'
            disabled={cake.status === 'Out of Stock'}
          >
             <ShoppingBag size={22} color="#fff" style={{marginRight: 10}} />
             <Text style={styles.mainButtonText}>
                {/* Nếu không phải 'Out of Stock' thì vẫn hiện nút mua */}
                {cake.status !== 'Out of Stock' 
                    ? `Thêm vào giỏ  •  $${totalPrice.toFixed(2)}` 
                    : 'Tạm hết hàng'
                }
             </Text>
          </TouchableOpacity>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerButtons: { 
    position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, 
    flexDirection: 'row', justifyContent: 'space-between' 
  },
  iconBtn: { 
    width: 42, height: 42, borderRadius: 21, 
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },

  imageContainer: { width: width, height: width * 0.85 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },

  contentContainer: { 
    flex: 1, backgroundColor: '#fff', 
    marginTop: -40, borderTopLeftRadius: 35, borderTopRightRadius: 35, 
    padding: 24, paddingBottom: 30
  },

  // Category
  categoryChip: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 
  },
  categoryText: { color: THEME_COLOR, fontWeight: '600', fontSize: 12 },
  
  // Name
  cakeName: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },

  // Meta Row (Rating & Discount)
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#b45309', fontSize: 12 },
  discountBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // Price Row
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 15 },
  finalPrice: { fontSize: 28, fontWeight: 'bold', color: THEME_COLOR },
  originalPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through', marginLeft: 10 },

  statusText: { color: '#ef4444', fontWeight: '600', marginBottom: 15 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 15, marginBottom: 8 },
  descText: { fontSize: 15, color: '#4b5563', lineHeight: 24 },

  // Size Variants
  section: { marginTop: 10 },
  sizeBadge: { 
    minWidth: 60, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', 
    justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#f9fafb', paddingHorizontal: 10
  },
  sizeBadgeSelected: { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR },
  sizeText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  sizeTextSelected: { color: '#fff' },

  // Quantity
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, color: '#111827' },

  bottomBar: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  mainButton: { 
    backgroundColor: THEME_COLOR, borderRadius: 16, height: 56, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: THEME_COLOR, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  disabledButton: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});