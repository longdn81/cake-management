import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Minus, AlertTriangle, Edit2 } from 'lucide-react-native';

export default function InventoryScreen() {
  const inventory = [
    {
      id: 1,
      ingredient: 'All-Purpose Flour',
      quantity: 25,
      unit: 'kg',
      lowStock: false,
      category: 'Baking',
    },
    {
      id: 2,
      ingredient: 'Granulated Sugar',
      quantity: 18,
      unit: 'kg',
      lowStock: false,
      category: 'Baking',
    },
    {
      id: 3,
      ingredient: 'Cocoa Powder',
      quantity: 3,
      unit: 'kg',
      lowStock: true,
      category: 'Flavoring',
    },
    {
      id: 4,
      ingredient: 'Fresh Eggs',
      quantity: 120,
      unit: 'pcs',
      lowStock: false,
      category: 'Dairy',
    },
    {
      id: 5,
      ingredient: 'Butter',
      quantity: 2,
      unit: 'kg',
      lowStock: true,
      category: 'Dairy',
    },
    {
      id: 6,
      ingredient: 'Vanilla Extract',
      quantity: 8,
      unit: 'bottles',
      lowStock: false,
      category: 'Flavoring',
    },
    {
      id: 7,
      ingredient: 'Heavy Cream',
      quantity: 5,
      unit: 'liters',
      lowStock: false,
      category: 'Dairy',
    },
    {
      id: 8,
      ingredient: 'Strawberries',
      quantity: 1,
      unit: 'kg',
      lowStock: true,
      category: 'Fruit',
    },
  ];

  const lowStockCount = inventory.filter(item => item.lowStock).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {lowStockCount > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={20} color="#d97706" />
          <Text style={styles.alertText}>
            {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ingredients..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Baking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Dairy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Flavoring</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {inventory.map((item) => (
          <View key={item.id} style={styles.inventoryCard}>
            <View style={styles.inventoryHeader}>
              <View style={styles.inventoryInfo}>
                <Text style={styles.ingredientName}>{item.ingredient}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Edit2 size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.quantityContainer}>
              <View style={styles.quantityInfo}>
                <Text style={[
                  styles.quantity,
                  item.lowStock && styles.quantityLow
                ]}>
                  {item.quantity}
                </Text>
                <Text style={styles.unit}>{item.unit}</Text>
              </View>

              {item.lowStock && (
                <View style={styles.lowStockBadge}>
                  <AlertTriangle size={12} color="#d97706" />
                  <Text style={styles.lowStockText}>Low Stock</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.quantityButton}>
                <Minus size={16} color="#dc2626" />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityDisplayText}>Stock Level</Text>
              </View>
              <TouchableOpacity style={styles.quantityButton}>
                <Plus size={16} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  alertText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inventoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inventoryInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6b7280',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  quantity: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  quantityLow: {
    color: '#dc2626',
  },
  unit: {
    fontSize: 16,
    color: '#6b7280',
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
