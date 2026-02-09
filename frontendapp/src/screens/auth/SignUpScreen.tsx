// src/screens/auth/SignupScreen.tsx
import React, { useState, useContext } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, saveUser } from '../../services/storageService'; // for auto login after signup
import { AuthContext } from '../../context/AuthContext';


const SignupScreen = ({ savedContact }: { savedContact?: string }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const { signUp } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(savedContact?.includes('@') ? savedContact : '');
  const [phone, setPhone] = useState(!savedContact?.includes('@') ? savedContact : '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !otp || (!email && !phone)) {
      Alert.alert('Validation', 'Please fill all required fields including OTP');
      return;
    }

    setLoading(true);
    try {
      // ✅ Call backend signup API

      const payload = {
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        Email: email || null,
        Phone: phone || null,
        Otp: otp.trim(),
      };
      const res = await signUp(payload);

      const { token, user } = res;

      if (token && user) {
        await saveToken(token);
        await saveUser(user);
        Alert.alert('Success', 'Signup successful! You are now logged in.');
        navigation.navigate('HomeScreen' as never);
      } else {
        Alert.alert('Error', 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Signup failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  
const EMAIL_PHONE_KEY = '@app_user_contact';
const handleSignIn = async () => {
  console.log(EMAIL_PHONE_KEY)
  await AsyncStorage.removeItem(EMAIL_PHONE_KEY);

    navigation.navigate('Login' as never);

};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Account</Text>

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />

      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        editable={!savedContact?.includes('@')}
        keyboardType="email-address"
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone"
        value={phone}
        editable={savedContact?.includes('@') ? true : false}
        keyboardType="phone-pad"
        onChangeText={setPhone}
        style={styles.input}
      />

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

  <TouchableOpacity onPress={handleSignIn}>
  <Text>Sign In</Text>
</TouchableOpacity>



    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2f6bed',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkText: {
    color: '#2f6bed',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 15,
  },
});
