import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createUser, getUserById, updateUser } from '@/src/api/adminApi/UsersApi';

const AddUserForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ Load user details if editing
  useEffect(() => {
    if (userId) {
      loadUserDetails(userId);
    }
  }, [userId]);

  const loadUserDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      if(res.success){
        const user = res.User
setFirstName(user.FirstName || '');
      setLastName(user.LastName || '');
      setEmail(user.Email || '');
      setPhone(user.Phone || '');
      setAlternatePhone(user.AlternatePhone || '');
      setGender(user.Gender || '');
      setDateOfBirth(user.DateOfBirth ? new Date(user.DateOfBirth) : null);
      setIsActive(user.IsActive ?? true);
      setIsAdmin(user.IsAdmin ?? false);
      setIsTeacher(user.IsTeacher ?? false);
      }
      
    } catch (err) {
      console.log('Error loading user details:', err);
      Alert.alert('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add or Update handler
  const handleSaveUser = async () => {
    if (!firstName || !lastName || !email || (!userId && !password)) {
      Alert.alert('Please fill all required fields');
      return;
    }

    try {
      const userData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        AlternatePhone: alternatePhone,
        Gender: gender,
        Password: password,
        DateOfBirth: dateOfBirth,
        IsActive: isActive,
        IsAdmin: isAdmin,
        IsTeacher: isTeacher,
      };

      if (userId) {
        const res = await updateUser(userId, userData);
        if (res.success) {
          Alert.alert('✅ User updated successfully');
        }

      } else {
        const res = await createUser(userData);
        if (res.success) {
          Alert.alert('✅ User added successfully');
        }

      }

      navigation.goBack();
    } catch (error) {
      console.log('Save user error:', error);
      Alert.alert('❌ Failed to save user');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

 return (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.heading}>
        {userId ? 'Edit User' : 'Add New User'}
      </Text>

      <TextInput
        placeholder="First Name"
        placeholderTextColor="#000"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />

      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#000"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#000"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TextInput
        placeholder="Alternate Phone"
        placeholderTextColor="#000"
        keyboardType="phone-pad"
        value={alternatePhone}
        onChangeText={setAlternatePhone}
        style={styles.input}
      />

      {/* ✅ Gender Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={gender}
          onValueChange={setGender}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {!userId && (
        <TextInput
          placeholder="Password"
          placeholderTextColor="#000"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      )}

      {/* 📅 Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View pointerEvents="none">
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#000"
            value={dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : ''}
            editable={false}
            style={styles.input}
          />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {/* ✅ Switches */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Active User</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Is Admin</Text>
        <Switch value={isAdmin} onValueChange={setIsAdmin} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Is Teacher</Text>
        <Switch value={isTeacher} onValueChange={setIsTeacher} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveUser}>
        <Text style={styles.buttonText}>
          {userId ? 'Update User' : 'Add User'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  </KeyboardAvoidingView>
);


};

export default AddUserForm;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
  },

  input: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    color: '#000',
    backgroundColor: '#fff',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
    paddingLeft: 8,
    paddingTop: 6,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  picker: {
    color: '#000',
    backgroundColor: '#fff',
  },

  arrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    color: '#5d3fd3',
    fontSize: 14,
    pointerEvents: 'none',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  button: {
    backgroundColor: '#5d3fd3',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

