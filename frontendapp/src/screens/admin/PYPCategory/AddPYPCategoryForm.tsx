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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  createPYPCategory,
  getPYPCategoryById,
  updatePYPCategory,
} from '@/src/api/adminApi/PreviousYearPapaerCategory';

const AddPYPCategoryForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { PYPCategoryId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // ✅ Load category for edit
  useEffect(() => {
    if (PYPCategoryId) {
      loadPYPCategoryDetails(PYPCategoryId);
    }
  }, [PYPCategoryId]);

  const loadPYPCategoryDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getPYPCategoryById(id);

      if (res?.success) {
        const cat = res.Category;
        setTitle(cat.Title);
        setImage(cat.Image);
        setStatus(cat.Status);
      } else {
        Alert.alert('Failed to load category');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error loading category');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Image Picker
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const base64Image = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      setImage(base64Image);
    }
  };

  // ✅ Save Handler
  const handleSave = async () => {
    if (!title || !image) {
      Alert.alert('Title and Image are required');
      return;
    }

    try {
      const payload = {
        Title: title,
        Image: image,
        Status: status,
      };

      if (PYPCategoryId) {
        await updatePYPCategory(PYPCategoryId, payload);
        Alert.alert('✅ Category updated successfully');
      } else {
        await createPYPCategory(payload);
        Alert.alert('✅ Category created successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('❌ Failed to save category');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          {PYPCategoryId ? 'Update PYP Category' : 'Add PYP Category'}
        </Text>

        {/* Title */}
        <TextInput
          placeholder="Category Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor="#000"
        />

        {/* Image */}
        <Text style={styles.label}>Category Image</Text>
        <TouchableOpacity style={styles.imageBtn} onPress={handleSelectImage}>
          <Text style={styles.imageBtnText}>
            {image ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>

        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : null}

        {/* Status */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={status}
            onValueChange={(v) => setStatus(v)}
          >
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {PYPCategoryId ? 'Update Category' : 'Create Category'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPYPCategoryForm;


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

  imageButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },

  imageButtonText: {
    color: '#5d3fd3',
    fontWeight: '600',
  },

  previewImage: {
    width: '100%',
    height: 180,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  noImageText: {
    color: '#999',
    marginTop: 6,
  },
});

