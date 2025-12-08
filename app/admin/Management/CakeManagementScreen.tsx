import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Trash2, Edit } from 'lucide-react-native';

// Import Controller
import { getCakes, deleteCake } from '../../../src/controllers/admin/cake.controller';
import { getCategories } from '../../../src/controllers/admin/category.controller';

// Import Modal vừa tách
import CakeModal from '../../../src/views/components/modals/CakeModal';

export default function CakeManagementScreen() {
  const router = useRouter();
  const [cakes, setCakes] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any>(null);

  // 1. LẤY DỮ LIỆU
  const fetchData = async () => {
    try {
      setLoading(true);
      const [cakesData, catsData] = await Promise.all([
        getCakes(),
        getCategories()
      ]);

      const formattedCakes = cakesData.map(item => ({
        ...item,
        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150'
      }));

      setCakes(formattedCakes);
      setCategoriesList(catsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData() }, []));

  // 2. XỬ LÝ XÓA
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Confirm Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCake(id); fetchData(); } }
    ]);
  };

  // 3. MỞ MODAL EDIT
  const openEditModal = (cake: any) => {
    setSelectedCake(cake);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardPrice}>${item.price}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
          <Edit size={20} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id, item.name)}>
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Cakes</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={cakes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* --- GỌI COMPONENT MODAL --- */}
      <CakeModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        cake={selectedCake} 
        categories={categoriesList}
        onUpdateSuccess={() => {
            fetchData(); // Reload lại list sau khi save xong
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  listContent: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardCategory: { fontSize: 12, color: '#6b7280' },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#d97706', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
});