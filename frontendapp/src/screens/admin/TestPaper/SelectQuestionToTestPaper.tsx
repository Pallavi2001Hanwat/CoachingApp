import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getAllSubjects } from '@/src/api/adminApi/SubjectApi';
import { getChaptersBySubjectId } from '@/src/api/adminApi/ChapterApi';
import { getTopicsByChapterId } from '@/src/api/adminApi/TopicsApi';
import {
  getAllQuestionsBySubject,
  getQuestionByTestPaperId,
  
} from '@/src/api/adminApi/QuestionWithOptionApi';
import { saveQuestionToTestPaper,removeAllSelectedQuestionsFromTestPaper } from '@/src/api/adminApi/TestPaperApi';

type Subject = { _id: string; Title: string };
type Chapter = { _id: string; Title: string };
type Topic = { _id: string; Title: string };

const Checkbox = ({ checked }: { checked: boolean }) => (
  <View style={styles.checkbox}>
    {checked && <Text style={styles.check}>✔</Text>}
  </View>
);

const SelectQuestionToTestPapersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { TestPaperId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [removing, setRemoving] = useState(false);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    loadInitial();
    loadAlreadySelectedQuestions();
  }, []);



  const loadInitial = async () => {
    try {
      const res = await getAllSubjects();
      if (res?.success) setSubjects(res.Subjects || []);
    } finally {
      setLoading(false);
    }
  };

  
  const handleRemoveSelected = async () => {
  if (!TestPaperId) return Alert.alert('Invalid Test Paper');

  if (!selectedQuestions.length) {
    return Alert.alert('No questions selected');
  }

  Alert.alert(
    'Confirm Remove',
    'Are you sure you want to remove selected questions from this test paper?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setRemoving(true);
          try {
            const res = await removeAllSelectedQuestionsFromTestPaper(TestPaperId);

            if (res?.success) {
              Alert.alert('Removed Successfully');
              setSelectedQuestions([]);
              setQuestions([]);
            } else {
              Alert.alert('Failed to remove questions');
            }
          } finally {
            setRemoving(false);
          }
        },
      },
    ]
  );
};


  // ================= LOAD ALREADY SELECTED QUESTIONS =================
const loadAlreadySelectedQuestions = async () => {
  if (!TestPaperId) return;

  try {
    const res = await getQuestionByTestPaperId(TestPaperId);

    if (res?.success && res.data?.questions?.length) {
      const ids = res.data.questions.map(
        (item: any) => item.QuestionId?._id
      );

      setSelectedQuestions(ids);
    }
  } catch (err) {
    console.log('Error loading selected questions', err);
  }
};


  // ================= SUBJECT CHANGE =================
  const onSubjectChange = async (id: string) => {
    setSelectedSubject(id);
    setSelectedChapter('');
    setSelectedTopic('');
    setChapters([]);
    setTopics([]);
    setQuestions([]);

    if (!id) return;

    const res = await getChaptersBySubjectId(id);
    if (res?.success) setChapters(res.Chapters || []);
  };

  // ================= CHAPTER CHANGE =================
  const onChapterChange = async (id: string) => {
    setSelectedChapter(id);
    setSelectedTopic('');
    setTopics([]);
    setQuestions([]);

    if (!id) return;

    const res = await getTopicsByChapterId(id);
    if (res?.success) setTopics(res.Topics || []);
  };

  // ================= TOPIC CHANGE =================
  const onTopicChange = async (
    topicId: string,
    subjectId: string,
    chapterId: string
  ) => {
    setSelectedTopic(topicId);
    setQuestions([]);

    if (!topicId || !subjectId || !chapterId) return;

    loadQuestions(topicId, subjectId, chapterId);
  };

  // ================= LOAD QUESTIONS =================
  const loadQuestions = async (
    topicId: string,
    subjectId: string,
    chapterId: string
  ) => {
    setLoadingQuestions(true);
    try {
      const res = await getAllQuestionsBySubject({
        SubjectId: [subjectId],
        ChapterId: [chapterId],
        TopicId: [topicId],
      });

      if (res?.success) setQuestions(res.questionswithoption || []);
      else setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ================= TOGGLE =================
  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!TestPaperId) return Alert.alert('Invalid Test Paper');
    if (!selectedQuestions.length)
      return Alert.alert('Please select at least one question');

    setSaving(true);
    try {
      const res = await saveQuestionToTestPaper({
        TestPaperId,
        SelectedQuestions: selectedQuestions,
      });

      if (res?.success) {
        Alert.alert('Saved Successfully');
        navigation.goBack();
      } else Alert.alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.heading}>Select Questions</Text>

      {/* REMOVE SELECTED */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={handleRemoveSelected}
        disabled={removing}
      >
        {removing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.removeText}>
            Remove Selected ({selectedQuestions.length})
          </Text>
        )}
      </TouchableOpacity>

      {/* SUBJECT */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Subject</Text>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={onSubjectChange}
          style={styles.picker}
        >
          <Picker.Item label="Select Subject" value="" />
          {subjects.map((s) => (
            <Picker.Item key={s._id} label={s.Title} value={s._id} />
          ))}
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* CHAPTER */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Chapter</Text>
        <Picker
          selectedValue={selectedChapter}
          enabled={!!selectedSubject}
          onValueChange={onChapterChange}
          style={styles.picker}
        >
          <Picker.Item label="Select Chapter" value="" />
          {chapters.map((c) => (
            <Picker.Item key={c._id} label={c.Title} value={c._id} />
          ))}
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* TOPIC */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Topic</Text>
        <Picker
          selectedValue={selectedTopic}
          enabled={!!selectedChapter}
          onValueChange={(id) =>
            onTopicChange(id, selectedSubject, selectedChapter)
          }
          style={styles.picker}
        >
          <Picker.Item label="Select Topic" value="" />
          {topics.map((t) => (
            <Picker.Item key={t._id} label={t.Title} value={t._id} />
          ))}
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* QUESTIONS */}
      <Text style={styles.qHeading}>Questions</Text>
      {loadingQuestions && <ActivityIndicator />}

      {questions.map((q, index) => {
        const checked = selectedQuestions.includes(q._id);
        return (
          <TouchableOpacity
            key={q._id}
            onPress={() => toggleQuestion(q._id)}
            style={[
              styles.qCard,
              checked && styles.qCardSelected,
            ]}
          >
            <View style={styles.checkbox}>
              {checked && <Text style={styles.check}>✓</Text>}
            </View>

            <Text style={styles.qText}>
              {index + 1}. {q.QuestionText}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            Save Selected ({selectedQuestions.length})
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  </KeyboardAvoidingView>
);

};

export default SelectQuestionToTestPapersScreen;


// ================= STYLES =================
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
    marginBottom: 12,
    color: '#000',
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

  qHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },

  qCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },

  qCardSelected: {
    backgroundColor: '#f1edff',
    borderColor: '#5d3fd3',
  },

  qText: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: '#5d3fd3',
    fontWeight: '700',
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: '#5d3fd3',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  removeBtn: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },

  removeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

