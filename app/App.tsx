import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

import UserLogin from './src/screens/UserLogin';
import UserDashboard from './src/screens/UserDashboard';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const email = await SecureStore.getItemAsync('userEmail');
      if (token && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
      }
    } catch (error) {
      console.log('Auth check error:', error);
    }
    setIsLoading(false);
  };

  const handleLogin = async (email: string, token: string) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userEmail', email);
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <UserDashboard 
                {...props} 
                email={userEmail!} 
                onLogout={handleLogout} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <UserLogin 
                {...props} 
                onLogin={handleLogin} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
