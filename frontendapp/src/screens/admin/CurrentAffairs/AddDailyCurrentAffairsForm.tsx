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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import {
  createDailyCurrentAffairs,
  getDailyCurrentAffairsById,
  updateDailyCurrentAffairs,
} from '@/src/api/adminApi/CurrentAffairs';

const AddDailyCurrentAffairsForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { DailyCurrentAffairId } = route.params || {};

  const [loading, setLoading] = useState(false);

  // ------------------ FORM FIELDS ------------------
  const [Title, setTitle] = useState('');
  const [Date, setDate] = useState('');
  const [PdfUrl, setPdfUrl] = useState('');
  const [PdfTitle, setPdfTitle] = useState('');
  const [VideoUrl, setVideoUrl] = useState('');
  const [VideoTitle, setVideoTitle] = useState('');
  const [Status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    if (DailyCurrentAffairId) loadDailyCurrentAffairsDetails(DailyCurrentAffairId);
  }, [DailyCurrentAffairId]);

  const loadDailyCurrentAffairsDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getDailyCurrentAffairsById(id);
      if (res?.success) {
        const t = res.data;
        setTitle(t.Title || '');
        setDate(t.Date ? t.Date.split('T')[0] : '');
        setPdfUrl(t.PdfUrl || '');
        setPdfTitle(t.PdfTitle || '');
        setVideoUrl(t.VideoUrl || '');
        setVideoTitle(t.VideoTitle || '');
        setStatus(t.Status || 'Active');
      }
    } catch (err) {
      Alert.alert('Error loading DailyCurrentAffairs details');
    } finally {
      setLoading(false);
    }
  };

  // ------------------ DOCUMENT PICKERS ------------------
  const uriToBase64 = async (uri: string, mimeType: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    return `data:${mimeType};base64,${base64}`;
  };

  const handleVideoPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 20 * 1024 * 1024) {
          Alert.alert('Video too large (max 20MB)');
          return;
        }

        const base64Video = await uriToBase64(asset.uri, asset.mimeType || 'video/mp4');
        setVideoUrl(base64Video);
        setVideoTitle(asset.name);
      }
    } catch (error) {
      Alert.alert('Error picking video');
    }
  };

  const handlePdfPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('PDF too large (max 10MB)');
          return;
        }

        const base64Pdf = await uriToBase64(asset.uri, 'application/pdf');
        setPdfUrl(base64Pdf);
        setPdfTitle(asset.name);
      }
    } catch (error) {
      Alert.alert('Error picking PDF');
    }
  };

  // ------------------ SAVE ------------------
  const handleSaveDailyCurrentAffairs = async () => {
    if (!Title || !Date) {
      Alert.alert('Please fill all required fields');
      return;
    }

    try {
      const payload: any = {
        Title,
        Date,
        Status,
      };

      // Only include PDF if user selected a new one
      if (PdfUrl && PdfUrl.startsWith('data:')) {
        payload.PdfUrl = PdfUrl;
        payload.PdfTitle = PdfTitle;
      }

      // Only include Video if user selected a new one
      if (VideoUrl && VideoUrl.startsWith('data:')) {
        payload.VideoUrl = VideoUrl;
        payload.VideoTitle = VideoTitle;
      }

      let res;
      if (DailyCurrentAffairId) {
        res = await updateDailyCurrentAffairs(DailyCurrentAffairId, payload);
      } else {
        res = await createDailyCurrentAffairs(payload);
      }

      if (res?.success) {
        Alert.alert(DailyCurrentAffairId ? 'Updated successfully' : 'Added successfully');
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error saving data');
    }
  };

  // ------------------ UI ------------------
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {DailyCurrentAffairId ? 'Edit Daily Current Affairs' : 'Add New Daily Current Affairs'}
        </Text>

        {/* TITLE */}
        <TextInput
          placeholder="Title"
          placeholderTextColor="#000"
          value={Title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* DATE */}
        <TextInput
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#000"
          value={Date}
          onChangeText={setDate}
          style={styles.input}
        />

        {/* PDF PICKER */}
        <TouchableOpacity style={styles.imageButton} onPress={handlePdfPick}>
          <Text style={styles.imageButtonText}>{PdfUrl ? 'Change PDF' : 'Select PDF'}</Text>
        </TouchableOpacity>
        {PdfUrl ? <Text style={{ marginBottom: 10 }}>Selected PDF: {PdfTitle}</Text> : null}

        {/* VIDEO PICKER */}
        <TouchableOpacity style={styles.imageButton} onPress={handleVideoPick}>
          <Text style={styles.imageButtonText}>{VideoUrl ? 'Change Video' : 'Select Video'}</Text>
        </TouchableOpacity>
        {VideoUrl ? <Text style={{ marginBottom: 10 }}>Selected Video: {VideoTitle}</Text> : null}

        {/* STATUS */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Status</Text>
          <Picker selectedValue={Status} onValueChange={setStatus} style={styles.picker}>
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleSaveDailyCurrentAffairs}>
          <Text style={styles.buttonText}>
            {DailyCurrentAffairId ? 'Update' : 'Add'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddDailyCurrentAffairsForm;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#000' },
  input: { borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, padding: 12, marginBottom: 12, color: '#000', backgroundColor: '#fff' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: '#000', paddingLeft: 8, paddingTop: 6 },
  pickerContainer: { borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, marginBottom: 12, backgroundColor: '#fff' },
  picker: { color: '#000', backgroundColor: '#fff' },
  button: { backgroundColor: '#5d3fd3', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  imageButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, padding: 12, alignItems: 'center', marginBottom: 10 },
  imageButtonText: { color: '#5d3fd3', fontWeight: '600' },
});
