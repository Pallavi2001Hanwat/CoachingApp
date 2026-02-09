// src/screens/auth/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import MainLogo from '../../assets/images/main-logo.png';
import SideImage from '../../assets/images/main-img-2.png';
import { saveToken, saveUser, saveEmailOrPhone } from '../../services/storageService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  const [Email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState<string>('+91');

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode('+' + country.callingCode[0]);
  };

  const handleLogin = async () => {
    try {
      if (showPhoneInput) {
        if (!phoneNumber) {
          Alert.alert('Validation', 'Please enter your mobile number');
          return;
        }
        const fullPhone = `${callingCode}${phoneNumber}`;
        setLoading(true);
        const res = await signIn({ Phone: fullPhone });
        if (!res.data?.user) {
          saveUser(undefined);
        } else {
          saveUser(res.data.user);
        }
        await saveEmailOrPhone(undefined, fullPhone);
      } else {
        if (!Email) {
          Alert.alert('Validation', 'Please enter your email');
          return;
        }
        setLoading(true);
        const res = await signIn({ Email: Email.trim() });
        if (!res.data?.user) {
          saveUser(undefined);
        } else {
          saveUser(res.data.user);
        }
        await saveEmailOrPhone(Email.trim(), undefined);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      Alert.alert('Login error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
  navigation.navigate('BeforeSignUPScreen' as never);
};
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image source={MainLogo} style={styles.logo} />
            <TouchableOpacity onPress={() => setShowPhoneInput(!showPhoneInput)}>
              <Text style={styles.signInWith}>
                {showPhoneInput ? 'Sign in with Email' : 'Sign in with Mobile'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.textSection}>
              <Text style={styles.title}>Welcome to our App!</Text>
              <Text style={styles.subtitle}>Sign in</Text>
            </View>
            <Image source={SideImage} style={styles.sideImage} />
          </View>

          {/* Login Input Section */}
          {showPhoneInput ? (
            <View style={styles.phoneContainer}>
              <View style={styles.countryPickerRow}>
                <CountryPicker
                  countryCode={countryCode}
                  withCallingCodeButton
                  withFilter
                  withFlag
                  withEmoji
                  onSelect={onSelect}
                />
                <TextInput
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.phoneInput}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                placeholder="Enter email address"
                autoCapitalize="none"
                keyboardType="email-address"
                value={Email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Register Button at Bottom */}
          <View style={styles.bottomSection}>
            <Text style={styles.bottomText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  signInWith: {
    color: '#2f6bed',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
  },
  sideImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  phoneContainer: {
    marginBottom: 20,
  },
  countryPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2f6bed',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomSection: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  bottomText: {
    color: '#555',
    fontSize: 15,
  },
  registerText: {
    color: '#2f6bed',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
});
