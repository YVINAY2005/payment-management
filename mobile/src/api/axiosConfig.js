import axios from 'axios';
import Constants from 'expo-constants';

// --- CONFIGURATION ---
// If you deploy your backend to the cloud (Render, Heroku, etc.), put the URL here.
// Example: 'https://my-app.onrender.com/api'
const CLOUD_API_URL = 'https://payment-management-backend.onrender.com/api'; 

// AUTOMATIC LAN IP DETECTION
// This automatically detects your computer's IP address from Expo.
// No manual IP updates or tunnels required!

const getBaseUrl = () => {
    // 0. Use Cloud URL if available (Best for "Any Network" access)
    if (CLOUD_API_URL) {
        console.log('Using Cloud API URL:', CLOUD_API_URL);
        return CLOUD_API_URL;
    }

    // 1. Try to get IP from Expo environment (Standard/Optimized way)
    if (Constants.expoConfig?.hostUri) {
        const hostUri = Constants.expoConfig.hostUri;
        const ip = hostUri.split(':')[0];
        console.log('Detected LAN IP from Expo:', ip);
        return `http://${ip}:5000/api`;
    }

    // 2. Fallback IP (if running in simulator or detached)
    // Replace this only if your IP is different and detection fails
    const fallbackIp = '192.168.0.107'; 
    return `http://${fallbackIp}:5000/api`;
};

const BASE_URL = getBaseUrl();
console.log('Final API Base URL:', BASE_URL);

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds timeout to prevent infinite loading
});

export default instance;
