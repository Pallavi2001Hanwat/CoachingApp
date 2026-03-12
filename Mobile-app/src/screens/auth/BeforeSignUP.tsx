// src/screens/auth/BeforeSignUPScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { saveUser, saveEmailOrPhone } from '../../services/storageService';

const BeforeSignUPScreen = () => {
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

  const handleContinue = async () => {
    try {
      if (showPhoneInput) {
        if (!phoneNumber) {
          Alert.alert('Validation', 'Please enter your mobile number');
          return;
        }
        const fullPhone = `${callingCode}${phoneNumber}`;
        setLoading(true);
        const res = await signIn({ Phone: fullPhone });
        if (!res.data?.user) saveUser(undefined);
        else saveUser(res.data.user);
        await saveEmailOrPhone(undefined, fullPhone);
      } else {
        if (!Email) {
          Alert.alert('Validation', 'Please enter your email');
          return;
        }
        setLoading(true);
        const res = await signIn({ Email: Email.trim() });
        if (!res.data?.user) saveUser(undefined);
        else saveUser(res.data.user);
        await saveEmailOrPhone(Email.trim(), undefined);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPhoneInput(!showPhoneInput)}>
              <Text style={styles.toggleText}>
                {showPhoneInput ? 'Use Email Instead' : 'Use Mobile Instead'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create your Account</Text>
            <Text style={styles.subtitle}>
              {showPhoneInput
                ? 'Enter your mobile number to receive OTP'
                : 'Enter your email to receive OTP'}
            </Text>
          </View>

          {/* Input Section */}
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
            </View>
          ) : (
            <TextInput
              placeholder="Enter email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={Email}
              onChangeText={setEmail}
              style={styles.input}
            />
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BeforeSignUPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backText: {
    color: '#2f6bed',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#2f6bed',
    fontSize: 14,
    fontWeight: '500',
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  phoneContainer: {
    marginBottom: 20,
  },
  countryPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2f6bed',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#555',
    fontSize: 15,
  },
  footerLink: {
    color: '#2f6bed',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
});
