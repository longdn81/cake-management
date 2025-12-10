import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CheckCircle, XCircle, Edit } from 'lucide-react-native'; // Thêm icon Edit
import { useFocusEffect } from 'expo-router';

// Import Controller
import { getOrders } from '../../src/controllers/admin/order.controller';
import { Order } from '../../src/models/order.model';

// [MỚI] Import Modal
import OrderEditModal from '../../src/views/components/modals/OrderEditModal';

const THEME_COLOR = '#d97706';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'pending' | 'completed'>('All');

  // [MỚI] State cho Modal Edit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrdersData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getOrders();
      setOrders(data);
      filterOrders(data, activeTab);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrdersData(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrdersData();
  }, []);

  const filterOrders = (data: Order[], tab: string) => {
    if (tab === 'All') {
      setFilteredOrders(data);
    } else {
      setFilteredOrders(data.filter(o => o.status === tab));
    }
  };

  const handleTabChange = (tab: 'All' | 'pending' | 'completed') => {
    setActiveTab(tab);
    filterOrders(orders, tab);
  };

  // [MỚI] Hàm mở modal edit
  const handleEditPress = (order: Order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#d97706', icon: Clock };
      case 'completed': return { bg: '#d1fae5', text: '#059669', icon: CheckCircle };
      case 'cancelled': return { bg: '#fee2e2', text: '#dc2626', icon: XCircle };
      default: return { bg: '#f3f4f6', text: '#6b7280', icon: Clock };
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
      </View>

      <View style={styles.tabsContainer}>
        {['All', 'pending', 'completed'].map((tab) => (
            <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => handleTabChange(tab as any)}
            >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
            </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME_COLOR]} />}
      >
        {loading && !refreshing ? (
            <ActivityIndicator size="large" color={THEME_COLOR} style={{marginTop: 20}} />
        ) : (
            <>
                {filteredOrders.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={{color: '#999'}}>No orders found.</Text>
                    </View>
                ) : (
                    filteredOrders.map((order) => {
                        const statusStyle = getStatusColor(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <View key={order.id} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View>
                                        <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                                        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                                    </View>
                                    
                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <StatusIcon size={12} color={statusStyle.text} />
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Text>
                                        </View>

                                        {/* [MỚI] NÚT EDIT Ở GÓC PHẢI */}
                                        <TouchableOpacity 
                                            style={styles.editBtn} 
                                            onPress={() => handleEditPress(order)}
                                        >
                                            <Edit size={18} color="#6b7280" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.orderBody}>
                                    <View style={styles.orderRow}>
                                        <Text style={styles.label}>Customer:</Text>
                                        <Text style={styles.value}>{order.userName}</Text>
                                    </View>
                                    <View style={styles.orderRow}>
                                        <Text style={styles.label}>Phone:</Text>
                                        <Text style={styles.value}>{order.userPhone}</Text>
                                    </View>
                                    <View style={styles.orderRow}>
                                        <Text style={styles.label}>Address:</Text>
                                        <Text style={[styles.value, {flex: 1, textAlign: 'right', fontSize: 13}]} numberOfLines={2}>
                                            {order.userAddress}
                                        </Text>
                                    </View>
                                    
                                    {/* Danh sách items */}
                                    <View style={[styles.orderRow, {alignItems: 'flex-start', marginTop: 5}]}>
                                        <Text style={styles.label}>Items:</Text>
                                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                                            {order.items.map((item: any, idx: number) => (
                                                <Text key={idx} style={styles.itemText}>
                                                    {item.quantity}x {item.name}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={[styles.orderRow, {marginTop: 5}]}>
                                        <Text style={styles.label}>Total:</Text>
                                        <Text style={styles.priceValue}>${order.totalPrice.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </>
        )}
        <View style={{height: 50}} />
      </ScrollView>

      {/* [MỚI] Gọi Modal Edit */}
      <OrderEditModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        order={selectedOrder}
        onUpdateSuccess={() => fetchOrdersData()} // Reload data sau khi sửa
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: THEME_COLOR },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#ffffff' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  center: { alignItems: 'center', marginTop: 50 },

  orderCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  // Style nút Edit nhỏ
  editBtn: { padding: 6, backgroundColor: '#f3f4f6', borderRadius: 8 },

  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  
  orderBody: { gap: 8 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemText: { fontSize: 14, color: '#374151', textAlign: 'right' },
  priceValue: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
});