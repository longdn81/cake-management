import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Moon, Lock, Package } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

// Firebase Imports
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { logoutUser } from '../../src/controllers/auth.controller';

// Import Modals (Tái sử dụng từ Admin)
import EditProfileModal from '../../src/views/components/modals/EditProfileModal';
import ChangePasswordModal from '../../src/views/components/modals/ChangePasswordModal';

export default function ClientProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  
  // State UI
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // State Data
  const [userInfo, setUserInfo] = useState<any>({});
  
  // State Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePassVisible, setChangePassVisible] = useState(false);

  // 1. Hàm lấy dữ liệu Profile
  const fetchProfileData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserInfo({ id: currentUser.uid, ...userDoc.data() });
        }
      }
    } catch (error) {
      console.error("Lỗi lấy data profile:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await logoutUser(); 
              router.replace('/auth/LoginScreen'); 
            } catch (error) {
              Alert.alert("Error", "Could not log out.");
            }
          } 
        }
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { 
            icon: User, 
            label: 'Personal Information', 
            hasArrow: true,
            onPress: () => setEditModalVisible(true) // Mở modal Edit
        },
        { 
            icon: Lock, 
            label: 'Change Password', 
            hasArrow: true,
            onPress: () => setChangePassVisible(true) // Mở modal Đổi Pass
        },
        { 
        icon: Package, 
        label: 'Your Orders', 
        hasArrow: true, 
        onPress: () => router.push('/client/your_orders') 
        },
        // { icon: CreditCard, label: 'Payment Methods', hasArrow: true }, // Tạm ẩn hoặc để làm sau
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          hasSwitch: true,
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          hasSwitch: true,
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', hasArrow: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card (Hiện thông tin thật) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {userInfo.avatarUrl ? (
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatarImage} />
                </View>
            ) : (
                <View style={styles.avatar}>
                    <User size={32} color="#d97706" />
                </View>
            )}
          </View>
          <Text style={styles.profileName}>{userInfo.name || "Client User"}</Text>
          <Text style={styles.profileEmail}>{userInfo.email || "client@example.com"}</Text>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item: any, itemIndex) => { 
                const Icon = item.icon;
                return (
                  <View key={itemIndex}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      disabled={item.hasSwitch}
                      onPress={item.onPress}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={styles.iconContainer}>
                          <Icon size={20} color="#6b7280" />
                        </View>
                        <Text style={styles.menuItemLabel}>{item.label}</Text>
                      </View>
                      {item.hasArrow && (
                        <ChevronRight size={20} color="#9ca3af" />
                      )}
                      {item.hasSwitch && (
                        <Switch
                          value={item.value}
                          onValueChange={item.onValueChange}
                          trackColor={{ false: '#e5e7eb', true: '#fbbf24' }}
                          thumbColor={item.value ? '#d97706' : '#f3f4f6'}
                        />
                      )}
                    </TouchableOpacity>
                    {itemIndex < section.items.length - 1 && (
                      <View style={styles.menuDivider} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>App Version 1.0.0</Text>
        <View style={{height: 20}} />
      </ScrollView>

      {/* --- GỌI CÁC MODAL --- */}
      <EditProfileModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={userInfo}
        onUpdateSuccess={() => fetchProfileData()}
      />

      <ChangePasswordModal 
        visible={changePassVisible}
        onClose={() => setChangePassVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb'
  },
  avatarImage: { width: '100%', height: '100%' },

  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 32,
  },
});