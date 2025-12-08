import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert
} from 'react-native';
import { X, Save, Camera, Upload } from 'lucide-react-native';

import { updateCategory } from '../../../controllers/admin/category.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../helper/uploadImage';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  category: any;             // Dữ liệu danh mục cần sửa
  onUpdateSuccess: () => void;
}

export default function CategoryModal({ visible, onClose, category, onUpdateSuccess }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [iconUri, setIconUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load dữ liệu cũ khi mở modal
  useEffect(() => {
    if (category) {
      setName(category.name);
      setIconUri(category.icon);
    }
  }, [category]);

  // Chọn icon mới
  const handleChangeIcon = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setIconUri(uri);
  };

  // Lưu thay đổi
  const handleSave = async () => {
    if (!category) return;
    if (!name) {
        Alert.alert("Error", "Category name is required");
        return;
    }
    
    setIsSaving(true);
    try {
      let finalIconUrl = category.icon;

      // Nếu người dùng chọn ảnh mới (file trên máy), upload lên Cloudinary
      if (iconUri && iconUri.startsWith('file://')) {
          finalIconUrl = await uploadToCloudinary(iconUri);
      }

      await updateCategory(category.id, {
        name: name,
        icon: finalIconUrl
      });
      
      Alert.alert("Success", "Category updated!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Icon Edit */}
            <View style={{alignItems: 'center', marginBottom: 20}}>
                <Text style={styles.label}>Category Icon</Text>
                <TouchableOpacity style={styles.iconContainer} onPress={handleChangeIcon}>
                    {iconUri ? (
                        <Image source={{ uri: iconUri }} style={styles.iconPreview} />
                    ) : (
                        <Upload size={24} color="#9ca3af" />
                    )}
                    <View style={styles.cameraIcon}>
                        <Camera size={14} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Name Input */}
            <Text style={styles.label}>Category Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : (
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                 </View>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, alignSelf: 'flex-start' },
  
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: '#e5e7eb' },
  iconPreview: { width: '100%', height: '100%', borderRadius: 40 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#d97706', padding: 6, borderRadius: 12 },

  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb', width: '100%' },
  
  saveButton: { backgroundColor: '#d97706', marginTop: 30, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});