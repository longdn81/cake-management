import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Alert
} from 'react-native';
import { X, Save, Camera } from 'lucide-react-native';

// Import Controller & Utils
import { updateCake } from '../../../controllers/admin/cake.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../helper/uploadImage';

// Định nghĩa Type
type CakeStatus = 'Available' | 'Low Stock' | 'Out of Stock';
const STATUS_OPTIONS: CakeStatus[] = ['Available', 'Low Stock', 'Out of Stock'];

interface CakeModalProps {
  visible: boolean;
  onClose: () => void;
  cake: any;             // Dữ liệu bánh cần sửa
  categories: any[];     // Danh sách danh mục để chọn
  onUpdateSuccess: () => void; // Callback để báo cho màn hình cha reload lại dữ liệu
}

export default function CakeModal({ visible, onClose, cake, categories, onUpdateSuccess }: CakeModalProps) {
  // State form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<CakeStatus>('Available');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Mỗi khi mở modal hoặc thay đổi bánh, load dữ liệu vào form
  useEffect(() => {
    if (cake) {
      setName(cake.name);
      setPrice(cake.price.toString());
      setStock(cake.stock.toString());
      setDesc(cake.description || '');
      setStatus(cake.status || 'Available');
      setCategory(cake.category || '');
      setImageUri(cake.image);
    }
  }, [cake]);

  // Hàm chọn ảnh mới
  const handleChangeImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      setImageUri(uri);
    }
  };

  // Hàm Lưu
  const handleSave = async () => {
    if (!cake) return;
    setIsSaving(true);

    try {
      let finalImageUrl = cake.image; // Mặc định dùng ảnh cũ

      // Nếu ảnh thay đổi (là file trên máy), upload lên Cloudinary
      if (imageUri && imageUri.startsWith('file://')) {
          finalImageUrl = await uploadToCloudinary(imageUri);
      }

      // Gọi Controller update
      await updateCake(cake.id, {
        name: name,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        description: desc,
        status: status,
        category: category,
        images: [finalImageUrl] 
      });
      
      Alert.alert("Success", "Cake updated successfully!");
      onUpdateSuccess(); // Báo cho cha biết đã xong
      onClose(); // Đóng modal
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update cake");
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
              <Text style={styles.modalTitle}>Edit Cake</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              {/* Image */}
              <TouchableOpacity style={styles.imageEditContainer} onPress={handleChangeImage}>
                 <Image source={{ uri: imageUri }} style={styles.imageEditPreview} />
                 <View style={styles.cameraIconOverlay}>
                    <Camera size={20} color="#fff" />
                 </View>
              </TouchableOpacity>

              {/* Name */}
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />

              {/* Price & Stock */}
              <View style={{flexDirection: 'row', gap: 10}}>
                  <View style={{flex: 1}}>
                      <Text style={styles.label}>Price ($)</Text>
                      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
                  </View>
                  <View style={{flex: 1}}>
                      <Text style={styles.label}>Stock</Text>
                      <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />
                  </View>
              </View>

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
                {categories.map((cat) => (
                    <TouchableOpacity 
                        key={cat.id} 
                        style={[styles.chip, category === cat.name && styles.chipSelected]}
                        onPress={() => setCategory(cat.name)}
                    >
                        <Text style={[styles.chipText, category === cat.name && styles.chipTextSelected]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Status */}
              <Text style={styles.label}>Status</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                  {STATUS_OPTIONS.map((opt) => (
                      <TouchableOpacity 
                          key={opt}
                          style={[styles.chip, status === opt && styles.chipSelected]}
                          onPress={() => setStatus(opt)}
                      >
                           <Text style={[styles.chipText, status === opt && styles.chipTextSelected]}>
                               {opt}
                           </Text>
                      </TouchableOpacity>
                  ))}
              </View>

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={desc} 
                  onChangeText={setDesc} 
                  multiline={true}
                  textAlignVertical="top"
              />

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
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  imageEditContainer: { alignSelf: 'center', width: 120, height: 120, marginBottom: 15, position: 'relative' },
  imageEditPreview: { width: '100%', height: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cameraIconOverlay: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#d97706', padding: 8, borderRadius: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  textArea: { height: 80 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  chipSelected: { backgroundColor: '#fff7ed', borderColor: '#d97706' },
  chipText: { fontSize: 13, color: '#4b5563' },
  chipTextSelected: { color: '#d97706', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#d97706', marginTop: 30, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});