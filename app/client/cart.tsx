import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Image, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Trash2, Minus, Plus } from 'lucide-react-native';

// Firebase
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';

// Controller
import { updateUserCart } from '../../src/controllers/cart.controller';

// Modal
import OrderModal from '../../src/views/components/modals/OrderModal';

const THEME_COLOR = '#d97706';

export default function CartScreen() {
  const auth = getAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  // 1. Tải dữ liệu
  const fetchCartData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({ id: user.uid, ...data });
          setCartItems(data.cart || []);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchCartData(); }, [])
  );

  // 2. Tính tổng tiền tự động (Dùng useMemo để tối ưu)
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  // --- LOGIC XỬ LÝ CART ---

  // Hàm cập nhật lên Firebase (Gọi ngầm để UI mượt)
  const syncCartToFirebase = async (newCart: any[]) => {
    const user = auth.currentUser;
    if (user) {
      await updateUserCart(user.uid, newCart);
    }
  };

  const handleIncrease = (index: number) => {
    const newCart = [...cartItems];
    newCart[index].quantity += 1;
    setCartItems(newCart); // Cập nhật UI ngay
    syncCartToFirebase(newCart); // Đồng bộ Server sau
  };

  const handleDecrease = (index: number) => {
    const newCart = [...cartItems];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
      setCartItems(newCart);
      syncCartToFirebase(newCart);
    }
  };

  const handleRemove = (index: number) => {
    Alert.alert("Remove Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
          const newCart = [...cartItems];
          newCart.splice(index, 1); // Xóa phần tử tại index
          setCartItems(newCart);
          syncCartToFirebase(newCart);
      }}
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setOrderModalVisible(true);
  };

  // ------------------------

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
             <View>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemVariant}>
                    {item.variant ? item.variant.label : 'Standard'}
                </Text>
             </View>
             {/* Nút Xóa */}
             <TouchableOpacity onPress={() => handleRemove(index)}>
                 <Trash2 size={20} color="#ef4444" />
             </TouchableOpacity>
          </View>

          <View style={styles.itemBottomRow}>
              <Text style={styles.itemPrice}>${item.price}</Text>
              
              {/* Bộ điều khiển số lượng */}
              <View style={styles.qtyContainer}>
                  <TouchableOpacity onPress={() => handleDecrease(index)} style={styles.qtyBtn}>
                      <Minus size={16} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleIncrease(index)} style={styles.qtyBtn}>
                      <Plus size={16} color="#374151" />
                  </TouchableOpacity>
              </View>
          </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={THEME_COLOR} /></View>
      ) : (
        <FlatList
            data={cartItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{paddingBottom: 100}}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                </View>
            }
        />
      )}

      {/* Footer Checkout */}
      {cartItems.length > 0 && (
          <View style={styles.footer}>
              <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                  <Text style={styles.checkoutText}>Order Now</Text>
              </TouchableOpacity>
          </View>
      )}

      {/* Modal Order */}
      <OrderModal 
        visible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
        userInfo={userInfo}
        cartItems={cartItems}
        totalPrice={totalPrice}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  cartItem: { 
    flexDirection: 'row', padding: 12, backgroundColor: '#fff', 
    marginBottom: 12, marginHorizontal: 20, borderRadius: 16,
    shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  itemInfo: { marginLeft: 12, flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
  
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#111827', width: '80%' },
  itemVariant: { color: '#6b7280', fontSize: 13 },
  
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { color: THEME_COLOR, fontWeight: 'bold', fontSize: 16 },
  
  // Style nút tăng giảm
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
  qtyBtn: { backgroundColor: '#fff', borderRadius: 6, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  qtyText: { marginHorizontal: 12, fontWeight: 'bold', fontSize: 14, color: '#111827' },

  emptyText: { color: '#9ca3af', fontSize: 16 },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
    shadowColor: "#000", shadowOffset: {width: 0, height: -3}, shadowOpacity: 0.1, shadowRadius: 3, elevation: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: THEME_COLOR },
  checkoutBtn: { backgroundColor: THEME_COLOR, padding: 16, borderRadius: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});