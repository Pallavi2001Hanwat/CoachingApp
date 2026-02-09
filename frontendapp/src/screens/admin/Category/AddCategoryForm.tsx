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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { createCategory, getCategoryById, updateCategory } from '@/src/api/adminApi/CategoryApi';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const AddCategoryForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { CategoryId } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryCode, setCategoryCode] = useState('');
    const [description, setDescription] = useState('');
    const [image, setimage] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    // ✅ Load Category details if editing
    useEffect(() => {
        if (CategoryId) {
            loadCategoryDetails(CategoryId);
        }
    }, [CategoryId]);

    const loadCategoryDetails = async (id: string) => {
        try {
            setLoading(true);
            const res = await getCategoryById(id);
            if (res && res.success) {
                const cat = res.category;
                setCategoryName(cat.CategoryName || '');
                setCategoryCode(cat.CategoryCode || '');
                setDescription(cat.Description || '');
                setimage(cat.Image || '');
                setStatus(cat.Status || 'Active');
            } else {
                Alert.alert('Failed to load category details');
            }
        } catch (err) {
            console.log('Error loading Category details:', err);
            Alert.alert('Error loading Category details');
        } finally {
            setLoading(false);
        }
    };

     const handleSelectImage = async () => {
        try {
          // Request permission
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'You need to allow access to your gallery!');
            return;
          }
    
          // ✅ Use universal compatible media type option
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ works in all stable SDKs
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true, // no need for extra FileSystem calls
          });
    
          if (!result.canceled) {
            const selectedAsset = result.assets[0];
            const imageUri = selectedAsset.uri;
    
            // ✅ Use built-in base64 if available
            const base64Image = selectedAsset.base64
              ? `data:image/jpeg;base64,${selectedAsset.base64}`
              : imageUri;
    
            setimage(base64Image);
            console.log('✅ Image selected and ready to upload');
          }
        } catch (error) {
          console.error('❌ Error selecting image:', error);
          Alert.alert('Error', 'Failed to pick image');
        }
      };

    // ✅ Add or Update handler
    const handleSaveCategory = async () => {
        if (!categoryName || !categoryCode) {
            Alert.alert('Please fill Category Name and Code');
            return;
        }

        try {
            const CategoryData = {
                CategoryName: categoryName,
                CategoryCode: categoryCode,
                Description: description,
                Image:image,
                Status: status,
            };

            if (CategoryId) {
                const res = await updateCategory(CategoryId, CategoryData);
                if (res && res.success) {
                    Alert.alert('✅ Category updated successfully');
                }
            } else {
                const res = await createCategory(CategoryData);
                if (res && res.success) {
                    Alert.alert('✅ Category added successfully');
                }
            }

            navigation.goBack();
        } catch (error) {
            console.log('Save Category error:', error);
            Alert.alert('❌ Failed to save Category');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.heading}>
                    {CategoryId ? 'Edit Category' : 'Add New Category'}
                </Text>

                <TextInput
                    placeholder="Category Name"
                    placeholderTextColor="#000"
                    value={categoryName}
                    onChangeText={setCategoryName}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Category Code"
                    placeholderTextColor="#000"
                    value={categoryCode}
                    onChangeText={setCategoryCode}
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

                 {/* ✅  Image Selection and Preview */}
                        <View style={{ marginBottom: 16 }}>
                          <Text style={styles.label}> Image</Text>
                
                          <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                            <Text style={styles.imageButtonText}>
                              {image ? 'Change Image' : 'Select Image'}
                            </Text>
                          </TouchableOpacity>
                
                          {image ? (
                            <Image
                              source={{ uri: image }}
                              style={{
                                width: '100%',
                                height: 180,
                                marginTop: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#ccc',
                              }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ color: '#999', marginTop: 6 }}>No image selected</Text>
                          )}
                        </View>

                {/* ✅ Status Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Status</Text>
                    <Picker
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Active" value="Active" />
                        <Picker.Item label="Inactive" value="Inactive" />
                        
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveCategory} disabled={loading}>
                    <Text style={styles.buttonText}>
                        {CategoryId ? 'Update Category' : 'Add Category'}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddCategoryForm;

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
    arrow: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -8 }],
        color: '#5d3fd3',
        fontSize: 14,
        pointerEvents: 'none',
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
});
