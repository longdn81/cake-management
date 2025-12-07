import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ChefHat } from 'lucide-react-native';

export default function HomeScreen() {
  const cakes = [
    {
      id: 1,
      name: 'Chocolate Delight',
      price: 45.00,
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
      category: 'Chocolate',
      status: 'Available'
    },
    {
      id: 2,
      name: 'Strawberry Dream',
      price: 38.00,
      image: 'https://images.pexels.com/photos/1120970/pexels-photo-1120970.jpeg',
      category: 'Fruit',
      status: 'Available'
    },
    {
      id: 3,
      name: 'Vanilla Classic',
      price: 35.00,
      image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg',
      category: 'Classic',
      status: 'Low Stock'
    },
    {
      id: 4,
      name: 'Red Velvet',
      price: 42.00,
      image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg',
      category: 'Special',
      status: 'Available'
    },
  ];

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
            <Text style={styles.statValue}>24</Text>
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

        <View style={styles.cakeGrid}>
          {cakes.map((cake) => (
            <TouchableOpacity key={cake.id} style={styles.cakeCard}>
              <Image source={{ uri: cake.image }} style={styles.cakeImage} />
              <View style={styles.cakeInfo}>
                <Text style={styles.cakeName}>{cake.name}</Text>
                <Text style={styles.cakeCategory}>{cake.category}</Text>
                <View style={styles.cakeFooter}>
                  <Text style={styles.cakePrice}>${cake.price.toFixed(2)}</Text>
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
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
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
