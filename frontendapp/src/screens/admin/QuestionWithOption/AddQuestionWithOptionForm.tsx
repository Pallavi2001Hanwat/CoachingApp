import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  createQuestionOption,
  getQuestionOptionById,
  updateQuestionOption,
  createQuestionWithOption_and_addtoTestPaper
} from '@/src/api/adminApi/QuestionWithOptionApi';

import { getAllSubjects } from '@/src/api/adminApi/SubjectApi';
import { getChaptersBySubjectId } from '@/src/api/adminApi/ChapterApi';
import { getTopicsByChapterId } from '@/src/api/adminApi/TopicsApi';


const AddQuestionWithOptionForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { QuestionWithOptionId } = route.params || {};
  const { TestPaperId } = route.params || {};


  const [loading, setLoading] = useState(false);

  // SUBJECT - CHAPTER - TOPIC
  const [Subjects, setSubjects] = useState<any[]>([]);
  const [Chapters, setChapters] = useState<any[]>([]);
  const [Topics, setTopics] = useState<any[]>([]);

  const [SubjectId, setSubjectId] = useState<string>("");
  const [ChapterId, setChapterId] = useState<string>("");
  const [TopicId, setTopicId] = useState<string>("");

  // QUESTION FIELDS
  const [QuestionText, setQuestionText] = useState("");
  const [QuestionImage, setQuestionImage] = useState("");
  const [QuestionType, setQuestionType] = useState<'MCQ' | 'TrueFalse' | 'Numeric' | 'FillInTheBlank' | 'MatchTheFollowing'>('MCQ');
  const [DifficultyLevel, setDifficultyLevel] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');

  const [Marks, setMarks] = useState("1");
  const [NegativeMarks, setNegativeMarks] = useState("0");
  const [TimeAllowedInSeconds, setTimeAllowedInSeconds] = useState("60");

  const [Explanation, setExplanation] = useState("");
  const [Status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [Tags, setTags] = useState("");

  const [Options, setOptions] = useState<any[]>([]);

  /** LOAD SUBJECTS INITIALLY */
  useEffect(() => {
    loadSubjects();

    if (QuestionWithOptionId) loadQuestionDetails(QuestionWithOptionId);
  }, [QuestionWithOptionId]);

  const loadSubjects = async () => {
    const res = await getAllSubjects();
    if (res?.success) setSubjects(res.Subjects);
  };

  /** SUBJECT → CHAPTER → TOPIC CHAIN */
  useEffect(() => {
    if (!SubjectId) return;

    setChapterId("");
    setTopicId("");
    setChapters([]);
    setTopics([]);

    getChaptersBySubjectId(SubjectId).then(res => {
      if (res?.success) setChapters(res.Chapters);
    });

  }, [SubjectId]);

  useEffect(() => {
    if (!ChapterId) return;

    setTopicId("");
    setTopics([]);

    getTopicsByChapterId(ChapterId).then(res => {
      if (res?.success) setTopics(res.Topics);
    });

  }, [ChapterId]);

  /** LOAD EXISTING QUESTION */
  const loadQuestionDetails = async (id: string) => {
    try {
      setLoading(true);

      const res = await getQuestionOptionById(id);
      if (res?.success) {
        const q = res.questionwithoption.question;
        const opts = res.questionwithoption.options;

        setQuestionText(q.QuestionText);
        setQuestionImage(q.QuestionImage || "");
        setQuestionType(q.QuestionType);
        setDifficultyLevel(q.DifficultyLevel);
        setMarks(q.Marks.toString());
        setNegativeMarks(q.NegativeMarks?.toString() || "0");
        setTimeAllowedInSeconds(q.TimeAllowedInSeconds.toString());
        setExplanation(q.Explanation || "");
        setStatus(q.Status || 'Active');
        setTags(q.Tags?.join(",") || "");

        /** STEP 1 - Set Subject */
        setSubjectId(q.SubjectId?._id);

        /** STEP 2 - Load Chapters based on subject, then set ChapterId */
        const chRes = await getChaptersBySubjectId(q.SubjectId?._id);
        if (chRes?.success) {
          setChapters(chRes.Chapters);
          setChapterId(q.ChapterId?._id);
        }

        /** STEP 3 - Load Topics based on chapter, then set TopicId */
        const tRes = await getTopicsByChapterId(q.ChapterId?._id);
        if (tRes?.success) {
          setTopics(tRes.Topics);
          setTopicId(q.TopicId?._id);
        }

        setOptions(opts || []);
      }
    } catch (err) {
      console.log("Error loading Question:", err);
    } finally {
      setLoading(false);
    }
  };



  /** IMAGE PICKER */
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });

    if (!result.canceled) {
      const asset = result.assets[0];
      setQuestionImage(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  /** OPTIONS **/
  const addOption = () => {
    setOptions([...Options, { OptionText: "", OptionImage: "", IsCorrect: false, Status: "Active" }]);
  };

  const updateOption = (index: number, key: string, value: any) => {
    const updated = [...Options];
    updated[index][key] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    const filtered = Options.filter((_, i) => i !== index);
    setOptions(filtered);
  };

  const pickOptionImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      updateOption(index, "OptionImage", `data:image/jpeg;base64,${asset.base64}`);
    }
  };

  /** SAVE QUESTION */
  const saveQuestion = async () => {
    if (!QuestionText || !Marks || !TimeAllowedInSeconds || !SubjectId || !ChapterId || !TopicId) {
      Alert.alert("Please fill all required fields");
      return;
    }

    if (Options.length === 0) {
      Alert.alert("Please add at least one option");
      return;
    }

    const payload = {
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      Marks: Number(Marks),
      NegativeMarks: Number(NegativeMarks),
      TimeAllowedInSeconds: Number(TimeAllowedInSeconds),
      Explanation,
      Tags: Tags ? Tags.split(",").map(t => t.trim()) : [],
      Status,
      SubjectId,
      ChapterId,
      TopicId,
      Options
    };

    try {
      setLoading(true);
      let res;

      if (QuestionWithOptionId) res = await updateQuestionOption(QuestionWithOptionId, payload);
      else res = await createQuestionOption(payload);

      if (res?.success) {
        Alert.alert(`Question ${QuestionWithOptionId ? "Updated" : "Created"} Successfully`);
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

   const saveQuestion_add_inTestPaper = async () => {
    if (!QuestionText || !Marks || !TimeAllowedInSeconds || !SubjectId || !ChapterId || !TopicId) {
      Alert.alert("Please fill all required fields");
      return;
    }

    if (Options.length === 0) {
      Alert.alert("Please add at least one option");
      return;
    }

    const payload = {
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      Marks: Number(Marks),
      NegativeMarks: Number(NegativeMarks),
      TimeAllowedInSeconds: Number(TimeAllowedInSeconds),
      Explanation,
      Tags: Tags ? Tags.split(",").map(t => t.trim()) : [],
      Status,
      SubjectId,
      ChapterId,
      TopicId,
      Options,
      TestPaperId
    };

    try {
      setLoading(true);
      let res;

      res = await createQuestionWithOption_and_addtoTestPaper(payload);

      if (res?.success) {
        Alert.alert(`Question Created Successfully`);
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

 return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {QuestionWithOptionId ? "Edit Question" : "Add Question"}
        </Text>

        {/* QUESTION TEXT */}
        <TextInput
          placeholder="Question Text"
          placeholderTextColor="#000"
          value={QuestionText}
          onChangeText={setQuestionText}
          style={styles.input}
        />

        {/* QUESTION IMAGE */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Question Image</Text>

          <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
            <Text style={styles.imageButtonText}>
              {QuestionImage ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>

          {QuestionImage ? (
            <Image source={{ uri: QuestionImage }} style={styles.image} />
          ) : (
            <Text style={styles.noImage}>No image selected</Text>
          )}
        </View>

        {/* SUBJECT */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Subject</Text>
          <Picker selectedValue={SubjectId} onValueChange={setSubjectId} style={styles.picker}>
            <Picker.Item label="Select Subject" value="" />
            {Subjects.map(s => (
              <Picker.Item key={s._id} label={s.Title} value={s._id} />
            ))}
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* CHAPTER */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Chapter</Text>
          <Picker selectedValue={ChapterId} onValueChange={setChapterId} style={styles.picker}>
            <Picker.Item label="Select Chapter" value="" />
            {Chapters.map(c => (
              <Picker.Item key={c._id} label={c.Title} value={c._id} />
            ))}
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* TOPIC */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Topic</Text>
          <Picker selectedValue={TopicId} onValueChange={setTopicId} style={styles.picker}>
            <Picker.Item label="Select Topic" value="" />
            {Topics.map(t => (
              <Picker.Item key={t._id} label={t.Title} value={t._id} />
            ))}
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* QUESTION TYPE */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Question Type</Text>
          <Picker selectedValue={QuestionType} onValueChange={setQuestionType} style={styles.picker}>
            <Picker.Item label="MCQ" value="MCQ" />
            <Picker.Item label="True / False" value="TrueFalse" />
            <Picker.Item label="Numeric" value="Numeric" />
            <Picker.Item label="Fill in the Blank" value="FillInTheBlank" />
            <Picker.Item label="Match the Following" value="MatchTheFollowing" />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* DIFFICULTY */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Difficulty</Text>
          <Picker selectedValue={DifficultyLevel} onValueChange={setDifficultyLevel} style={styles.picker}>
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        <TextInput
          placeholder="Marks"
          placeholderTextColor="#000"
          value={Marks}
          keyboardType="numeric"
          onChangeText={setMarks}
          style={styles.input}
        />

        <TextInput
          placeholder="Negative Marks"
          placeholderTextColor="#000"
          value={NegativeMarks}
          keyboardType="numeric"
          onChangeText={setNegativeMarks}
          style={styles.input}
        />

        <TextInput
          placeholder="Time Allowed (Seconds)"
          placeholderTextColor="#000"
          value={TimeAllowedInSeconds}
          keyboardType="numeric"
          onChangeText={setTimeAllowedInSeconds}
          style={styles.input}
        />

        <TextInput
          placeholder="Explanation"
          placeholderTextColor="#000"
          value={Explanation}
          onChangeText={setExplanation}
          multiline
          style={[styles.input, styles.textArea]}
        />

        <TextInput
          placeholder="Tags (comma separated)"
          placeholderTextColor="#000"
          value={Tags}
          onChangeText={setTags}
          style={styles.input}
        />

        {/* STATUS */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Status</Text>
          <Picker selectedValue={Status} onValueChange={setStatus} style={styles.picker}>
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* OPTIONS */}
        <Text style={styles.subHeading}>Options</Text>

        {Options.map((opt, idx) => (
          <View key={idx} style={styles.optionBox}>
            <TouchableOpacity style={styles.deleteIcon} onPress={() => removeOption(idx)}>
              <Icon name="delete" size={22} color="red" />
            </TouchableOpacity>

            <TextInput
              placeholder={`Option ${idx + 1}`}
              placeholderTextColor="#000"
              value={opt.OptionText}
              onChangeText={(t) => updateOption(idx, "OptionText", t)}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() => pickOptionImage(idx)}
              style={styles.imageButton}
            >
              <Text style={styles.imageButtonText}>
                {opt.OptionImage ? "Change Image" : "Add Option Image"}
              </Text>
            </TouchableOpacity>

            {opt.OptionImage && <Image source={{ uri: opt.OptionImage }} style={styles.optImage} />}

            <TouchableOpacity
              onPress={() => updateOption(idx, "IsCorrect", !opt.IsCorrect)}
              style={[
                styles.correctBtn,
                opt.IsCorrect && styles.correctActive,
              ]}
            >
              <Text style={{ color: "#fff" }}>
                {opt.IsCorrect ? "Correct Answer" : "Mark Correct"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={addOption} style={styles.addOptionBtn}>
          <Text style={styles.addOptionText}>+ Add Option</Text>
        </TouchableOpacity>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.button} onPress={saveQuestion} disabled={loading}>
          <Text style={styles.buttonText}>
            {QuestionWithOptionId ? "Update Question" : "Create Question"}
          </Text>
        </TouchableOpacity>

        {TestPaperId && !QuestionWithOptionId && (
          <TouchableOpacity
            style={[styles.button, { marginTop: 10 }]}
            onPress={saveQuestion_add_inTestPaper}
          >
            <Text style={styles.buttonText}>Create & Add to Test Paper</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddQuestionWithOptionForm;


/** STYLES */
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },

  scrollContainer: { padding: 16, paddingBottom: 40 },

  heading: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#000" },

  subHeading: { fontSize: 18, fontWeight: "700", marginVertical: 16 },

  input: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    color: "#000",
    backgroundColor: "#fff",
  },

  textArea: { height: 100, textAlignVertical: "top" },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
    paddingLeft: 8,
    paddingTop: 6,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  picker: { color: "#000" },

  arrow: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -8 }],
    color: "#5d3fd3",
    fontSize: 14,
  },

  imageButton: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },

  imageButtonText: { color: "#5d3fd3", fontWeight: "600" },

  image: {
    width: "100%",
    height: 180,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  noImage: { color: "#999", marginTop: 6 },

  optionBox: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    position: "relative",
  },

  deleteIcon: { position: "absolute", top: 8, right: 8 },

  optImage: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginTop: 10,
  },

  correctBtn: {
    backgroundColor: "#777",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },

  correctActive: { backgroundColor: "green" },

  addOptionBtn: {
    backgroundColor: "#8879c1ff",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },

  addOptionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#5d3fd3",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

