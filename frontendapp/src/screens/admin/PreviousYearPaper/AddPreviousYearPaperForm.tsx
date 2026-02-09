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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  createPreviousYearPaper,
  getPreviousYearPaperById,
  updatePreviousYearPaper,
} from '@/src/api/adminApi/PreviousYearPaper';

import { getAllPYPCategories } from '@/src/api/adminApi/PreviousYearPapaerCategory';

const AddPreviousYearPaperForm = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { PreviousYearPaperId } = route.params || {};

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [PYPCategoryId, setPYPCategoryId] = useState('');

  const [PaperTitle, setPaperTitle] = useState('');
  const [PaperCode, setPaperCode] = useState('');
  const [Year, setYear] = useState('');
  const [Stage, setStage] = useState('');
  const [Shift, setShift] = useState('');
  const [Language, setLanguage] = useState('');
  const [TotalQuestions, setTotalQuestions] = useState('');
  const [TotalMarks, setTotalMarks] = useState('');
  const [TimeDuration, setTimeDuration] = useState('');
  const [PaperFileUrl, setPaperFileUrl] = useState('');
  const [Status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Load Categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllPYPCategories();
      if (res?.success && Array.isArray(res.Categories)) {
        setCategories(res.Categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.log('Load categories error:', err);
      setCategories([]);
    }
  };

  // Load Paper (Edit)
  useEffect(() => {
    if (PreviousYearPaperId) loadPaper(PreviousYearPaperId);
  }, [PreviousYearPaperId]);

 const loadPaper = async (id: string) => {
  setLoading(true);
  try {
    const res = await getPreviousYearPaperById(id);
    console.log(res)
    if (res?.success && res.Paper) {
      const p = res.Paper;
      console.log("pallavi",p.PYPCategoryId)
      setPYPCategoryId(p.PYPCategoryId); // <- FIX HERE
      setPaperTitle(p.PaperTitle || '');
      setPaperCode(p.PaperCode || '');
      setYear(String(p.Year || ''));
      setStage(p.Stage || '');
      setShift(p.Shift || '');
      setLanguage(p.Language || '');
      setTotalQuestions(String(p.TotalQuestions || ''));
      setTotalMarks(String(p.TotalMarks || ''));
      setTimeDuration(String(p.TimeDuration || ''));
      setPaperFileUrl(p.PaperFileUrl || '');
      setStatus(p.Status || 'Active');
    }
  } catch (err) {
    console.log('Load paper error:', err);
  } finally {
    setLoading(false);
  }
};


  // PDF picker + convert to Base64
  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        // Optional: limit PDF size (10MB)
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('PDF too large (max 10MB)');
          return;
        }

        const base64Pdf = await uriToBase64(asset.uri, 'application/pdf');
        setPaperFileUrl(base64Pdf);
      }
    } catch (error) {
      console.log('PDF pick error:', error);
      Alert.alert('Error picking PDF');
    }
  };

  const uriToBase64 = async (uri, mimeType) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
  
    return `data:${mimeType};base64,${base64}`;
  };

  // Save
  const handleSave = async () => {
    if (!PYPCategoryId || !PaperTitle || !PaperCode || !Year || !PaperFileUrl) {
      Alert.alert('Please fill all required fields');
      return;
    }

    const payload = {
      PYPCategoryId,
      PaperTitle,
      PaperCode,
      Year: Number(Year),
      Stage,
      Shift,
      Language,
      TotalQuestions: Number(TotalQuestions) || 0,
      TotalMarks: Number(TotalMarks) || 0,
      TimeDuration: Number(TimeDuration) || 0,
      PaperFileUrl,
      Status,
    };

    try {
      if (PreviousYearPaperId) {
        await updatePreviousYearPaper(PreviousYearPaperId, payload);
        Alert.alert('✅ Paper updated successfully');
      } else {
        await createPreviousYearPaper(payload);
        Alert.alert('✅ Paper created successfully');
      }
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert('❌ Failed to save paper');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          {PreviousYearPaperId ? 'Update Paper' : 'Add Previous Year Paper'}
        </Text>

        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
  <Picker
    selectedValue={PYPCategoryId}
    onValueChange={(value) => setPYPCategoryId(value)}
    style={{ color: PYPCategoryId ? '#000' : '#999' }} // selected color
  >
    <Picker.Item label="Select Category" value="" color="#999" />
    {categories?.map((cat) => (
      <Picker.Item key={cat._id} label={cat.Title} value={cat._id} color="#000" />
    ))}
  </Picker>
</View>


        {/* Text Inputs */}
        {[
          { placeholder: 'Paper Title', value: PaperTitle, setter: setPaperTitle },
          { placeholder: 'Paper Code', value: PaperCode, setter: setPaperCode },
          { placeholder: 'Year', value: Year, setter: setYear, keyboard: 'numeric' },
          { placeholder: 'Stage', value: Stage, setter: setStage },
          { placeholder: 'Shift', value: Shift, setter: setShift },
          { placeholder: 'Language', value: Language, setter: setLanguage },
          { placeholder: 'Total Questions', value: TotalQuestions, setter: setTotalQuestions, keyboard: 'numeric' },
          { placeholder: 'Total Marks', value: TotalMarks, setter: setTotalMarks, keyboard: 'numeric' },
          { placeholder: 'Time Duration (min)', value: TimeDuration, setter: setTimeDuration, keyboard: 'numeric' },
        ].map((item, idx) => (
          <TextInput
            key={idx}
            placeholder={item.placeholder}
            placeholderTextColor="#999"
            style={styles.input}
            value={item.value}
            keyboardType={item.keyboard || 'default'}
            onChangeText={item.setter}
          />
        ))}

        {/* PDF Picker */}
        <TouchableOpacity style={styles.fileBtn} onPress={handlePickPDF}>
          <Text style={styles.fileBtnText}>
            {PaperFileUrl ? 'Change PDF' : 'Select PDF'}
          </Text>
        </TouchableOpacity>
        {PaperFileUrl ? (
          <Text style={styles.fileName}>
            {PaperFileUrl.length > 100
              ? 'PDF selected'
              : PaperFileUrl.split('/').pop()}
          </Text>
        ) : null}

        {/* Status Picker */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={Status} onValueChange={setStatus}>
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {PreviousYearPaperId ? 'Update Paper' : 'Create Paper'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPreviousYearPaperForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
    paddingLeft: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  fileBtn: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#faf8ff',
  },
  fileBtnText: {
    color: '#5d3fd3',
    fontWeight: '600',
    fontSize: 15,
  },
  fileName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    paddingLeft: 6,
  },
  button: {
    backgroundColor: '#5d3fd3',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
