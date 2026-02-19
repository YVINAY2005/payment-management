import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axiosConfig';
import { authStyles } from '../styles/authStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthForm from '../components/AuthForm';

const Login = ({ navigation }) => {
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
            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            
            if (res.data.user.role === 'admin') {
                navigation.replace('AdminDashboard');
            } else {
                navigation.replace('Dashboard');
            }
        } catch (err) {
            console.log('Login Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <View>
            <View style={authStyles.footer}>
                <Text style={authStyles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={authStyles.link}>Register</Text>
                </TouchableOpacity>
            </View>
            <View style={[authStyles.footer, { marginTop: 15 }]}>
                <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                    <Text style={[authStyles.link, { color: '#666', fontWeight: 'bold' }]}>Admin Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={authStyles.container}>
            <AuthForm
                title="Login"
                error={error}
                onSubmit={onSubmit}
                loading={loading}
                buttonText="Login"
                footer={footer}
            >
                <TextInput
                    style={[authStyles.input, { marginBottom: 20 }]}
                    placeholder="Email"
                    value={email}
                    onChangeText={(value) => onChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={authStyles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={(value) => onChange('password', value)}
                    secureTextEntry
                />
            </AuthForm>
        </SafeAreaView>
    );
};

export default Login;
