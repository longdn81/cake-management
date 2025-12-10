// src/views/components/modals/OrderModal.tsx
import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, ScrollView, Alert 
} from 'react-native';
import { X, MapPin, Phone, User, CheckCircle, Package } from 'lucide-react-native';
import { Order } from '../../../models/order.model';
import { createOrder } from '../../../controllers/cart.controller';
import { useRouter } from 'expo-router';

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  userInfo: any;
  cartItems: any[];
  totalPrice: number;
}

const THEME_COLOR = '#d97706';

export default function OrderModal({ visible, onClose, userInfo, cartItems, totalPrice }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      // 1. Tạo đơn hàng mới
      const newOrder = new Order(
        '', // ID tự sinh
        userInfo.id,
        userInfo.name || "Unknown",
        userInfo.phone || "No Phone",
        userInfo.address || "No Address",
        cartItems,
        totalPrice,
        'pending', // Status ban đầu
        Date.now()
      );

      // 2. Gửi lên Firebase (Hàm này sẽ tự xóa Cart sau khi tạo Order)
      await createOrder(newOrder);

      // 3. Thông báo thành công
      Alert.alert("Success", "Your order has been placed successfully!", [
        { 
            text: "OK", 
            onPress: () => {
                onClose(); // Đóng modal
                router.replace('/client/home'); // Về trang chủ
            }
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Order</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* THÔNG TIN KHÁCH HÀNG */}
            <Text style={styles.sectionTitle}>Customer Info</Text>
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <User size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{userInfo?.name || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Phone size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{userInfo?.phone || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MapPin size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{userInfo?.address || "N/A"}</Text>
                </View>
            </View>

            {/* DANH SÁCH BÁNH */}
            <Text style={styles.sectionTitle}>Order Items</Text>
            <View style={styles.infoBox}>
                {cartItems.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemVariant}>x{item.quantity} ({item.variant?.label || 'Std'})</Text>
                        </View>
                        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
                
                <View style={styles.divider} />
                
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payment</Text>
                    <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                </View>
            </View>

            {/* NÚT XÁC NHẬN */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmOrder} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff"/> : (
                    <>
                        <Package size={20} color="#fff" style={{marginRight: 8}} />
                        <Text style={styles.confirmText}>Place Order</Text>
                    </>
                )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '75%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 15, marginBottom: 10 },
  infoBox: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 15, color: '#374151' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 15, color: '#111827', fontWeight: '500' },
  itemVariant: { fontSize: 13, color: '#6b7280' },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: THEME_COLOR },

  confirmBtn: { flexDirection: 'row', backgroundColor: THEME_COLOR, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 20 },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});