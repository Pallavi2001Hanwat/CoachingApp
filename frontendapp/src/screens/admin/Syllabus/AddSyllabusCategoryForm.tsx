import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  createSyllabusCategory,
  getSyllabusCategoryById,
  updateSyllabusCategory,
} from '@/src/api/adminApi/SyllabusApi';

const AddSyllabusCategoryForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { SyllabusCategoryId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // ✅ Load category details if editing
  useEffect(() => {
    if (SyllabusCategoryId) {
      loadCategoryDetails(SyllabusCategoryId);
    }
  }, [SyllabusCategoryId]);

  const loadCategoryDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getSyllabusCategoryById(id);

      if (res && res.success) {
        const category = res.SyllabusCategory;
        setCategoryName(category.CategoryName || '');
        setDescription(category.Description || '');
        setStatus(category.Status || 'Active');
      } else {
        Alert.alert('Failed to load category details');
      }
    } catch (error) {
      console.log('Load category error:', error);
      Alert.alert('Error loading category');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save handler
  const handleSaveCategory = async () => {
    if (!categoryName) {
      Alert.alert('Please enter category name');
      return;
    }

    try {
      const categoryData = {
        CategoryName: categoryName,
        Description: description,
        Status: status,
      };

      if (SyllabusCategoryId) {
        const res = await updateSyllabusCategory(SyllabusCategoryId, categoryData);
        if (res && res.success) {
          Alert.alert('✅ Category updated successfully');
        }
      } else {
        const res = await createSyllabusCategory(categoryData);
        if (res && res.success) {
          Alert.alert('✅ Category created successfully');
        }
      }

      navigation.goBack();
    } catch (error) {
      console.log('Save category error:', error);
      Alert.alert('❌ Failed to save category');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {SyllabusCategoryId ? 'Edit Syllabus Category' : 'Add Syllabus Category'}
        </Text>

        <TextInput
          placeholder="Category Name"
          placeholderTextColor="#000"
          value={categoryName}
          onChangeText={setCategoryName}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          placeholderTextColor="#000"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        {/* ✅ Status Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={status}
            onValueChange={(val) => setStatus(val)}
            style={styles.picker}
          >
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveCategory}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {SyllabusCategoryId ? 'Update Category' : 'Add Category'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddSyllabusCategoryForm;


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

  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
