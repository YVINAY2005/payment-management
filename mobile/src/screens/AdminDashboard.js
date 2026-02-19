import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardStyles } from '../styles/dashboardStyles';

const AdminDashboard = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    username: '',
    paymentType: '',
    bankName: '',
    ifscCode: '',
    paytmNumber: '',
    upiId: '',
    paypalEmail: '',
    usdtAddress: ''
  });

  const fetchPayments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Construct query string manually since URLSearchParams might behave differently in RN environment depending on polyfills
      const queryParams = [];
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
            queryParams.push(`${key}=${encodeURIComponent(filters[key])}`);
        }
      });
      const queryString = queryParams.join('&');
      
      const res = await axios.get(`/admin/payments?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.log('Error fetching admin data', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleLogout = async () => {
    Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Logout", 
            onPress: async () => {
              await AsyncStorage.clear();
              navigation.replace('Login');
            },
            style: "destructive"
          }
        ]
      );
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={dashboardStyles.logoutButton}>
          <Text style={dashboardStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dashboardStyles.filterSection}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Filters</Text>
          <TextInput 
            style={dashboardStyles.filterInput} 
            placeholder="Username" 
            value={filters.username} 
            onChangeText={val => handleFilterChange('username', val)} 
          />
          <TextInput 
            style={dashboardStyles.filterInput} 
            placeholder="Payment Type (e.g., Bank, UPI)" 
            value={filters.paymentType} 
            onChangeText={val => handleFilterChange('paymentType', val)} 
          />
          <TextInput 
            style={dashboardStyles.filterInput} 
            placeholder="Bank Name" 
            value={filters.bankName} 
            onChangeText={val => handleFilterChange('bankName', val)} 
          />
          {/* Add more filters if needed, keeping it compact for mobile */}
        </View>

        <Text style={[dashboardStyles.sectionTitle, { textAlign: 'left' }]}>All User Payments</Text>
        
        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' }}>
            <View style={dashboardStyles.tableHeader}>
                <Text style={[dashboardStyles.headerText, { flex: 1 }]}>User</Text>
                <Text style={[dashboardStyles.headerText, { flex: 0.8 }]}>Type</Text>
                <Text style={[dashboardStyles.headerText, { flex: 1.5 }]}>Details</Text>
            </View>
            
            {payments.map(p => (
                <View key={p._id} style={dashboardStyles.tableRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[dashboardStyles.rowText, { fontWeight: 'bold' }]}>{p.user?.username}</Text>
                        <Text style={[dashboardStyles.rowText, { fontSize: 11, color: '#888' }]}>{p.user?.email}</Text>
                    </View>
                    <Text style={[dashboardStyles.rowText, { flex: 0.8 }]}>{p.paymentType}</Text>
                    <Text style={[dashboardStyles.rowText, { flex: 1.5 }]}>
                        {p.paymentType === 'Bank' && `${p.bankName}\n${p.accountNumber}`}
                        {p.paymentType === 'Paytm' && p.paytmNumber}
                        {p.paymentType === 'UPI' && p.upiId}
                        {p.paymentType === 'PayPal' && p.paypalEmail}
                        {p.paymentType === 'USDT' && p.usdtAddress}
                        {p.paymentType === 'GPay' && p.gpayNumber}
                        {p.paymentType === 'PhonePe' && p.phonePeNumber}
                        {p.paymentType === 'OPay' && p.opayNumber}
                        {p.paymentType === 'PalmPay' && p.palmpayNumber}
                    </Text>
                </View>
            ))}
            
            {payments.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#888' }}>No payments found</Text>
                </View>
            )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
