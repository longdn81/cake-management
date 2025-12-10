import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { X, Check, MapPin } from 'lucide-react-native';
import { updateOrder } from '../../../../src/controllers/admin/order.controller';

interface OrderEditModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
  onUpdateSuccess: () => void;
}

const THEME_COLOR = '#d97706';

export default function OrderEditModal({ visible, onClose, order, onUpdateSuccess }: OrderEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setAddress(order.userAddress);
    }
  }, [order]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateOrder(order.id, {
        status: status,
        userAddress: address
      });
      Alert.alert("Success", "Order updated successfully!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const StatusOption = ({ value, label, color }: any) => (
    <TouchableOpacity 
      style={[
        styles.statusOption, 
        status === value && { backgroundColor: color + '20', borderColor: color }
      ]}
      onPress={() => setStatus(value)}
    >
      <View style={[styles.radioCircle, { borderColor: status === value ? color : '#ccc' }]}>
        {status === value && <View style={[styles.selectedDot, { backgroundColor: color }]} />}
      </View>
      <Text style={[styles.statusLabel, status === value && { color: color, fontWeight: 'bold' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Edit Order</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* 1. Edit Status */}
            <Text style={styles.sectionLabel}>Order Status</Text>
            <View style={styles.statusContainer}>
                <StatusOption value="pending" label="Pending" color="#d97706" />
                <StatusOption value="completed" label="Completed" color="#059669" />
                <StatusOption value="cancelled" label="Cancelled" color="#dc2626" />
            </View>

            {/* 2. Edit Address */}
            <Text style={styles.sectionLabel}>Delivery Address</Text>
            <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6b7280" style={{marginRight: 10}} />
                <TextInput 
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter delivery address"
                    multiline
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                        <Check size={20} color="#fff" style={{marginRight: 8}} />
                        <Text style={styles.saveText}>Save Changes</Text>
                    </>
                )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '60%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 10 },
  
  // Status Styles
  statusContainer: { gap: 10 },
  statusOption: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, 
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' 
  },
  radioCircle: { 
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  selectedDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 16, color: '#374151' },

  // Input Styles
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', 
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f9fafb'
  },
  input: { flex: 1, fontSize: 16, color: '#111827', height: 50 },

  saveBtn: { 
    flexDirection: 'row', backgroundColor: THEME_COLOR, paddingVertical: 16, 
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});