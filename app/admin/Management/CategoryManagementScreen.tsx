import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Trash2, Edit } from 'lucide-react-native';

import { getCategories, deleteCategory } from '../../../src/controllers/admin/category.controller';
import CategoryModal from '../../../src/views/components/modals/CategoryModal';

export default function CategoryManagementScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData() }, []));

  // 2. Delete
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Confirm Delete", `Delete category "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCategory(id); fetchData(); } }
    ]);
  };

  // 3. Edit (Open Modal)
  const openEditModal = (cat: any) => {
    setSelectedCategory(cat);
    setModalVisible(true);
  };

  // Render Item
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.iconBg}>
          <Image source={{ uri: item.icon }} style={styles.cardImage} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDate}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Categories</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal Edit */}
      <CategoryModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={selectedCategory}
        onUpdateSuccess={fetchData}
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
  iconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: 30, height: 30, resizeMode: 'contain' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
});