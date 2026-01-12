// API Configuration
// Change this URL to your deployed backend URL for production

// For local development (same WiFi network)
// const API_BASE_URL = 'http://192.168.1.10:5000';

// For production (deployed backend)
// Replace with your actual deployed backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://safealert-emergency-response.onrender.com';

export const API_URL = `${API_BASE_URL}/api`;

export default {
  API_URL,
  API_BASE_URL,
};
