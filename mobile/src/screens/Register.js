import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axiosConfig';
import { authStyles } from '../styles/authStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthForm from '../components/AuthForm';

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, email, password } = formData;

  const onChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async () => {
    if (!username || !email || !password) {
        setError('Please fill in all fields');
        return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/register', formData);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      Alert.alert('Success', 'Registration successful', [
        { text: 'OK', onPress: () => navigation.replace('Dashboard') }
      ]);
    } catch (err) {
      console.log('Register error details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <View style={authStyles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={authStyles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={authStyles.container}>
      <AuthForm
        title="Register"
        error={error}
        onSubmit={onSubmit}
        loading={loading}
        buttonText="Register"
        footer={footer}
      >
        <TextInput
          style={authStyles.input}
          placeholder="Username"
          value={username}
          onChangeText={(val) => onChange('username', val)}
          autoCapitalize="none"
        />
        <TextInput
          style={authStyles.input}
          placeholder="Email Address"
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

export default Register;
