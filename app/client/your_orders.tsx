import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { getUserOrders } from '../../src/controllers/cart.controller';
import ClientOrderModal from '../../src/views/components/modals/ClientOrderModal';

const THEME_COLOR = '#d97706';

export default function YourOrdersScreen() {
  const router = useRouter();
  const auth = getAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      if (!refreshing) setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const data = await getUserOrders(user.uid);
        setOrders(data);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchOrders(); }, []);

  const handlePressOrder = (order: any) => {
      setSelectedOrder(order);
      setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { color: '#d97706', bg: '#fffbeb', icon: Clock };
      case 'completed': return { color: '#059669', bg: '#d1fae5', icon: CheckCircle };
      case 'cancelled': return { color: '#dc2626', bg: '#fee2e2', icon: XCircle };
      default: return { color: '#6b7280', bg: '#f3f4f6', icon: Clock };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const { color, bg, icon: Icon } = getStatusColor(item.status);
    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePressOrder(item)}>
        <View style={styles.cardHeader}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Package size={18} color="#374151" style={{marginRight: 8}}/>
                <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: bg}]}>
                <Icon size={12} color={color} style={{marginRight: 4}}/>
                <Text style={[styles.statusText, {color: color}]}>{item.status}</Text>
            </View>
        </View>
        
        <View style={styles.cardBody}>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.itemCount}>{item.items.length} items</Text>
            <Text style={styles.totalPrice}>${item.totalPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Orders</Text>
        <View style={{width: 40}}/>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={THEME_COLOR} style={{marginTop: 20}} />
      ) : (
        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{padding: 20}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME_COLOR]} />}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 50}}>
                    <Text style={{color: '#999'}}>No orders found.</Text>
                </View>
            }
        />
      )}

      {/* Modal chỉnh sửa */}
      <ClientOrderModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
        onUpdateSuccess={fetchOrders}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  
  cardBody: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#6b7280', fontSize: 12 },
  itemCount: { color: '#374151', fontSize: 14 },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: THEME_COLOR },
});