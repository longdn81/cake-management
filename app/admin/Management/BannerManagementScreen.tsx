import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Trash2, Edit } from 'lucide-react-native';

import { getBanners, deleteBanner } from '../../../src/controllers/admin/banner.controller';
import BannerModal from '../../../src/views/components/modals/BannerModal';

export default function BannerManagementScreen() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData() }, []));

  const handleDelete = (id: string) => {
    Alert.alert("Confirm Delete", "Delete this banner?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteBanner(id); fetchData(); } }
    ]);
  };

  const openEditModal = (banner: any) => {
    setSelectedBanner(banner);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.overlay}>
         <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDiscount}>{item.discount}</Text>
         </View>
         <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Edit size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
            <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Banners</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <BannerModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        banner={selectedBanner}
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

  card: { height: 160, borderRadius: 12, marginBottom: 16, overflow: 'hidden', position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  
  textContainer: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardDiscount: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  actions: { flexDirection: 'column', gap: 10, alignSelf: 'flex-start' },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: '#fff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
});