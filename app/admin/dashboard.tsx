import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Cake } from '../../src/models/cake.model';
import { getCakes } from '../../src/controllers/admin/cake.controller';
import { useCallback, useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();

  // 2. State lưu dữ liệu
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 3. Hàm lấy dữ liệu
  const fetchData = async () => {
    try {
      const data = await getCakes();
      setCakes(data);
    } catch (error) {
      console.error("Lỗi lấy data dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 4. Gọi hàm khi màn hình mở lên
  useEffect(() => {
    fetchData();
  }, []);

  // 5. Hàm xử lý khi kéo xuống để reload
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);
 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.title}>Cake Management</Text>
        </View>
        <View style={styles.logoContainer}>
          <ChefHat size={32} color="#d97706" />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cakes..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
                <Text style={styles.statValue}>{loading ? "..." : cakes.length}</Text> 
                <Text style={styles.statLabel}>Total Cakes</Text>
             </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$850</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Cakes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color="#d97706" style={{marginTop: 20}} />
        ) : (
           <View style={styles.cakeGrid}>
             {/* Dữ liệu thật đã được format khớp với code dưới đây */}
             {cakes.map((cake) => (
               <TouchableOpacity key={cake.id} style={styles.cakeCard}>
                 {/* Giữ nguyên logic hiển thị ảnh cũ */}
                 <Image source={{ uri: typeof cake.images === 'string' ? cake.images : cake.images[0] }} style={styles.cakeImage} />
                 
                 <View style={styles.cakeInfo}>
                   <Text style={styles.cakeName}>{cake.name}</Text>
                   <Text style={styles.cakeCategory}>{cake.category}</Text>
                   <View style={styles.cakeFooter}>
                     <Text style={styles.cakePrice}>${cake.price}</Text>
                     
                     {/* Giữ nguyên logic UI check status */}
                     <View style={[styles.statusBadge, cake.status === 'Low Stock' && styles.statusBadgeWarning]}>
                       <Text style={[styles.statusText, cake.status === 'Low Stock' && styles.statusTextWarning]}>
                         {cake.status}
                       </Text>
                     </View>
                   </View>
                 </View>
               </TouchableOpacity>
             ))}
           </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/admin/AddCakeScreen')} 
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
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
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '600',
  },
  cakeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 80,
  },
  cakeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cakeImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  cakeInfo: {
    padding: 12,
  },
  cakeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cakeCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  cakeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cakePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d97706',
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeWarning: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  statusTextWarning: {
    color: '#d97706',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
