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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  createSubject,
  getSubjectById,
  updateSubject,
} from '@/src/api/adminApi/SubjectApi';

const AddSubjectForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { SubjectId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [image, setimage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');




  // ✅ Load Subject details if editing
  useEffect(() => {
    if (SubjectId) {
      loadSubjectDetails(SubjectId);
    }
  }, [SubjectId]);

  const loadSubjectDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getSubjectById(id);
      if (res && res.success) {
        const Subject = res.Subject;
        setTitle(Subject.Title || '');
        setDescription(Subject.Description || '');
        setSubjectCode(Subject.SubjectCode)

        setimage(Subject.Image || '');
        setStatus(Subject.Status || 'Active');

      } else {
        Alert.alert('Failed to load Subject details');
      }
    } catch (err) {
      console.log('Error loading Subject details:', err);
      Alert.alert('Error loading Subject details');
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


  // ✅ Save handler
  const handleSaveSubject = async () => {
    if (!title || !description) {
      Alert.alert('Please fill all required fields');
      return;
    }

    try {
      const SubjectData = {
        Title: title,
        Description: description,
        SubjectCode: subjectCode,
        Image: image,
        Status: status,
      };

      if (SubjectId) {
        const res = await updateSubject(SubjectId, SubjectData);
        if (res && res.success) {
          Alert.alert('✅ Subject updated successfully');
        }
      } else {
        const res = await createSubject(SubjectData);
        if (res && res.success) {
          Alert.alert('✅ Subject added successfully');
        }
      }

      navigation.goBack();
    } catch (error) {
      console.log('Save Subject error:', error);
      Alert.alert('❌ Failed to save Subject');
    }
  };

 return (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.heading}>
        {SubjectId ? 'Edit Subject' : 'Add New Subject'}
      </Text>

      <TextInput
        placeholder="Subject Title"
        placeholderTextColor="#000"
        value={title}
        onChangeText={setTitle}
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

      <TextInput
        placeholder="Subject Code"
        placeholderTextColor="#000"
        value={subjectCode}
        onChangeText={setSubjectCode}
        style={styles.input}
      />

      {/* ✅ Image Selection */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Image</Text>

        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
          <Text style={styles.imageButtonText}>
            {image ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>

        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.noImageText}>No image selected</Text>
        )}
      </View>

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
        onPress={handleSaveSubject}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {SubjectId ? 'Update Subject' : 'Add Subject'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  </KeyboardAvoidingView>
);
};

export default AddSubjectForm;

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

