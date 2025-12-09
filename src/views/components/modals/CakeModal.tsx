import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, ScrollView, FlatList 
} from 'react-native';
import { X, Plus, Trash2, ChevronDown, Check } from 'lucide-react-native';
import { updateCake } from '../../../controllers/admin/cake.controller';

interface CakeModalProps {
  visible: boolean;
  onClose: () => void;
  cake: any; 
  categories: any[];
  onUpdateSuccess: () => void;
}

export default function CakeModal({ visible, onClose, cake, categories, onUpdateSuccess }: CakeModalProps) {
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(''); // Lưu tên category
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [rate, setRate] = useState('');

  // Variants States
  const [variants, setVariants] = useState<any[]>([]); 
  const [tempSize, setTempSize] = useState('');        
  const [tempPrice, setTempPrice] = useState(''); 

  // Modal Category State
  const [showCatModal, setShowCatModal] = useState(false);

  // Load data
  useEffect(() => {
    if (cake) {
      setName(cake.name);
      setPrice(cake.price.toString());
      setStock(cake.stock.toString());
      setCategory(cake.category);
      setDescription(cake.description || '');
      setDiscount(cake.discount ? cake.discount.toString() : '0');
      setRate(cake.rate ? cake.rate.toString() : '5');
      setVariants(cake.variants || []);
    }
  }, [cake]);

  const handleAddVariant = () => {
    if (!tempSize || !tempPrice) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Size và Giá");
      return;
    }
    const newVariant = { label: tempSize, price: parseFloat(tempPrice) };
    setVariants([...variants, newVariant]);
    setTempSize('');
    setTempPrice('');
  };

  const handleRemoveVariant = (index: number) => {
    const newList = [...variants];
    newList.splice(index, 1);
    setVariants(newList);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateCake(cake.id, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category, // Lưu category mới chọn
        description,
        discount: parseFloat(discount),
        rate: parseFloat(rate),
        variants: variants
      });
      Alert.alert("Success", "Cake updated successfully!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
            
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Cake</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            {/* --- CATEGORY SELECTOR (MỚI) --- */}
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
                style={styles.selector} 
                onPress={() => setShowCatModal(true)}
            >
                <Text style={{color: '#333', fontSize: 16}}>{category || "Select Category"}</Text>
                <ChevronDown size={20} color="#666" />
            </TouchableOpacity>

            {/* Price & Stock */}
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Base Price</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Stock</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} />
                </View>
            </View>

            {/* VARIANTS SECTION */}
            <Text style={[styles.label, {marginTop: 15}]}>Cake Sizes (Variants)</Text>
            <View style={styles.variantContainer}>
                <View style={styles.variantInputRow}>
                    <View style={{flex: 1.5}}>
                        <TextInput style={styles.inputSmall} placeholder="Size" value={tempSize} onChangeText={setTempSize} />
                    </View>
                    <View style={{flex: 1, marginHorizontal: 8}}>
                        <TextInput style={styles.inputSmall} placeholder="Price" keyboardType="numeric" value={tempPrice} onChangeText={setTempPrice} />
                    </View>
                    <TouchableOpacity style={styles.addVariantBtn} onPress={handleAddVariant}>
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {variants.length > 0 ? (
                    variants.map((item, index) => (
                        <View key={index} style={styles.variantItem}>
                            <Text style={styles.variantText}>{item.label}</Text>
                            <Text style={styles.variantPrice}>${item.price}</Text>
                            <TouchableOpacity onPress={() => handleRemoveVariant(index)}>
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No variants added.</Text>
                )}
            </View>

            {/* Rate & Discount */}
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Disc %</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={discount} onChangeText={setDiscount} />
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Rate</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
                </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline value={description} onChangeText={setDescription} 
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveText}>Update Changes</Text>}
            </TouchableOpacity>
            
            <View style={{height: 20}} />
          </ScrollView>
        </View>

        {/* --- INNER MODAL: SELECT CATEGORY --- */}
        <Modal visible={showCatModal} animationType="fade" transparent={true}>
            <View style={styles.catModalOverlay}>
                <View style={styles.catModalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Category</Text>
                        <TouchableOpacity onPress={() => setShowCatModal(false)}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[styles.catItem, category === item.name && styles.catItemSelected]}
                                onPress={() => {
                                    setCategory(item.name);
                                    setShowCatModal(false);
                                }}
                            >
                                <Text style={[styles.catText, category === item.name && styles.catTextSelected]}>
                                    {item.name}
                                </Text>
                                {category === item.name && <Check size={20} color="#d97706" />}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
  
  // Selector Style
  selector: { 
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },

  inputSmall: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },

  // Variants Styles
  variantContainer: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  variantInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addVariantBtn: { backgroundColor: '#10b981', width: 36, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  variantItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  variantText: { fontWeight: '600', color: '#333', flex: 1 },
  variantPrice: { fontWeight: 'bold', color: '#d97706', marginRight: 15 },
  emptyText: { fontStyle: 'italic', color: '#999', textAlign: 'center', fontSize: 12 },

  saveBtn: { backgroundColor: '#d97706', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Category Modal Styles
  catModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  catModalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '60%' },
  catItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  catItemSelected: { backgroundColor: '#fffbeb' },
  catText: { fontSize: 16, color: '#374151' },
  catTextSelected: { color: '#d97706', fontWeight: 'bold' },
});