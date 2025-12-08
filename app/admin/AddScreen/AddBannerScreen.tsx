// app/admin/AddBannerScreen.tsx

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, Image, ActivityIndicator, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, X } from 'lucide-react-native';

// Import Model & Controller
import { Banner } from '../../../src/models/banner.model';
import { addBannerToFirestore } from '../../../src/controllers/admin/banner.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../src/helper/uploadImage';

export default function AddBannerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // State cho 2 trường mới
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');

  // 1. Chọn ảnh
  const handlePickImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setImageUri(uri);
  };

  // 2. Lưu Banner
  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select a banner image.');
      return;
    }
    if (!title || !discount) {
      Alert.alert('Missing Info', 'Please enter Title and Discount.');
      return;
    }

    setLoading(true);
    try {
      // B1: Upload ảnh
      const cloudUrl = await uploadToCloudinary(imageUri);

      // B2: Tạo Model Banner với Title và Discount
      const newBanner = new Banner(
        '', 
        cloudUrl, 
        title,     // <-- Truyền title
        discount   // <-- Truyền discount
      );

      // B3: Lưu Firestore
      await addBannerToFirestore(newBanner);

      Alert.alert('Success', 'Banner added successfully!', [
        { text: 'OK', onPress: () => {
            setTitle('');
            setDiscount('');
            setImageUri(null);
            router.back() }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add banner.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* --- 1. UPLOAD ẢNH --- */}
          <Text style={styles.label}>Banner Image</Text>
          <Text style={styles.subLabel}>Recommended: 1200x600 px</Text>
          <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholder}>
                <Upload size={40} color="#9ca3af" />
                <Text style={styles.placeholderText}>Tap to Upload</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* --- 2. NHẬP TITLE --- */}
          <Text style={styles.label}>Campaign Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Summer Sale, Black Friday..." 
            value={title}
            onChangeText={setTitle}
          />

          {/* --- 3. NHẬP DISCOUNT --- */}
          <Text style={styles.label}>Discount / Subtitle</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 40%, Up to 50% OFF..." 
            value={discount}
            onChangeText={setDiscount}
          />

          {/* --- 4. BUTTON SAVE --- */}
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Publish Banner</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 15 },
  subLabel: { fontSize: 12, color: '#6b7280', marginBottom: 10 },

  // Upload Styles
  uploadArea: {
    width: '100%', height: 160,
    backgroundColor: '#f9fafb', borderRadius: 12,
    borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 10, color: '#6b7280', fontWeight: '500' },

  // Input Styles (Mới thêm)
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff',
    color: '#111827'
  },

  // Button Styles
  saveBtn: {
    marginTop: 30, backgroundColor: '#d97706', paddingVertical: 16, 
    borderRadius: 12, alignItems: 'center',
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});