// src/views/components/modals/AddInventoryModal.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ScrollView, Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import { addInventoryToFirestore } from '../../../../src/controllers/admin/inventory.controller';
import { InventoryItem } from '../../../../src/models/inventory.model';

interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInventoryModal({ visible, onClose, onSuccess }: AddInventoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  

  // Utility to format category
  const formatCategory = (str: string) => {
    if (!str || str.trim() === '') return 'General';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleSave = async () => {
    if (!ingredientName.trim()) { Alert.alert('Missing Info', 'Please enter ingredient name.'); return; }
    if (!quantity.trim()) { Alert.alert('Missing Info', 'Please enter quantity.'); return; }
    
    const parsedQty = Number(quantity);
    const parsedMinQty = Number(minQuantity); // [MỚI]

    if (isNaN(parsedMinQty) || parsedMinQty < 0) { 
        Alert.alert('Invalid', 'Min Stock must be a number'); return; 
    }

    
    if (isNaN(parsedQty) || parsedQty < 0) { Alert.alert('Invalid Quantity', 'Quantity must be a valid number.'); return; }
    if (!unit.trim()) { Alert.alert('Missing Info', 'Please enter unit.'); return; }

    const finalCategory = formatCategory(category.trim());
    
    setLoading(true);
    try {
      const isLow = parsedQty <= parsedMinQty;
      const newItem = new InventoryItem('', ingredientName.trim(), parsedQty, unit.trim(), finalCategory, isLow, undefined, parsedMinQty);
      await addInventoryToFirestore(newItem);
      

      Alert.alert('Success', 'Item added successfully!', [
        { 
          text: 'OK', 
          onPress: () => { 
            resetForm(); 
            onSuccess(); // Refresh parent list
            onClose(); 
          } 
        }
      ]);
    } catch (error: any) {
      console.error('❌ FIRESTORE ERROR:', error);
      Alert.alert('Error', error.message || 'Failed to add item.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIngredientName('');
    setQuantity('');
    setUnit('');
    setCategory('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Ingredient</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. All-Purpose Flour" 
                value={ingredientName} 
                onChangeText={setIngredientName} 
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="0" 
                    keyboardType="numeric" 
                    value={quantity} 
                    onChangeText={setQuantity} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="kg, pcs" 
                    value={unit} 
                    onChangeText={setUnit} 
                  />
                </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Min Level</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="5" 
                    keyboardType="numeric" 
                    value={minQuantity} 
                    onChangeText={setMinQuantity} 
                />
              </View>
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>Category</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Baking, Dairy..." 
                value={category} 
                onChangeText={setCategory} 
              />

              <TouchableOpacity 
                style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
                onPress={handleSave} 
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Ingredient</Text>}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '65%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#111827'
  },
  saveBtn: {
    marginTop: 30, backgroundColor: '#d97706', paddingVertical: 16, 
    borderRadius: 12, alignItems: 'center',
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});