import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Entypo, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../api/axiosConfig';

const { width } = Dimensions.get('window');

const ManagePayment = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [savedPayments, setSavedPayments] = useState([]);
  const [paymentInput, setPaymentInput] = useState('');
  const [bankDetails, setBankDetails] = useState({
    ifscCode: '',
    branchName: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });
  const [editingId, setEditingId] = useState(null);
  
  // Withdraw State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPaymentId, setWithdrawPaymentId] = useState('');

  // Exact Image URLs matching the screenshot brands
  const paymentIcons = {
    Bank: 'https://cdn-icons-png.flaticon.com/512/2830/2830289.png', // Gold Bank
    USDT: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png', // Stable TrustWallet USDT
    UPI: 'https://img.icons8.com/color/96/upi.png', // Icons8 UPI
    GPay: 'https://img.icons8.com/color/96/google-pay.png', // Icons8 GPay
    PhonePe: 'https://img.icons8.com/color/96/phone-pe.png', // Icons8 PhonePe
    Paytm: 'https://img.icons8.com/color/96/paytm.png', // Icons8 Paytm
    PayPal: 'https://img.icons8.com/color/96/paypal.png', // Icons8 PayPal
    OPay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Opay_Logo.png/1200px-Opay_Logo.png', // OPay
    PalmPay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/PalmPay_Logo.png/600px-PalmPay_Logo.png', // PalmPay
  };

  const getDisplayValue = (item) => {
    switch(item.paymentType) {
        case 'Bank': return item.accountNumber;
        case 'Paytm': return item.paytmNumber;
        case 'UPI': return item.upiId;
        case 'PayPal': return item.paypalEmail;
        case 'USDT': return item.usdtAddress;
        case 'GPay': return item.gpayNumber;
        case 'PhonePe': return item.phonePeNumber;
        case 'OPay': return item.opayNumber;
        case 'PalmPay': return item.palmpayNumber;
        default: return '';
    }
  };

  const fetchPayments = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        const res = await axios.get('/payments', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const mappedPayments = res.data.map(p => ({
            id: p._id,
            type: p.paymentType,
            value: getDisplayValue(p),
            icon: paymentIcons[p.paymentType],
            details: p
        }));
        
        setSavedPayments(mappedPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        Alert.alert('Error', 'Failed to load payments');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddClick = (name) => {
    setSelectedType(name);
    setPaymentInput('');
    setBankDetails({
      ifscCode: '',
      branchName: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedType(item.type);
    setPaymentInput(item.value);
    if (item.type === 'Bank' && item.details) {
      setBankDetails({
        ifscCode: item.details.ifscCode || '',
        branchName: item.details.branchName || '',
        bankName: item.details.bankName || '',
        accountNumber: item.details.accountNumber || '',
        accountHolderName: item.details.accountHolderName || ''
      });
    }
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
        'Delete Payment',
        'Are you sure you want to delete this payment method?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    await axios.delete(`/payments/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSavedPayments(prev => prev.filter(item => item.id !== id));
                } catch (error) {
                    Alert.alert('Error', 'Failed to delete payment');
                }
            }}
        ]
    );
  };

  const getPayload = (type, value) => {
    const base = { paymentType: type };
    if (type === 'Bank') {
        return { ...base, ...bankDetails };
    }
    switch(type) {
        case 'Paytm': return { ...base, paytmNumber: value };
        case 'UPI': return { ...base, upiId: value };
        case 'PayPal': return { ...base, paypalEmail: value };
        case 'USDT': return { ...base, usdtAddress: value };
        case 'GPay': return { ...base, gpayNumber: value };
        case 'PhonePe': return { ...base, phonePeNumber: value };
        case 'OPay': return { ...base, opayNumber: value };
        case 'PalmPay': return { ...base, palmpayNumber: value };
        default: return base;
    }
  };

  const handleSave = async () => {
    if (selectedType === 'Bank') {
        const { ifscCode, branchName, bankName, accountNumber, accountHolderName } = bankDetails;
        if (!ifscCode || !branchName || !bankName || !accountNumber || !accountHolderName) {
            Alert.alert('Error', 'Please fill in all bank details');
            return;
        }
    } else if (!paymentInput.trim()) {
        Alert.alert('Error', 'Please enter payment details');
        return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        const payload = getPayload(selectedType, paymentInput);

        if (editingId) {
            await axios.put(`/payments/${editingId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedPayments(prev => prev.map(item => 
                item.id === editingId ? { 
                    ...item, 
                    value: selectedType === 'Bank' ? bankDetails.accountNumber : paymentInput,
                    details: selectedType === 'Bank' ? { ...item.details, ...bankDetails } : item.details
                } : item
            ));
        } else {
            const res = await axios.post('/payments', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newPayment = {
                id: res.data._id,
                type: res.data.paymentType,
                value: getDisplayValue(res.data),
                icon: paymentIcons[res.data.paymentType],
                details: res.data
            };
            setSavedPayments([...savedPayments, newPayment]);
        }
        setShowModal(false);
        setPaymentInput('');
        setBankDetails({
            ifscCode: '',
            branchName: '',
            bankName: '',
            accountNumber: '',
            accountHolderName: ''
        });
        setEditingId(null);
    } catch (error) {
        console.error('Save error details:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save payment';
        Alert.alert('Error', errorMessage);
    }
  };

  const handleWithdrawSubmit = () => {
    if (!withdrawPaymentId.trim()) {
        Alert.alert('Error', 'Please enter a Payment ID');
        return;
    }
    // Logic for screenshot upload would go here
    Alert.alert('Success', 'Withdraw request submitted successfully!');
    setShowWithdrawModal(false);
    setWithdrawPaymentId('');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Payment ...</Text>
          <View style={styles.headerRight}>
            {/* Coin Pill */}
            <View style={styles.pillContainer}>
                <Text style={styles.coinText}>2100</Text>
                <View style={styles.starIcon}><FontAwesome5 name="star" size={10} color="#fff" /></View>
            </View>
            
            {/* Cash Pill */}
            <View style={[styles.pillContainer, styles.cashPill]}>
                <Text style={styles.cashText}>₹0.00</Text>
            </View>

            {/* Notification */}
            <TouchableOpacity style={styles.notificationBtn}>
                <Ionicons name="notifications" size={24} color="#757575" />
                <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
            </TouchableOpacity>

            {/* Profile Avatar with Ring */}
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                <View style={styles.profileRing}>
                     <Image 
                        source={{uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'}} 
                        style={styles.profileImage} 
                    />
                </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Add Payment Options</Text>

            {/* Payment Grid */}
            <View style={styles.grid}>
                {/* Row 1 */}
                <PaymentCard name="Bank" iconUri={paymentIcons.Bank} onPress={() => handleAddClick('Bank')} />
                <PaymentCard name="BNB USDT" iconUri={paymentIcons.USDT} onPress={() => handleAddClick('USDT')} />
                <PaymentCard name="UPI" iconUri={paymentIcons.UPI} iconStyle={{width: 45, height: 25}} onPress={() => handleAddClick('UPI')} />

                {/* Row 2 */}
                <PaymentCard name="GPay" iconUri={paymentIcons.GPay} onPress={() => handleAddClick('GPay')} />
                <PaymentCard name="PhonePe" iconUri={paymentIcons.PhonePe} onPress={() => handleAddClick('PhonePe')} />
                <PaymentCard name="Paytm" iconUri={paymentIcons.Paytm} iconStyle={{width: 50, height: 20, marginRight: 2}} onPress={() => handleAddClick('Paytm')} />

                {/* Row 3 */}
                <PaymentCard name="PayPal" iconUri={paymentIcons.PayPal} disabled={true} iconStyle={{width: 25, height: 30}} />
                
                {/* OPay - Text based in image */}
                <TouchableOpacity style={styles.card} onPress={() => handleAddClick('OPay')}>
                    <Text style={{color: '#6200ea', fontWeight: 'bold', fontSize: 16}}>OPay</Text>
                </TouchableOpacity>

                {/* PalmPay - Text based in image */}
                <TouchableOpacity style={styles.card} onPress={() => handleAddClick('PalmPay')}>
                    <Text style={{color: '#000', fontWeight: 'bold', fontSize: 16}}>PalmPay</Text>
                </TouchableOpacity>
            </View>

            {/* Saved Payments Section */}
            {savedPayments.length > 0 && (
                <View style={styles.savedSection}>
                    <Text style={styles.sectionTitle}>My Saved Payments</Text>
                    {savedPayments.map(item => (
                        <View key={item.id} style={styles.savedCard}>
                            <View style={styles.savedInfo}>
                                <Image source={{uri: paymentIcons[item.type]}} style={styles.savedIcon} resizeMode="contain" />
                                <View style={{flex: 1}}>
                                    <Text style={styles.savedType}>{item.type}</Text>
                                    <Text style={styles.savedValue} numberOfLines={1}>{item.value}</Text>
                                </View>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                                    <MaterialIcons name="edit" size={20} color="#2962ff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                    <MaterialIcons name="delete" size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerBox}>
                <View style={styles.disclaimerHeader}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#fbc02d" />
                    <Text style={styles.disclaimerTitle}>Disclaimer</Text>
                </View>
                
                <View style={styles.divider} />
                <Text style={styles.disclaimerText}>1. Use only a bank account that matches your profile name.</Text>
                
                <View style={styles.divider} />
                <Text style={styles.disclaimerText}>2. Do not link the same bank account to multiple Task Planet accounts.</Text>
                
                <View style={styles.divider} />
                <Text style={styles.disclaimerText}>3. Fraudulent activity may result in account blocking.</Text>
            </View>

            {/* Withdraw Button */}
            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdrawModal(true)}>
                <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>

            <View style={{height: 100}} /> 
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBarBackground}>
         {/* Cutout Effect using a white circle behind the floating button */}
         <View style={styles.floatingButtonPlaceholder} />

         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
             {/* Floating Home Button */}
             <View style={styles.floatingHomeButton}>
                 <Ionicons name="home-outline" size={24} color="#4285F4" />
             </View>
             <Text style={styles.navLabel}>Home</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.navItem}>
             <Ionicons name="clipboard-outline" size={24} color="#fff" />
         </TouchableOpacity>

         <TouchableOpacity style={styles.navItem}>
             <Ionicons name="globe-outline" size={28} color="#fff" />
         </TouchableOpacity>

         <TouchableOpacity style={styles.navItem}>
             <View style={styles.podiumContainer}>
                 <View style={styles.podiumLeft}>
                    <Text style={styles.podiumText}>2</Text>
                 </View>
                 <View style={styles.podiumCenter}>
                    <Ionicons name="star" size={8} color="#FFD700" style={{ marginBottom: -2 }} />
                    <Text style={styles.podiumText}>1</Text>
                 </View>
                 <View style={styles.podiumRight}>
                    <Text style={styles.podiumText}>3</Text>
                 </View>
             </View>
         </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} {selectedType}</Text>
                
                {selectedType === 'Bank' ? (
                    <>
                        <TextInput 
                            style={styles.input} 
                            placeholder="IFSC Code" 
                            value={bankDetails.ifscCode}
                            onChangeText={(text) => setBankDetails({...bankDetails, ifscCode: text})}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Branch Name" 
                            value={bankDetails.branchName}
                            onChangeText={(text) => setBankDetails({...bankDetails, branchName: text})}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Bank Name" 
                            value={bankDetails.bankName}
                            onChangeText={(text) => setBankDetails({...bankDetails, bankName: text})}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Account Number" 
                            value={bankDetails.accountNumber}
                            onChangeText={(text) => setBankDetails({...bankDetails, accountNumber: text})}
                            keyboardType="numeric"
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Account Holder Name" 
                            value={bankDetails.accountHolderName}
                            onChangeText={(text) => setBankDetails({...bankDetails, accountHolderName: text})}
                        />
                    </>
                ) : (
                    <TextInput 
                        style={styles.input} 
                        placeholder={`Enter ${selectedType} Details`} 
                        value={paymentInput}
                        onChangeText={setPaymentInput}
                    />
                )}

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                        <Text style={{color: '#fff'}}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
};

const PaymentCard = ({ name, iconUri, onPress, disabled, iconStyle }) => (
    <TouchableOpacity 
        style={[styles.card, disabled && styles.disabledCard]} 
        onPress={onPress}
        disabled={disabled}
    >
        <Image source={{uri: iconUri}} style={[styles.icon, iconStyle]} resizeMode="contain" />
        <Text style={[styles.cardLabel, disabled && {color: '#999'}]}>{name}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    elevation: 1,
  },
  cashPill: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
  },
  coinText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
  starIcon: {
      backgroundColor: '#fbc02d',
      borderRadius: 10,
      width: 14,
      height: 14,
      justifyContent: 'center',
      alignItems: 'center'
  },
  cashText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationBtn: {
      marginRight: 8,
      position: 'relative',
  },
  badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: 'red',
      borderRadius: 6,
      width: 12,
      height: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  badgeText: {
      color: '#fff',
      fontSize: 8,
      fontWeight: 'bold',
  },
  profileRing: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: '#4285F4', // Simplified ring color
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
  },
  profileImage: {
      width: 28,
      height: 28,
      borderRadius: 14,
  },
  scrollContent: {
      padding: 15,
  },
  sectionTitle: {
      fontSize: 22,
      textAlign: 'center',
      marginVertical: 20,
      fontWeight: '400',
      color: '#000',
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
  card: {
      width: (width - 40) / 3,
      backgroundColor: '#f5f5f5',
      borderRadius: 25, // Pill shape
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      flexDirection: 'row',
      elevation: 1,
  },
  disabledCard: {
      opacity: 0.6,
  },
  icon: {
      width: 28,
      height: 28,
      marginRight: 8,
  },
  cardLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#555',
  },
  disclaimerBox: {
      backgroundColor: '#e8f5e9',
      borderRadius: 10,
      padding: 15,
      marginTop: 10,
  },
  disclaimerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#AB47BC', // Light Violet
    marginLeft: 10,
  },
  divider: {
      height: 1,
      backgroundColor: '#c8e6c9', // Light green divider
      marginVertical: 8,
  },
  disclaimerText: {
      fontSize: 14,
      color: '#000',
      lineHeight: 20,
      fontWeight: 'bold',
  },
  // Bottom Bar Styles
  bottomBarBackground: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: '#2962ff', // Bright Blue
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 10,
  },
  navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  floatingButtonPlaceholder: {
      position: 'absolute',
      top: -30,
      left: width/8 - 35 + (width/4 * 0), // Approx position for 1st item
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'transparent', // We handle this with the button itself
      zIndex: -1,
  },
  floatingHomeButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -40, // Push up
      elevation: 5,
      borderWidth: 4,
      borderColor: '#fff', // Blend
  },
  navLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
  },
  podiumContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 24,
  },
  podiumLeft: { 
      width: 10, 
      height: 12, 
      backgroundColor: '#4CAF50', 
      marginRight: 2, 
      alignItems: 'center', 
      justifyContent: 'center',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
  },
  podiumCenter: { 
      width: 10, 
      height: 20, 
      backgroundColor: '#FF9800', 
      marginRight: 2, 
      alignItems: 'center', 
      justifyContent: 'flex-end',
      paddingBottom: 2,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
  },
  podiumRight: { 
      width: 10, 
      height: 10, 
      backgroundColor: '#4CAF50', 
      alignItems: 'center', 
      justifyContent: 'center',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
  },
  podiumText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#fff',
  },
  star: { fontSize: 6, color: '#000', marginTop: 1 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: '#2962ff', padding: 10, borderRadius: 5, marginLeft: 10 },
  cancelBtn: { padding: 10 },
  savedSection: {
      marginTop: 20,
      marginBottom: 20,
  },
  savedCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  savedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  savedIcon: {
      width: 40,
      height: 40,
      marginRight: 15,
  },
  savedType: {
      fontSize: 14,
      color: '#757575',
      marginBottom: 2,
  },
  savedValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  editBtn: {
      padding: 8,
      marginRight: 5,
      backgroundColor: '#e3f2fd',
      borderRadius: 8,
  },
  deleteBtn: {
      padding: 8,
      backgroundColor: '#ffebee',
      borderRadius: 8,
  },
  withdrawBtn: {
      backgroundColor: '#2962ff',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
      elevation: 3,
  },
  withdrawText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  label: {
      fontSize: 14,
      color: '#333',
      marginBottom: 5,
      fontWeight: '600',
  },
  uploadBtn: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderStyle: 'dashed',
      borderRadius: 5,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
  },
  uploadText: {
      marginTop: 5,
      color: '#666',
      fontSize: 14,
  },
});

export default ManagePayment;