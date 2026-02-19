import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardStyles } from '../styles/dashboardStyles';

const Dashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    getUser();
  }, []);

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

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={dashboardStyles.logoutButton}>
          <Text style={dashboardStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={dashboardStyles.profileSection}>
        <View style={dashboardStyles.profileImg} />
        <View>
          <Text style={dashboardStyles.profileName}>{user?.username || 'User'}</Text>
          <Text style={dashboardStyles.profileEmail}>{user?.email || 'email@example.com'}</Text>
        </View>
      </View>

      <View>
        <TouchableOpacity 
          style={dashboardStyles.menuItem}
          onPress={() => navigation.navigate('ManagePayment')}
        >
          <Text style={dashboardStyles.menuIcon}>💳</Text>
          <Text style={dashboardStyles.menuText}>Manage Payment</Text>
          <Text style={dashboardStyles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dashboardStyles.menuItem}>
          <Text style={dashboardStyles.menuIcon}>👤</Text>
          <Text style={dashboardStyles.menuText}>Edit Profile</Text>
          <Text style={dashboardStyles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dashboardStyles.menuItem}>
          <Text style={dashboardStyles.menuIcon}>🔔</Text>
          <Text style={dashboardStyles.menuText}>Notifications</Text>
          <Text style={dashboardStyles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dashboardStyles.menuItem}>
          <Text style={dashboardStyles.menuIcon}>🔒</Text>
          <Text style={dashboardStyles.menuText}>Change Password</Text>
          <Text style={dashboardStyles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;
