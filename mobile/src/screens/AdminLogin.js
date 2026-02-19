import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axiosConfig';
import { authStyles } from '../styles/authStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AuthForm from '../components/AuthForm';

const AdminLogin = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async () => {
    if (!email || !password) {
        setError('Please fill in all fields');
        return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/auth/login', formData);
      
      if (res.data.user.role !== 'admin') {
          setError('Access denied. This is an admin login page.');
          setLoading(false);
          return;
      }

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      navigation.replace('AdminDashboard');
    } catch (err) {
      console.log('Admin Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Admin login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-back" size={24} color="#007bff" />
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>

      <AuthForm
        title="Admin Portal"
        subTitle="Management Access Only"
        error={error}
        onSubmit={onSubmit}
        loading={loading}
        buttonText="Login as Admin"
        style={styles.adminCard}
      >
        <TextInput
          style={[authStyles.input, { marginBottom: 20 }]}
          placeholder="Admin Email"
          value={email}
          onChangeText={(val) => onChange('email', val)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={authStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={(val) => onChange('password', val)}
          secureTextEntry
        />
      </AuthForm>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    backText: {
        marginLeft: 5,
        color: '#007bff',
        fontSize: 16,
        fontWeight: '500',
    },
    adminCard: {
        borderTopWidth: 4,
        borderTopColor: '#007bff',
    }
});

export default AdminLogin;
