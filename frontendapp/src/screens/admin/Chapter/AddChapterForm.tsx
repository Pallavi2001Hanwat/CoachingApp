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
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    createChapter,
    getChapterById,
    updateChapter,
} from '@/src/api/adminApi/ChapterApi';

import { getAllSubjects } from '@/src/api/adminApi/SubjectApi';

const AddChapterForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { ChapterId } = route.params || {};

    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState<any[]>([]);

    const [image, setimage] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    // 🔹 Load subjects
    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const res = await getAllSubjects();
            if (res?.success) setSubjects(res.Subjects);
        } catch (error) {
            console.log("Error loading subjects:", error);
        }
    };

    // 🔹 Load existing chapter details
    useEffect(() => {
        if (ChapterId) {
            loadChapterDetails(ChapterId);
        }
    }, [ChapterId]);

    const loadChapterDetails = async (id: string) => {
        try {
            setLoading(true);
            const res = await getChapterById(id);
            if (res?.success) {
                const chapter = res.Chapter;

                setTitle(chapter.Title || '');
                setDescription(chapter.Description || '');
                 setimage(chapter.Image || '');
                setSubjectId(chapter.SubjectId || '');
                setStatus(chapter.Status || 'Active');
            } else {
                Alert.alert("Failed to load Chapter");
            }
        } catch (error) {
            console.log("Error loading chapter:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Image Picker
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
    // 🔹 Save Chapter
    const handleSaveChapter = async () => {
        if (!title || !subjectId) {
            Alert.alert("Please fill required fields");
            return;
        }

        const chapterData = {
            Title: title,
            Description: description,
            SubjectId: subjectId,
            Image:image,
            Status: status
        };

        try {
            let res;

            if (ChapterId) {
                res = await updateChapter(ChapterId, chapterData);
            } else {
                res = await createChapter(chapterData);
            }

            if (res?.success) {
                Alert.alert(`Chapter ${ChapterId ? 'updated' : 'added'} successfully`);
                navigation.goBack();
            }
        } catch (error) {
            console.log("Save Error:", error);
            Alert.alert("Failed to save chapter");
        }
    };

    return (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.heading}>
        {ChapterId ? 'Edit Chapter' : 'Add New Chapter'}
      </Text>

      {/* Chapter Title */}
      <TextInput
        placeholder="Chapter Title *"
        placeholderTextColor="#000"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* Description */}
      <TextInput
        placeholder="Description"
        placeholderTextColor="#000"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
      />

      {/* Subject Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Subject *</Text>
        <Picker
          selectedValue={subjectId}
          onValueChange={setSubjectId}
          style={styles.picker}
        >
          <Picker.Item label="Select Subject" value="" />
          {subjects.map((s) => (
            <Picker.Item key={s._id} label={s.Title} value={s._id} />
          ))}
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* Image Selection */}
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

      {/* Status */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Status</Text>
        <Picker
          selectedValue={status}
          onValueChange={setStatus}
          style={styles.picker}
        >
          <Picker.Item label="Active" value="Active" />
          <Picker.Item label="Inactive" value="Inactive" />
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveChapter}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {ChapterId ? 'Update Chapter' : 'Add Chapter'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  </KeyboardAvoidingView>
);

};

export default AddChapterForm;

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

