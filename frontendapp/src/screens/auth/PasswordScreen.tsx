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
import { AuthContext } from '../../context/AuthContext';
import { saveToken, saveUser } from '../../services/storageService';
import type { IUser } from '../../Interface/IUser';

interface PasswordScreenProps {
  user: IUser;
}

const PasswordScreen: React.FC<PasswordScreenProps> = ({ user }) => {

  const { verifyUserPassword } = useContext(AuthContext);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Validation', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Email: user?.email || undefined,
        Phone: user?.phone || undefined, // 👈 lowercase to match your IUser
        Password: password,
      };

      const res = await verifyUserPassword(payload);
      const { user: loggedInUser } = res;

      if (loggedInUser) {
        await saveUser(loggedInUser);
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid password';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your Password</Text>
      <Text style={styles.subtitle}>{user?.email || user?.phone}</Text>

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handlePasswordSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
    marginBottom: 20,
    color: '#555',
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
