import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, Alert, ActivityIndicator, TextInput, StatusBar 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Trash2, Edit, Search, Plus, Layers, Package } from 'lucide-react-native';

// Import Controller
import { getCakes, deleteCake } from '../../../src/controllers/admin/cake.controller';
import { getCategories } from '../../../src/controllers/admin/category.controller';

// Import Modal
import CakeModal from '../../../src/views/components/modals/CakeModal';

const THEME_COLOR = '#d97706';

export default function CakeManagementScreen() {
  const router = useRouter();
  
  // Data State
  const [cakes, setCakes] = useState<any[]>([]);
  const [filteredCakes, setFilteredCakes] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any>(null);

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const [cakesData, catsData] = await Promise.all([
        getCakes(),
        getCategories()
      ]);

      // Xử lý dữ liệu hiển thị
      const formattedCakes = cakesData.map(item => ({
        ...item,
        // Lấy ảnh đầu tiên hoặc ảnh placeholder
        thumbnail: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
        // Tính giá hiển thị (nếu có variants thì lấy giá variant đầu tiên hoặc min)
        displayPrice: (item.variants && item.variants.length > 0) 
            ? item.variants[0].price 
            : item.price
      }));

      setCakes(formattedCakes);
      setFilteredCakes(formattedCakes); // Init filter
      setCategoriesList(catsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData() }, []));

  // 2. SEARCH LOGIC
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = cakes.filter(item => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredCakes(newData);
    } else {
      setFilteredCakes(cakes);
    }
  };

  // 3. DELETE LOGIC
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Xác nhận xoá", `Bạn có chắc muốn xoá "${name}" không?`, [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: async () => { await deleteCake(id); fetchData(); } }
    ]);
  };

  // 4. EDIT LOGIC
  const openEditModal = (cake: any) => {
    setSelectedCake(cake);
    setModalVisible(true);
  };

  // --- RENDER ITEM ---
  const renderItem = ({ item }: { item: any }) => {
    const isOutOfStock = item.stock <= 0 && item.status !== 'Available';
    const hasDiscount = item.discount > 0;
    const variantCount = item.variants ? item.variants.length : 0;

    return (
      <View style={styles.card}>
        {/* Left: Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.thumbnail }} style={styles.cardImage} />
          {hasDiscount && (
             <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
             </View>
          )}
        </View>

        {/* Middle: Info */}
        <View style={styles.cardInfo}>
          <View style={styles.rowBetween}>
             <Text style={styles.cardCategory}>{item.category}</Text>
             {/* Stock Status Dot */}
             <View style={[styles.statusDot, { backgroundColor: isOutOfStock ? '#ef4444' : '#10b981' }]} />
          </View>
          
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>${item.displayPrice}</Text>
            {/* Nếu có nhiều size thì hiện icon layer */}
            {variantCount > 0 && (
                <View style={styles.variantBadge}>
                    <Layers size={12} color="#6b7280" />
                    <Text style={styles.variantText}>{variantCount} sizes</Text>
                </View>
            )}
          </View>
          
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditModal(item)}>
            <Edit size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id, item.name)}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý Bánh</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
         <View style={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm kiếm bánh..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#9ca3af"
            />
         </View>
      </View>

      {/* CONTENT LIST */}
      {loading ? (
        <View style={styles.centerLoading}>
           <ActivityIndicator size="large" color={THEME_COLOR} />
           <Text style={{marginTop: 10, color: '#6b7280'}}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCakes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
             <View style={styles.emptyContainer}>
                 <Package size={64} color="#e5e7eb" />
                 <Text style={styles.emptyText}>Không tìm thấy bánh nào</Text>
             </View>
          }
        />
      )}

      {/* FLOATING ACTION BUTTON (Add New) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/admin/AddScreen/AddCakeScreen')} // Đảm bảo đường dẫn này đúng
        activeOpacity={0.8}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <CakeModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        cake={selectedCake} 
        categories={categoriesList}
        onUpdateSuccess={() => {
            fetchData();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  backBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  // Search
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, paddingBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 46 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111827' },

  // List
  listContent: { padding: 16, paddingBottom: 100 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Card
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  
  // Card Image
  imageWrapper: { position: 'relative' },
  cardImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  discountBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderTopLeftRadius: 12, borderBottomRightRadius: 8 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Card Info
  cardInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCategory: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginVertical: 4 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: THEME_COLOR },
  variantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  variantText: { fontSize: 10, color: '#6b7280', marginLeft: 4 },
  
  stockText: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  // Actions
  actions: { justifyContent: 'space-between', paddingLeft: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#3b82f6', marginBottom: 8 }, // Xanh dương
  deleteBtn: { backgroundColor: '#fee2e2' }, // Đỏ nhạt

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9ca3af', marginTop: 10, fontSize: 16 },

  // FAB (Floating Action Button)
  fab: {
    position: 'absolute', bottom: 30, right: 20,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8
  }
});