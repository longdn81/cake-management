import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert, ScrollView
} from 'react-native';
import { X, Save, Camera, Upload } from 'lucide-react-native';

import { updateBanner } from '../../../controllers/admin/banner.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../helper/uploadImage';

interface BannerModalProps {
  visible: boolean;
  onClose: () => void;
  banner: any;             // Dữ liệu banner cần sửa
  onUpdateSuccess: () => void;
}

export default function BannerModal({ visible, onClose, banner, onUpdateSuccess }: BannerModalProps) {
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load dữ liệu cũ
  useEffect(() => {
    if (banner) {
      setTitle(banner.title || '');
      setDiscount(banner.discount || '');
      setImageUri(banner.imageUrl);
    }
  }, [banner]);

  // Chọn ảnh mới
  const handleChangeImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setImageUri(uri);
  };

  // Lưu
  const handleSave = async () => {
    if (!banner) return;
    setIsSaving(true);
    try {
      let finalImageUrl = banner.imageUrl;

      if (imageUri && imageUri.startsWith('file://')) {
          finalImageUrl = await uploadToCloudinary(imageUri);
      }

      await updateBanner(banner.id, {
        title: title,
        discount: discount,
        imageUrl: finalImageUrl
      });
      
      Alert.alert("Success", "Banner updated!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update banner");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Banner</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Edit (Chữ nhật dài) */}
                <Text style={styles.label}>Banner Image</Text>
                <TouchableOpacity style={styles.imageContainer} onPress={handleChangeImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <Upload size={24} color="#9ca3af" />
                    )}
                    <View style={styles.cameraIcon}>
                        <Camera size={14} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.label}>Campaign Title</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                {/* Discount */}
                <Text style={styles.label}>Discount / Subtitle</Text>
                <TextInput style={styles.input} value={discount} onChangeText={setDiscount} />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : (
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <Save size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </View>
                )}
                </TouchableOpacity>
                <View style={{height: 20}} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
  
  imageContainer: { width: '100%', height: 140, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraIcon: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#d97706', padding: 6, borderRadius: 12 },

  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  
  saveButton: { backgroundColor: '#d97706', marginTop: 30, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});