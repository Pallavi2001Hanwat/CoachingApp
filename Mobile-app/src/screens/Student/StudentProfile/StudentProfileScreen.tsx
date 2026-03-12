import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getAll_userProfile } from '../../../api/studentApi/UserProfile';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StudentProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation();

  // ---------------- HEADER ----------------
  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    try {
      const res = await getAll_userProfile();

      if (res?.success) {
        setUser(res.User);
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---------------- LOADING & EMPTY STATE ----------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No profile data found</Text>
      </View>
    );
  }

  // ---------------- PROFILE UI ----------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>
          {user.FirstName} {user.LastName}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.Email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user.Phone}</Text>
      </View>
    </View>
  );
};

export default StudentProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
