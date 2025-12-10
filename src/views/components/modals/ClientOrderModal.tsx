import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { X, MapPin, Phone, Trash2, Save } from 'lucide-react-native';
import { clientUpdateOrder } from '../../../controllers/cart.controller';

interface ClientOrderModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
  onUpdateSuccess: () => void;
}

const THEME_COLOR = '#d97706';

export default function ClientOrderModal({ visible, onClose, order, onUpdateSuccess }: ClientOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Load dữ liệu cũ lên form
  useEffect(() => {
    if (order) {
      setAddress(order.userAddress);
      setPhone(order.userPhone);
    }
  }, [order]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await clientUpdateOrder(order.id, {
        userAddress: address,
        userPhone: phone
      });
      Alert.alert("Updated", "Order information updated successfully.");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
                await clientUpdateOrder(order.id, { status: 'cancelled' });
                onUpdateSuccess();
                onClose();
            } catch(e) { Alert.alert("Error", "Could not cancel"); }
            finally { setLoading(false); }
        }}
    ]);
  };

  // Chỉ cho phép sửa khi đơn hàng là Pending
  const isEditable = order?.status === 'pending';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Order</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#333" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Info */}
            <View style={styles.statusBox}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.statusValue, 
                    order?.status === 'completed' && {color: 'green'},
                    order?.status === 'cancelled' && {color: 'red'},
                    order?.status === 'pending' && {color: '#d97706'}
                ]}>
                    {order?.status?.toUpperCase()}
                </Text>
            </View>

            <Text style={styles.label}>Delivery Address</Text>
            <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6b7280" style={{marginRight: 10}} />
                <TextInput 
                    style={styles.input} value={address} onChangeText={setAddress} 
                    editable={isEditable} multiline
                />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
                <Phone size={20} color="#6b7280" style={{marginRight: 10}} />
                <TextInput 
                    style={styles.input} value={phone} onChangeText={setPhone} 
                    editable={isEditable} keyboardType="phone-pad"
                />
            </View>

            {!isEditable && (
                <Text style={styles.warningText}>* Cannot edit Completed or Cancelled orders.</Text>
            )}

            {isEditable && (
                <View style={{gap: 10, marginTop: 20}}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff"/> : (
                            <><Save size={20} color="#fff" style={{marginRight: 8}} /><Text style={styles.btnText}>Save Changes</Text></>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder} disabled={loading}>
                        <Trash2 size={20} color="#dc2626" style={{marginRight: 8}} />
                        <Text style={[styles.btnText, {color: '#dc2626'}]}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            )}
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
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f9fafb' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  statusBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusValue: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  warningText: { color: '#dc2626', fontStyle: 'italic', marginTop: 10, fontSize: 12 },
  saveBtn: { flexDirection: 'row', backgroundColor: THEME_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { flexDirection: 'row', backgroundColor: '#fee2e2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});