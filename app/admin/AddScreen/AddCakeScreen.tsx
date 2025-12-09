import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, Modal, FlatList 
} from 'react-native';
import { Cake } from '../../../src/models/cake.model';
import { addCakeToFirestore } from '../../../src/controllers/admin/cake.controller';
import { getCategories } from '../../../src/controllers/admin/category.controller'; // <--- Import controller lấy category
import { useRouter } from 'expo-router';
import { pickImageFromGallery, uploadToCloudinary } from '../../../src/helper/uploadImage';
import { Plus, Trash2, ChevronDown, Check, X } from 'lucide-react-native'; // Thêm icon

export default function AddCakeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(''); // Lưu tên Category được chọn
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  
  const [rate, setRate] = useState('5');
  const [discount, setDiscount] = useState('0');

  // Data States
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Variants States
  const [variants, setVariants] = useState<any[]>([]); 
  const [tempSize, setTempSize] = useState('');        
  const [tempPrice, setTempPrice] = useState('');      

  const [imageUri, setImageUri] = useState<string | null>(null);

  // 1. Fetch Categories khi mở màn hình
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategoriesList(data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCats();
  }, []);

  const handleAddVariant = () => {
    if (!tempSize || !tempPrice) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên size và giá tiền");
      return;
    }
    setVariants([...variants, { label: tempSize, price: parseFloat(tempPrice) }]);
    setTempSize('');
    setTempPrice('');
  };

  const handleRemoveVariant = (index: number) => {
    const newList = [...variants];
    newList.splice(index, 1);
    setVariants(newList);
  };

  const handlePickImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setImageUri(uri);
  };
  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setStock('');
    setDescription('');
    setImageUri(null);
    setVariants([]);
    
    // Reset về mặc định
    setRate('5');
    setDiscount('0');
    setTempSize('');
    setTempPrice('');
  };

  const handleSave = async () => {
    if (!name || !price || !category || !imageUri) {
        Alert.alert('Missing Info', 'Please fill in all required fields (*)');
        return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(imageUri);
      const basePrice = parseFloat(price);

      const newCake = new Cake(
        '',
        name, 
        basePrice, 
        [imageUrl], 
        category, // Lưu category đã chọn
        'Available', 
        parseInt(stock) || 0,
        description,
        parseFloat(rate) || 5,
        parseFloat(discount) || 0,
        variants
      );

      await addCakeToFirestore(newCake);

      Alert.alert('Thành công', 'Đã thêm bánh mới thành công!', [
        { 
            text: 'Thêm cái nữa', 
            onPress: () => {
                resetForm(); // Xóa dữ liệu cũ để nhập cái mới
            } 
        },
        { 
            text: 'Quay lại', 
            style: 'cancel',
            onPress: () => {
                resetForm();
                router.back();
            } 
        }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not add cake.');
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
          <Text style={styles.title}>Create New Cake</Text>

          {/* IMAGE PICKER */}
          <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.fullImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={{ fontSize: 40 }}>📸</Text>
                <Text style={styles.imagePlaceholderText}>Tap to pick image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* FORM */}
          <View style={styles.form}>
            
            {/* Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Cake Name (*)</Text>
                <TextInput style={styles.input} placeholder="Ex: Tiramisu" value={name} onChangeText={setName} />
            </View>

            {/* --- CATEGORY SELECTOR (THAY ĐỔI) --- */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category (*)</Text>
                <TouchableOpacity 
                    style={styles.selector} 
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Text style={{ color: category ? '#1f2937' : '#9ca3af', fontSize: 16 }}>
                        {category || "Select Category"}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>
            
            {/* Description */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Describe ingredients..." 
                    value={description} onChangeText={setDescription}
                    multiline={true} textAlignVertical="top" 
                />
            </View>

            {/* Price & Stock */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Base Price ($) (*)</Text>
                    <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={price} onChangeText={setPrice} />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Stock</Text>
                    <TextInput style={styles.input} placeholder="10" keyboardType="numeric" value={stock} onChangeText={setStock} />
                </View>
            </View>

            {/* VARIANTS SECTION */}
            <Text style={[styles.label, {marginTop: 15}]}>Cake Sizes (Variants)</Text>
            <View style={styles.variantContainer}>
                <View style={styles.variantInputRow}>
                    <View style={{flex: 1.5}}>
                        <TextInput style={styles.inputSmall} placeholder="Size (e.g 20cm)" value={tempSize} onChangeText={setTempSize} />
                    </View>
                    <View style={{flex: 1, marginHorizontal: 8}}>
                        <TextInput style={styles.inputSmall} placeholder="Price ($)" keyboardType="numeric" value={tempPrice} onChangeText={setTempPrice} />
                    </View>
                    <TouchableOpacity style={styles.addVariantBtn} onPress={handleAddVariant}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {variants.length > 0 ? (
                    variants.map((item, index) => (
                        <View key={index} style={styles.variantItem}>
                            <Text style={styles.variantText}>Scale: {item.label}</Text>
                            <Text style={styles.variantPrice}>${item.price}</Text>
                            <TouchableOpacity onPress={() => handleRemoveVariant(index)}>
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No sizes added yet.</Text>
                )}
            </View>

            {/* Rate & Discount */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Discount (%)</Text>
                    <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={discount} onChangeText={setDiscount} />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Rate (1-5)</Text>
                    <TextInput style={styles.input} placeholder="5" keyboardType="numeric" value={rate} onChangeText={setRate} />
                </View>
            </View>

          </View>

          <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Save Cake</Text>}
          </TouchableOpacity>
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- CATEGORY MODAL --- */}
      <Modal visible={showCategoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                        <X size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                {categoriesList.length === 0 ? (
                    <Text style={styles.emptyText}>No categories found. Please add categories first.</Text>
                ) : (
                    <FlatList
                        data={categoriesList}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[styles.catItem, category === item.name && styles.catItemSelected]}
                                onPress={() => {
                                    setCategory(item.name);
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={[styles.catText, category === item.name && styles.catTextSelected]}>
                                    {item.name}
                                </Text>
                                {category === item.name && <Check size={20} color="#d97706" />}
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: '#333' },
  
  imageContainer: { width: '100%', height: 200, marginBottom: 25, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { marginTop: 10, color: "#6b7280" },

  form: { gap: 15, marginBottom: 20 },
  inputGroup: { marginBottom: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginLeft: 4 },
  
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, color: '#1f2937' },
  
  // Selector Style (Giống Input nhưng có icon mũi tên)
  selector: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },

  inputSmall: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, color: '#1f2937' },
  textArea: { height: 80 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  halfInput: { flex: 1 },

  // Variants Styles
  variantContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 5 },
  variantInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addVariantBtn: { backgroundColor: '#10b981', width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  variantItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  variantText: { fontWeight: '600', color: '#374151', flex: 1 },
  variantPrice: { fontWeight: 'bold', color: '#d97706', marginRight: 15 },
  emptyText: { fontStyle: 'italic', color: '#9ca3af', textAlign: 'center', padding: 10 },

  saveBtn: { backgroundColor: "#d97706", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 20, shadowColor: "#d97706", shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  catItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  catItemSelected: { backgroundColor: '#fffbeb' },
  catText: { fontSize: 16, color: '#374151' },
  catTextSelected: { color: '#d97706', fontWeight: 'bold' },
});