import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Minus, AlertTriangle, Edit2, X } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

// CONTROLLER & MODEL (đường dẫn giữ nguyên như bạn gửi)
import { getInventoryList, updateInventoryItem, addInventoryToFirestore } from '../../src/controllers/admin/inventory.controller';
import { InventoryItem } from '../../src/models/inventory.model';

export default function InventoryScreen() {
  const router = useRouter();

  // list
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // search
  const [searchText, setSearchText] = useState('');

  // modal add
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // add form
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');

  // inline edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedQty, setEditedQty] = useState('');
  const [editedUnit, setEditedUnit] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [savingInline, setSavingInline] = useState(false);

  // fetch
  const fetchInventory = async () => {
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
  };

  useFocusEffect(useCallback(() => { fetchInventory(); }, []));

  // filter
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    const lower = searchText.toLowerCase();
    return items.filter(i =>
      (i.ingredient || '').toLowerCase().includes(lower) ||
      (i.category || '').toLowerCase().includes(lower) ||
      (i.unit || '').toLowerCase().includes(lower)
    );
  }, [items, searchText]);

  // ADD (unchanged from yours)
  const handleSave = async () => {
    if (!ingredientName.trim()) { Alert.alert('Missing Info', 'Please enter ingredient name.'); return; }
    if (!quantity.trim()) { Alert.alert('Missing Info', 'Please enter quantity.'); return; }
    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty < 0) { Alert.alert('Invalid Quantity', 'Quantity must be a valid number.'); return; }
    if (!unit.trim()) { Alert.alert('Missing Info', 'Please enter unit.'); return; }

    const finalCategory = category.trim() === '' ? 'General' : category.trim();
    setLoadingAdd(true);
    try {
      const newItem = new InventoryItem('', ingredientName.trim(), parsedQty, unit.trim(), finalCategory, parsedQty < 5);
      await addInventoryToFirestore(newItem);
      Alert.alert('Success', 'Item added successfully!', [{ text: 'OK', onPress: () => { setModalVisible(false); resetForm(); fetchInventory(); } }]);
    } catch (error: any) {
      console.error('❌ FIRESTORE ERROR:', error);
      Alert.alert('Error', error.message || 'Failed to add item.');
    }
    setLoadingAdd(false);
  };

  const resetForm = () => {
    setIngredientName('');
    setQuantity('');
    setUnit('');
    setCategory('');
  };

  // inline edit open
  const openInlineEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditedName(item.ingredient ?? '');
    setEditedQty(String(item.quantity ?? '0'));
    setEditedUnit(item.unit ?? '');
    setEditedCategory(item.category ?? '');
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditedName('');
    setEditedQty('');
    setEditedUnit('');
    setEditedCategory('');
  };

  // inline save
  const saveInlineEdit = async (id: string) => {
    if (!editedName.trim()) { Alert.alert('Missing', 'Name required'); return; }
    if (!editedQty.trim()) { Alert.alert('Missing', 'Quantity required'); return; }
    const parsed = Number(editedQty);
    if (isNaN(parsed) || parsed < 0) { Alert.alert('Invalid', 'Quantity must be non-negative number'); return; }
    if (!editedUnit.trim()) { Alert.alert('Missing', 'Unit required'); return; }

    setSavingInline(true);
    try {
      const updateData = { ingredient: editedName.trim(), quantity: parsed, unit: editedUnit.trim(), category: editedCategory.trim() || 'General', lowStock: parsed < 5 };
      await updateInventoryItem(id, updateData);

      // optimistic update locally
      setItems(prev => prev.map(it => it.id === id ? new InventoryItem(it.id, updateData.ingredient, updateData.quantity, updateData.unit, updateData.category, updateData.lowStock, it.createdAt) : it));

      cancelInlineEdit();
    } catch (err) {
      console.error('Inline update failed', err);
      Alert.alert('Error', 'Failed to update item.');
      // try refetch to recover
      fetchInventory();
    } finally {
      setSavingInline(false);
    }
  };

  // +/- stock (unchanged logic, still optimistic + persist)
  const handleUpdateStock = async (id: string, currentQty: number, change: number) => {
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
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* BANNER */}
      {lowStockCount > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={20} color="#d97706" />
          <Text style={styles.alertText}>{lowStockCount} item{lowStockCount>1 ? 's' : ''} running low on stock</Text>
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

      {/* LIST */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingList} onRefresh={fetchInventory} />}
      >
        {loadingList && items.length === 0 ? (
          <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 20 }} />
        ) : (
          <>
            {filteredItems.length === 0 && !loadingList && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#6b7280' }}>Kho hàng trống</Text>
              </View>
            )}
            {filteredItems.map(item => (
              <View key={item.id} style={styles.inventoryCard}>
                <View style={styles.inventoryHeader}>
                  <View style={styles.inventoryInfo}>
                    {/* Inline editing: if this card is being edited, show inputs */}
                    {editingId === item.id ? (
                      <>
                        <TextInput value={editedName} onChangeText={setEditedName} style={[styles.input, { fontSize: 16 }]} />
                        <Text style={styles.categoryLabel}>Category</Text>
                        <TextInput value={editedCategory} onChangeText={setEditedCategory} style={styles.input} />
                      </>
                    ) : (
                      <>
                        <Text style={styles.ingredientName}>{item.ingredient}</Text>
                        <Text style={styles.category}>{item.category}</Text>
                      </>
                    )}
                  </View>

                  {/* Edit / Save cancel buttons */}
                  {editingId === item.id ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.inlineBtn} onPress={() => saveInlineEdit(item.id)} disabled={savingInline}>
                        <Text style={styles.inlineBtnText}>{savingInline ? 'Saving...' : 'Save'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineCancel} onPress={cancelInlineEdit}>
                        <Text style={styles.inlineCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => openInlineEdit(item)}>
                      <Edit2 size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.quantityContainer}>
                  <View style={styles.quantityInfo}>
                    {editingId === item.id ? (
                      <>
                        <TextInput value={editedQty} onChangeText={setEditedQty} style={[styles.input, { width: 100 }]} keyboardType="numeric" />
                        <TextInput value={editedUnit} onChangeText={setEditedUnit} style={[styles.input, { width: 100, marginLeft: 8 }]} />
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

                {/* +/- and stock label */}
                {editingId === item.id ? null : (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateStock(item.id, item.quantity, -1)}>
                      <Minus size={16} color="#dc2626" />
                    </TouchableOpacity>
                    <View style={styles.quantityDisplay}>
                      <Text style={styles.quantityDisplayText}>Stock Level</Text>
                    </View>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateStock(item.id, item.quantity, 1)}>
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

      {/* ADD modal (unchanged) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.dragHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Ingredient</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} placeholder="e.g. All-Purpose Flour" value={ingredientName} onChangeText={setIngredientName} />

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Unit</Text>
                    <TextInput style={styles.input} placeholder="kg, pcs" value={unit} onChangeText={setUnit} />
                  </View>
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>Category</Text>
                <TextInput style={styles.input} placeholder="Baking, Dairy..." value={category} onChangeText={setCategory} />

                <TouchableOpacity style={[styles.saveBtn, loadingAdd && { opacity: 0.7 }]} onPress={handleSave} disabled={loadingAdd}>
                  {loadingAdd ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Ingredient</Text>}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// === Styles (kept similar to your original styles; added inline-edit btn styles)
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
  content: { flex: 1, paddingHorizontal: 20, marginTop: 16 },
  inventoryCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  inventoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  inventoryInfo: { flex: 1 },
  ingredientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  category: { fontSize: 12, color: '#6b7280' },
  categoryLabel: { fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 6 },
  editButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '65%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#111827'
  },
  saveBtn: {
    marginTop: 30, backgroundColor: '#d97706', paddingVertical: 16, 
    borderRadius: 12, alignItems: 'center',
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
