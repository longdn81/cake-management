import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react-native';

export default function OrdersScreen() {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Sarah Johnson',
      cake: 'Chocolate Delight',
      quantity: 1,
      price: 45.00,
      status: 'pending',
      date: '2025-12-01',
      time: '10:30 AM',
    },
    {
      id: 'ORD-002',
      customer: 'Mike Chen',
      cake: 'Strawberry Dream',
      quantity: 2,
      price: 76.00,
      status: 'completed',
      date: '2025-12-01',
      time: '09:15 AM',
    },
    {
      id: 'ORD-003',
      customer: 'Emma Wilson',
      cake: 'Red Velvet',
      quantity: 1,
      price: 42.00,
      status: 'pending',
      date: '2025-12-01',
      time: '11:45 AM',
    },
    {
      id: 'ORD-004',
      customer: 'James Brown',
      cake: 'Vanilla Classic',
      quantity: 3,
      price: 105.00,
      status: 'cancelled',
      date: '2025-11-30',
      time: '03:20 PM',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706', icon: Clock };
      case 'completed':
        return { bg: '#d1fae5', text: '#059669', icon: CheckCircle };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#dc2626', icon: XCircle };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', icon: Clock };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Calendar size={20} color="#d97706" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>All Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => {
          const statusStyle = getStatusColor(order.status);
          const StatusIcon = statusStyle.icon;

          return (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderDate}>{order.date} • {order.time}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <StatusIcon size={12} color={statusStyle.text} />
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderBody}>
                <View style={styles.orderInfo}>
                  <Text style={styles.label}>Customer</Text>
                  <Text style={styles.value}>{order.customer}</Text>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.label}>Item</Text>
                  <Text style={styles.value}>{order.cake}</Text>
                </View>
                <View style={styles.orderRow}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.label}>Quantity</Text>
                    <Text style={styles.value}>{order.quantity}x</Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.label}>Total</Text>
                    <Text style={styles.priceValue}>${order.price.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              {order.status === 'pending' && (
                <View style={styles.orderActions}>
                  <TouchableOpacity style={styles.actionButtonSecondary}>
                    <Text style={styles.actionButtonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonPrimary}>
                    <Text style={styles.actionButtonPrimaryText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  tabActive: {
    backgroundColor: '#d97706',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  orderBody: {
    gap: 12,
  },
  orderInfo: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d97706',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#d97706',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
