// src/services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@app_token';
const USER_KEY = '@app_user';
const EMAIL_PHONE_KEY = '@app_user_contact';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  return t;
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const saveUser = async (user: any) => {
  const USER_KEY = '@app_user';
  try {
    if (user === undefined || user === null) {
      // 🔹 agar user nahi hai to storage se hata do
      await AsyncStorage.removeItem(USER_KEY);
     

    }
     else {
      // 🔹 warna user ko save karo
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};



export const saveEmailOrPhone = async (Email?: string, Phone?: string) => {
  try {
    const value = Email || Phone;
    if (value) {
      await AsyncStorage.setItem(EMAIL_PHONE_KEY, value);
     
    } else {
      await AsyncStorage.removeItem(EMAIL_PHONE_KEY);
    }
  } catch (error) {
    console.error('Error saving email or phone:', error);
  }
};



export const loadUser = async () => {
  const USER_KEY = '@app_user';
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};


export const getUser = async (): Promise<any | null> => {
  const s = await AsyncStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(EMAIL_PHONE_KEY);
};

export const clearAll = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};
