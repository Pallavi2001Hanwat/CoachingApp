// src/screens/auth/VerifyOtpScreen.tsx
import React, { useState,useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { saveUser ,saveToken} from '@/src/services/storageService';

import type { IUser } from '../../Interface/IUser';

interface PasswordScreenProps {
  user: IUser;
}

const VerifyOtpScreen : React.FC<PasswordScreenProps> = ({ user }) => {

 

  const { verifyOtpCode } = useContext(AuthContext);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {


    if (!otp.trim()) {
      Alert.alert('Validation', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
       const payload = {
        Otp:otp,
        Email:user?.email,
        Phone: user?.phone
      };
    
     const res = await verifyOtpCode(payload);
       const { user: loggedInUser } = res;
     const { token } = res; 
      await saveUser(loggedInUser);
      await saveToken(token)

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      // await resendOtpApi({ email: user.email, phone: user.Phone });
      Alert.alert('Success', 'OTP resent successfully');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        OTP sent to {user?.email || user?.phone}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="numeric"
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOtp}>
        <Text style={styles.resend}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2f6bed',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resend: {
    color: '#2f6bed',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
