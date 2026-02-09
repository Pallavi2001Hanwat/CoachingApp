import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
//import Icon from 'react-native-vector-icons/Ionicons';


const ContactUsScreen = () => {
  const email = 'pallavihanwat000@gmail.com';
  const phone = '7566203077';

  const openEmail = () => {
    Linking.openURL(`mailto:${email}`)
      .catch(() => {
        Alert.alert('Error', 'Unable to open email app');
      });
  };

  const openPhone = () => {
    Linking.openURL(`tel:${phone}`)
      .catch(() => {
        Alert.alert('Error', 'Unable to open phone app');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <TouchableOpacity style={styles.card} onPress={openEmail}>
        <Text style={styles.text}>{email}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={openPhone}>
        <Text style={styles.text}>{phone}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactUsScreen;





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 25,
    elevation: 3,
  },
  text: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
