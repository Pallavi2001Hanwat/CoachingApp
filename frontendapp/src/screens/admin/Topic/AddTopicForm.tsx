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
    Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { getAllSubjects } from '@/src/api/adminApi/SubjectApi';
import { getChaptersBySubjectId } from '@/src/api/adminApi/ChapterApi';
import {
    createTopic,
    getTopicById,
    updateTopic,
} from '@/src/api/adminApi/TopicsApi';

const AddTopicForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { TopicId } = route.params || {};

    const [loading, setLoading] = useState(false);

    // ------------------ FORM FIELDS ------------------
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [VideoURL, setVideoURL] = useState('');
    const [Duration, setDuration] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [extraFiles, setExtraFiles] = useState<string[]>([]);
    const [classType, setClassType] = useState('');
    const [classOrder, setClassOrder] = useState('');
    const [duration, setDuration2] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [ChapterId, setChapterId] = useState('');
    const [SubjectId, setSubjectId] = useState('');
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [chapterList, setChapterList] = useState<any[]>([]);
    const [Status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    // ------------------ LOAD DATA ------------------
    useEffect(() => {
        loadSubjects();
        if (TopicId) loadTopicDetails(TopicId);
    }, [TopicId]);

    const loadSubjects = async () => {
        try {
            const res = await getAllSubjects();
            if (res.success) setSubjectList(res.Subjects);
        } catch (err) {
            Alert.alert("Failed to load subjects");
        }
    };

    const loadChapters = async (subjectId: string) => {
        try {
            const res = await getChaptersBySubjectId(subjectId);
            if (res.success) setChapterList(res.Chapters);
        } catch (err) {
            Alert.alert("Failed to load chapters");
        }
    };

    const loadTopicDetails = async (id: string) => {
        try {
            setLoading(true);
            const res = await getTopicById(id);
            if (res?.success) {
                const t = res.TopicOrClass;
                setTitle(t.Title || '');
                setDescription(t.Description || '');
                setVideoURL(t.VideoURL || '');
                setDuration(t.Duration?.toString() || '');
                setPdfUrl(t.pdfUrl || '');
                setExtraFiles(t.extraFiles || []);
                setClassType(t.classType || '');
                setClassOrder(t.classOrder?.toString() || '');
                setDuration2(t.duration?.toString() || '');
                setIsFree(!!t.isFree);
                setIsLocked(!!t.isLocked);
                setChapterId(t.ChapterId || '');
                setSubjectId(t.SubjectId || '');
                setStatus(t.Status || 'Active');
                if (t.SubjectId) await loadChapters(t.SubjectId);
            }
        } catch (err) {
            Alert.alert('Error loading Topic details');
        } finally {
            setLoading(false);
        }
    };

    // ------------------ DOCUMENT PICKERS ------------------
const uriToBase64 = async (uri, mimeType) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

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

      // OPTIONAL size limit (20MB)
      if (asset.size && asset.size > 20 * 1024 * 1024) {
        Alert.alert('Video too large (max 20MB)');
        return;
      }

      const base64Video = await uriToBase64(
        asset.uri,
        asset.mimeType || 'video/mp4'
      );

      setVideoURL(base64Video);
    }
  } catch (error) {
    console.log(error)
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

      // OPTIONAL size limit (10MB)
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        Alert.alert('PDF too large (max 10MB)');
        return;
      }

      const base64Pdf = await uriToBase64(
        asset.uri,
        'application/pdf'
      );

      setPdfUrl(base64Pdf);
    }
  } catch (error) {
    Alert.alert('Error picking PDF');
  }
};




 const handleExtraFilesPick = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const files = [];

      for (const asset of result.assets) {
        // OPTIONAL size limit (5MB per file)
        if (asset.size && asset.size > 5 * 1024 * 1024) {
          Alert.alert(`${asset.name} too large (max 5MB)`);
          continue;
        }

        const base64File = await uriToBase64(
          asset.uri,
          asset.mimeType || 'application/octet-stream'
        );

        files.push(base64File);
      }

      setExtraFiles(prev => [...prev, ...files]);
    }
  } catch {
    Alert.alert('Error picking files');
  }
};



    // ------------------ SAVE ------------------
    const handleSaveTopic = async () => {
        if (!title) {
            Alert.alert('Please fill all required fields');
            return;
        }

        try {
            const payload = {
                Title: title,
                Description: description,
                VideoURL,
                Duration: Number(Duration),
                pdfUrl,
                extraFiles,
                classType,
                classOrder: Number(classOrder),
                duration: Number(duration),
                isFree,
                isLocked,
                ChapterId,
                SubjectId,
                Status,
            };

            let res;
            if (TopicId) res = await updateTopic(TopicId, payload);
            else res = await createTopic(payload);

            if (res?.success) {
                Alert.alert(TopicId ? "Updated successfully" : "Added successfully");
                navigation.goBack();
            }
        } catch {
            Alert.alert("Error saving data");
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
                    {TopicId ? "Edit Topic/Class" : "Add New Topic / Class"}
                </Text>

                {/* TITLE */}
                <TextInput
                    placeholder="Title"
                    placeholderTextColor="#000"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                />

                {/* DESCRIPTION */}
                <TextInput
                    placeholder="Description"
                    placeholderTextColor="#000"
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.input, styles.textArea]}
                    multiline
                />

                {/* VIDEO PICKER */}
                <TouchableOpacity style={styles.imageButton} onPress={handleVideoPick}>
                    <Text style={styles.imageButtonText}>
                        {VideoURL ? 'Change Video' : 'Select Video'}
                    </Text>
                </TouchableOpacity>
                {VideoURL ? <Text style={{ marginBottom: 10 }}>Selected video</Text> : null}

                {/* PDF PICKER */}
                <TouchableOpacity style={styles.imageButton} onPress={handlePdfPick}>
                    <Text style={styles.imageButtonText}>
                        {pdfUrl ? 'Change PDF' : 'Select PDF'}
                    </Text>
                </TouchableOpacity>
                {pdfUrl ? <Text style={{ marginBottom: 10 }}>Selected pdf</Text> : null}

                {/* EXTRA FILES */}
                <TouchableOpacity style={styles.imageButton} onPress={handleExtraFilesPick}>
                    <Text style={styles.imageButtonText}>Upload Extra Files</Text>
                </TouchableOpacity>
                {extraFiles.length > 0 && (
                    <Text style={{ marginTop: 6, color: '#555' }}>
                        {extraFiles.length} file(s) selected
                    </Text>
                )}

                {/* CLASS TYPE */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Class Type</Text>
                    <Picker selectedValue={classType} onValueChange={setClassType} style={styles.picker}>
                        <Picker.Item label="Select Class Type" value="" />
                        <Picker.Item label="Video" value="Video" />
                        <Picker.Item label="PDF" value="PDF" />
                        <Picker.Item label="Assignment" value="Assignment" />
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                {/* CLASS ORDER */}
                <TextInput
                    placeholder="Class Order"
                    placeholderTextColor="#000"
                    value={classOrder}
                    onChangeText={setClassOrder}
                    keyboardType="numeric"
                    style={styles.input}
                />

                {/* FREE / LOCK SWITCHES */}
                <View style={styles.switchRow}>
                    <Text>Is Free</Text>
                    <Switch value={isFree} onValueChange={setIsFree} />
                </View>

                <View style={styles.switchRow}>
                    <Text>Is Locked</Text>
                    <Switch value={isLocked} onValueChange={setIsLocked} />
                </View>

                {/* SUBJECT & CHAPTER PICKERS */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Select Subject</Text>
                    <Picker
                        selectedValue={SubjectId}
                        onValueChange={(value) => {
                            setSubjectId(value);
                            setChapterId("");
                            loadChapters(value);
                        }}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Subject" value="" />
                        {subjectList.map((s) => (
                            <Picker.Item key={s._id} label={s.Title} value={s._id} />
                        ))}
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Select Chapter</Text>
                    <Picker
                        enabled={chapterList.length > 0}
                        selectedValue={ChapterId}
                        onValueChange={setChapterId}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Chapter" value="" />
                        {chapterList.map((ch) => (
                            <Picker.Item key={ch._id} label={ch.Title} value={ch._id} />
                        ))}
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                {/* STATUS */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Status</Text>
                    <Picker selectedValue={Status} onValueChange={setStatus} style={styles.picker}>
                        <Picker.Item label="Active" value="Active" />
                        <Picker.Item label="Inactive" value="Inactive" />
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity style={styles.button} onPress={handleSaveTopic}>
                    <Text style={styles.buttonText}>
                        {TopicId ? "Update Topic/Class" : "Add Topic/Class"}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddTopicForm;

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#fff' },
    scrollContainer: { padding: 16, paddingBottom: 40 },
    heading: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#000' },
    input: { borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, padding: 12, marginBottom: 12, color: '#000', backgroundColor: '#fff' },
    textArea: { height: 100, textAlignVertical: 'top' },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: '#000', paddingLeft: 8, paddingTop: 6 },
    pickerContainer: { borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, marginBottom: 12, backgroundColor: '#fff' },
    picker: { color: '#000', backgroundColor: '#fff' },
    button: { backgroundColor: '#5d3fd3', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    imageButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#5d3fd3', borderRadius: 6, padding: 12, alignItems: 'center', marginBottom: 10 },
    imageButtonText: { color: '#5d3fd3', fontWeight: '600' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center' },
    arrow: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }], color: '#5d3fd3', fontSize: 14, pointerEvents: 'none' },
});
