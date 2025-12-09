import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, LayoutDashboard, ShoppingBag } from 'lucide-react-native';

// Import Controller
import { loginUser } from '../../src/controllers/auth.controller';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal Admin Choice State
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    

    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter email and password");
      return;
    }
    

    setLoading(true);
    try {
      // 1. Gọi hàm đăng nhập
      const user = await loginUser(email, password);
      
      console.log("Logged in user role:", user.role);

      // 2. Kiểm tra Role
      if (user.role === 'admin') {
        // Nếu là Admin -> Hiện Modal chọn
        setModalVisible(true);
      } else {
        // Nếu là Client -> Vào thẳng trang mua hàng
        router.replace('/client/home');
      }

    } catch (error: any) {
      Alert.alert("Login Failed", "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Điều hướng cho Admin
  const navigateTo = (path: string) => {
    setModalVisible(false);
    // @ts-ignore
    router.replace(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.contentContainer}>
          
          {/* Logo / Title Area */}
          <View style={styles.headerSection}>
            <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' }} // Ví dụ icon bánh
                style={{ width: 80, height: 80, marginBottom: 10 }}
            />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue to Bakery App</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Register Link (Tạm thời trỏ đến trang AddUser của Admin để test hoặc trang đăng ký riêng) */}
            <View style={styles.registerRow}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/RegisterScreen')}>
                    <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>

      {/* --- MODAL CHỌN QUYỀN (CHỈ HIỆN CHO ADMIN) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hello Admin! 👋</Text>
            <Text style={styles.modalSubtitle}>Where do you want to go?</Text>

            <TouchableOpacity 
                style={[styles.modalBtn, styles.adminBtn]} 
                onPress={() => navigateTo('/admin/dashboard')}
            >
                <LayoutDashboard size={24} color="#fff" />
                <View style={{marginLeft: 10}}>
                    <Text style={styles.modalBtnTitle}>Admin Dashboard</Text>
                    <Text style={styles.modalBtnSub}>Manage products, orders...</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.modalBtn, styles.clientBtn]} 
                onPress={() => navigateTo('/client/home')}
            >
                <ShoppingBag size={24} color="#333" />
                <View style={{marginLeft: 10}}>
                    <Text style={[styles.modalBtnTitle, {color: '#333'}]}>Client Home</Text>
                    <Text style={styles.modalBtnSub}>Go shopping as user</Text>
                </View>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  
  headerSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 5 },

  formSection: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, height: 50, backgroundColor: '#f9fafb' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: '#d97706', fontWeight: '500' },

  loginBtn: { backgroundColor: '#d97706', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30, shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#6b7280', fontSize: 16 },
  registerLink: { color: '#d97706', fontSize: 16, fontWeight: 'bold' },

  // --- MODAL STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  
  modalBtn: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 16, borderRadius: 12, marginBottom: 12 },
  adminBtn: { backgroundColor: '#d97706' },
  clientBtn: { backgroundColor: '#f3f4f6' },
  
  modalBtnTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  modalBtnSub: { fontSize: 12, color: '#333' }
});