import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Minus, AlertTriangle, Edit2, Trash2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

// CONTROLLER & MODEL
import { getInventoryList, updateInventoryItem, deleteInventoryItem } from '../../src/controllers/admin/inventory.controller';
import { InventoryItem } from '../../src/models/inventory.model';

// MODAL
import AddInventoryModal from '../../src/views/components/modals/AddInventoryModal';

export default function InventoryScreen() {
  const router = useRouter();

  // --- STATE DỮ LIỆU ---
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // State Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchText, setSearchText] = useState('');

  // modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // --- STATE INLINE EDIT ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedQty, setEditedQty] = useState('');
  const [editedUnit, setEditedUnit] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [savingInline, setSavingInline] = useState(false);

  // --- HÀM TIỆN ÍCH ---
  const formatCategory = (str: string) => {
    if (!str || str.trim() === '') return 'General';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // --- 1. TẢI DỮ LIỆU ---
  const fetchInventory = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getInventoryList(); 
      setItems(data);
    } catch (err) {
      console.error('LỖI KHI TẢI DỮ LIỆU:', err);
      Alert.alert('Error', 'Failed to load inventory.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchInventory(); }, [fetchInventory]));
  const onRefresh = useCallback(() => { fetchInventory(); }, [fetchInventory]);

  // --- 2. TỰ ĐỘNG TRÍCH XUẤT CATEGORY ---
  const dynamicCategories = useMemo(() => {
    const allCats = items.map(i => i.category ? formatCategory(i.category) : 'General');
    return ["All", ...Array.from(new Set(allCats))];
  }, [items]);

  // --- 3. LOGIC LỌC DỮ LIỆU ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const itemCat = item.category ? formatCategory(item.category) : 'General';
      const matchCategory = selectedCategory === "All" || itemCat === selectedCategory;
      const lowerSearch = searchText.toLowerCase();
      const matchSearch = !searchText.trim() || 
        (item.ingredient || '').toLowerCase().includes(lowerSearch) ||
        (item.category || '').toLowerCase().includes(lowerSearch);
      return matchCategory && matchSearch;
    });
  }, [items, selectedCategory, searchText]);

  const handleCategoryPress = (category: string) => { setSelectedCategory(category); };

  // --- XỬ LÝ XÓA ITEM ---
  const handleDelete = (id: string, name: string) => {
    if (!id) return; // Bảo vệ nếu id rỗng
    Alert.alert(
      "Xóa nguyên liệu",
      `Bạn có chắc chắn muốn xóa "${name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInventoryItem(id);
              setItems(prevItems => prevItems.filter(item => item.id !== id));
            } catch (error) {
              console.error("Lỗi khi xóa:", error);
              Alert.alert("Lỗi", "Không thể xóa nguyên liệu này.");
            }
          }
        }
      ]
    );
  };

  // --- INLINE EDIT LOGIC ---
  const openInlineEdit = (item: InventoryItem) => {
    if (item.id) {
      setEditingId(item.id);
      setEditedName(item.ingredient ?? '');
      setEditedQty(String(item.quantity ?? '0'));
      setEditedUnit(item.unit ?? '');
      setEditedCategory(item.category ?? '');
    }
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditedName('');
    setEditedQty('');
    setEditedUnit('');
    setEditedCategory('');
  };

  const saveInlineEdit = async (id: string) => {
    if (!id) return; // [FIX]: Check ID tồn tại
    if (!editedName.trim()) { Alert.alert('Missing', 'Name required'); return; }
    if (!editedQty.trim()) { Alert.alert('Missing', 'Quantity required'); return; }
    const parsed = Number(editedQty);
    if (isNaN(parsed) || parsed < 0) { Alert.alert('Invalid', 'Quantity must be non-negative number'); return; }
    if (!editedUnit.trim()) { Alert.alert('Missing', 'Unit required'); return; }

    const finalCat = formatCategory(editedCategory.trim());

    setSavingInline(true);
    try {
      const updateData = { ingredient: editedName.trim(), quantity: parsed, unit: editedUnit.trim(), category: finalCat, lowStock: parsed < 5 };
      await updateInventoryItem(id, updateData);

      // optimistic update locally
      setItems(prev => prev.map(it => it.id === id ? new InventoryItem(it.id, updateData.ingredient, updateData.quantity, updateData.unit, updateData.category, updateData.lowStock, it.createdAt) : it));

      cancelInlineEdit();
    } catch (err) {
      console.error('Inline update failed', err);
      Alert.alert('Error', 'Failed to update item.');
      fetchInventory();
    } finally {
      setSavingInline(false);
    }
  };

  const handleUpdateStock = async (id: string, currentQty: number, change: number) => {
    if (!id) return; // [FIX]: Check ID tồn tại
    const newQty = currentQty + change;
    if (newQty < 0) return;

    setItems(prev => prev.map(it => it.id === id ? new InventoryItem(it.id, it.ingredient, newQty, it.unit, it.category, newQty < 5, it.createdAt) : it));
    try {
      await updateInventoryItem(id, { quantity: newQty, lowStock: newQty < 5 });
    } catch (err) {
      console.error('Update stock failed', err);
      fetchInventory();
    }
  };

  const lowStockCount = items.filter(i => i.lowStock).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* BANNER */}
      {lowStockCount > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={20} color="#d97706" />
          <Text style={styles.alertText}>{lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock</Text>
        </View>
      )}

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ingredients..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* FILTER CHIPS */}
      <View style={{ height: 60 }}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {dynamicCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => handleCategoryPress(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingList} onRefresh={onRefresh} />}
      >
        {loadingList && items.length === 0 ? (
          <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 20 }} />
        ) : (
          <>
            {filteredItems.length === 0 && !loadingList && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#6b7280' }}>
                  {selectedCategory !== "All"
                    ? `No items found in "${selectedCategory}".`
                    : "Inventory is empty."}
                </Text>
              </View>
            )}
            {filteredItems.map(item => (
              <View key={item.id} style={styles.inventoryCard}>
                <View style={styles.inventoryHeader}>
                  <View style={styles.inventoryInfo}>
                    {editingId === item.id ? (
                      <>
                        <TextInput value={editedName} onChangeText={setEditedName} style={[styles.input, { fontSize: 16, marginBottom: 4 }]} placeholder="Name" />
                        <TextInput value={editedCategory} onChangeText={setEditedCategory} style={styles.input} placeholder="Category" />
                      </>
                    ) : (
                      <>
                        <Text style={styles.ingredientName}>{item.ingredient}</Text>
                        <Text style={styles.category}>{item.category}</Text>
                      </>
                    )}
                  </View>

                  {/* ACTION BUTTONS (EDIT & DELETE) */}
                  {editingId === item.id ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.inlineBtn} onPress={() => saveInlineEdit(item.id || '')} disabled={savingInline}>
                        <Text style={styles.inlineBtnText}>{savingInline ? 'Saving...' : 'Save'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineCancel} onPress={cancelInlineEdit}>
                        <Text style={styles.inlineCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {/* [FIX]: Thêm || '' để tránh lỗi undefined */}
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id || '', item.ingredient || '')}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.editButton} onPress={() => openInlineEdit(item)}>
                        <Edit2 size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.quantityContainer}>
                  <View style={styles.quantityInfo}>
                    {editingId === item.id ? (
                      <>
                        <TextInput value={editedQty} onChangeText={setEditedQty} style={[styles.input, { width: 80 }]} keyboardType="numeric" placeholder="Qty" />
                        <TextInput value={editedUnit} onChangeText={setEditedUnit} style={[styles.input, { width: 80, marginLeft: 8 }]} placeholder="Unit" />
                      </>
                    ) : (
                      <>
                        <Text style={[styles.quantity, item.lowStock && styles.quantityLow]}>{item.quantity}</Text>
                        <Text style={styles.unit}>{item.unit}</Text>
                      </>
                    )}
                  </View>

                  {item.lowStock && (
                    <View style={styles.lowStockBadge}>
                      <AlertTriangle size={12} color="#d97706" />
                      <Text style={styles.lowStockText}>Low Stock</Text>
                    </View>
                  )}
                </View>

                {editingId !== item.id && (
                  <View style={styles.actionButtons}>
                    {/* [FIX]: Thêm || '' để tránh lỗi undefined */}
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateStock(item.id || '', item.quantity || 0, -1)} disabled={(item.quantity || 0) <= 0}>
                      <Minus size={16} color="#dc2626" />
                    </TouchableOpacity>
                    <View style={styles.quantityDisplay}>
                      <Text style={styles.quantityDisplayText}>Stock Level</Text>
                    </View>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateStock(item.id || '', item.quantity || 0, 1)}>
                      <Plus size={16} color="#059669" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* USE THE SEPARATE MODAL COMPONENT */}
      <AddInventoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchInventory} // Refresh list when item is added
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  addButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#d97706', justifyContent: 'center', alignItems: 'center' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  alertText: { fontSize: 14, color: '#92400e', fontWeight: '600' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: '#111827' },
  filterContainer: { marginTop: 12, marginBottom: 8, flexGrow: 0, height: 50 },
  filterContentContainer: { paddingHorizontal: 20, alignItems: 'center' },
  filterChip: { paddingVertical: 8, paddingHorizontal: 20, marginRight: 10, borderRadius: 25, backgroundColor: "#F3F4F6", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "#F3F4F6" },
  filterChipActive: { backgroundColor: "#d97706", borderColor: "#d97706", shadowColor: "#d97706", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  filterChipText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
  filterChipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 4 },
  inventoryCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  inventoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  inventoryInfo: { flex: 1 },
  ingredientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  category: { fontSize: 12, color: '#6b7280' },
  
  // Nút Sửa (Edit)
  editButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  // Nút Xóa (Delete)
  deleteButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  
  inlineBtn: { backgroundColor: '#059669', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  inlineBtnText: { color: '#fff', fontWeight: '600' },
  inlineCancel: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  inlineCancelText: { color: '#6b7280' },
  quantityContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  quantityInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  quantity: { fontSize: 32, fontWeight: '700', color: '#111827' },
  quantityLow: { color: '#dc2626' },
  unit: { fontSize: 16, color: '#6b7280' },
  lowStockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  lowStockText: { fontSize: 12, fontWeight: '600', color: '#d97706' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  quantityButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  quantityDisplay: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  quantityDisplayText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#111827' },
});