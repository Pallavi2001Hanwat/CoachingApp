// src/navigation/AppNavigator.tsx
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './Admin/AdminNavigator';
import StudentNavigator from './Student/StudentNavigator';
import PasswordScreen from '../screens/auth/PasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { IUser } from '../Interface/IUser';

const EMAIL_PHONE_KEY = '@app_user_contact' // 👈 same key used in saveEmailOrPhone
const USER_KEY = '@app_user'
const TOKEN_KEY = '@app_token';
const AppNavigator: React.FC = () => {
  const { user, loading, isPasswordVerified, isOtpVerified } = useContext(AuthContext) as {
    user: IUser | null | undefined;
    loading: boolean;
    isPasswordVerified: boolean;
    isOtpVerified: boolean;
  };

  const [savedContact, setSavedContact] = useState<string | null>(null);
  const [Token, setToken] = useState<string | null>(null);
  // 🔹 Get saved email/phone from AsyncStorage
  useEffect(() => {
    const loadSavedContact = async () => {
      try {
     // await AsyncStorage.removeItem(EMAIL_PHONE_KEY);
        const value = await AsyncStorage.getItem(EMAIL_PHONE_KEY);
         //     await AsyncStorage.removeItem(USER_KEY);
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        setToken(token);
        setSavedContact(value);
      } catch (err) {
        console.error('Error loading saved contact:', err);
      }
    };
    loadSavedContact();
  }, []);

  // 🔄 Loading screen
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  // 🟡 CASE 1: First time open (no user, no contact)
// NEW (covers both cases)
if (!user) {
  return <AuthNavigator />;
}


  // 🟡 CASE 2: Tried login, user not found in DB (undefined) but has entered email/phone
  if (user === null && savedContact) {
    return <SignUpScreen savedContact={savedContact}/>;
  }

  // 🟡 CASE 3: Still no user, go to Auth flow
  if (!user) {
    return <AuthNavigator />;
  }

  // ✅ CASE 4: User exists → route by role
  const roles = Array.isArray(user.roles) ? user.roles : [];

  // 👨‍🏫 Admin / Teacher
  if (roles.includes('Admin') || roles.includes('Teacher')) {
    if (!isPasswordVerified && Token== null) {
      return <PasswordScreen user={user} />;
    }
    if (!isOtpVerified && Token== null) {
      return <VerifyOtpScreen user={user} />;
    }
    return <AdminNavigator />;
  }

  // 👨‍🎓 Student
  if (roles.includes('Student')) {
    if (!isOtpVerified && Token== null) {

      return <VerifyOtpScreen user={user} />;
    }
    return <StudentNavigator />;
  }

  // ❌ Unknown role
  Alert.alert('Login', 'Unknown role, please contact administrator.');
  return <AuthNavigator />;
};

export default AppNavigator;
