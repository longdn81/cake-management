// app/admin/AddScreen/AddCategoryScreen.tsx

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, Image, ActivityIndicator, Alert, TextInput, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, X } from 'lucide-react-native';

// Import Model & Controller & Utils
import { Category } from '../../../src/models/category.model';
import { addCategoryToFirestore } from '../../../src/controllers/admin/category.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../src/helper/uploadImage';

export default function AddCategoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State form
  const [name, setName] = useState('');
  const [iconUri, setIconUri] = useState<string | null>(null);

  // 1. Chọn icon
  const handlePickIcon = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setIconUri(uri);
  };

  // 2. Lưu Category
  const handleSave = async () => {
    if (!name) {
      Alert.alert('Missing Info', 'Please enter a category name.');
      return;
    }
    if (!iconUri) {
      Alert.alert('Missing Info', 'Please select an icon.');
      return;
    }

    setLoading(true);
    try {
      // B1: Upload ảnh icon lên Cloudinary
      const cloudUrl = await uploadToCloudinary(iconUri);

      // B2: Tạo Model Category
      const newCategory = new Category('', name, cloudUrl);

      // B3: Lưu Firestore
      await addCategoryToFirestore(newCategory);

      Alert.alert('Success', 'Category added successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
             // Reset form & Back
             setName('');
             setIconUri(null);
             router.back();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add category.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        

        <View style={styles.content}>
          
          {/* 1. ICON PICKER (Hình tròn nhỏ) */}
          <View style={styles.iconSection}>
            <Text style={styles.label}>Category Icon</Text>
            <TouchableOpacity style={styles.iconUpload} onPress={handlePickIcon}>
              {iconUri ? (
                <Image source={{ uri: iconUri }} style={styles.previewIcon} />
              ) : (
                <View style={styles.placeholder}>
                  <Upload size={24} color="#9ca3af" />
                  <Text style={styles.placeholderText}>Pick</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 2. NAME INPUT */}
          <Text style={styles.label}>Category Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Cupcake, Birthday..." 
            value={name}
            onChangeText={setName}
          />

          {/* 3. BUTTON SAVE */}
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Category</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
  
  // Icon Upload Style (Tròn)
  iconSection: { alignItems: 'center', marginBottom: 20 },
  iconUpload: {
    width: 100, height: 100, borderRadius: 50, // Hình tròn
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  previewIcon: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 4, color: '#6b7280', fontSize: 12 },

  // Input
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#111827'
  },

  // Button
  saveBtn: {
    marginTop: 30, backgroundColor: '#d97706', paddingVertical: 16, 
    borderRadius: 12, alignItems: 'center',
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});