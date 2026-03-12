import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  createTestPaper,
  getTestPaperById,
  updateTestPaper,
} from "@/src/api/adminApi/TestPaperApi";
import { getAllTestSeries } from "@/src/api/adminApi/TestSeriesApi";
import { getAllCategories } from "@/src/api/adminApi/CategoryApi";

const AddTestPaperForm = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { TestPaperId } = params || {};

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [testSeriesList, setTestSeriesList] = useState<any[]>([]);
  const [filteredTestSeries, setFilteredTestSeries] = useState<any[]>([]);
  const [testSeriesId, setTestSeriesId] = useState("");

  const [paperTitle, setPaperTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [attemptLimit, setAttemptLimit] = useState("1");
  const [paperLevel, setPaperLevel] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    loadCategories();
    loadAllTestSeries();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res?.success) setCategories(res.categories);
    } catch {
      Alert.alert("Failed to load Categories");
    }
  };

  const loadAllTestSeries = async () => {
    try {
      const res = await getAllTestSeries();
      if (res?.success && res.TestSeries) setTestSeriesList(res.TestSeries);
    } catch {
      Alert.alert("Failed to load Test Series list");
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      const filtered = testSeriesList.filter(
        (ts) => ts.CategoryId === selectedCategory
      );
      setFilteredTestSeries(filtered);

      if (!filtered.find((ts) => ts._id === testSeriesId)) {
        setTestSeriesId("");
      }
    } else {
      setFilteredTestSeries([]);
      setTestSeriesId("");
    }
  }, [selectedCategory, testSeriesList]);

  useEffect(() => {
    if (TestPaperId && testSeriesList.length > 0) {
      loadTestPaperDetails(TestPaperId);
    }
  }, [TestPaperId, testSeriesList]);

  const loadTestPaperDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getTestPaperById(id);
      if (res?.success) {
        const p = res.TestPaper;
        const testSeries = p.TestSeriesId;
        const categoryId = testSeries?.CategoryId?._id || "";

        setSelectedCategory(categoryId);

        const filtered = testSeriesList.filter(
          (ts) => ts.CategoryId === categoryId
        );
        setFilteredTestSeries(filtered);

        setTestSeriesId(testSeries?._id || "");

        setPaperTitle(p.PaperTitle || "");
        setDescription(p.Description || "");
        setDuration(String(p.DurationInMinutes || ""));
        setTotalMarks(String(p.TotalMarks || ""));
        setPassingMarks(String(p.PassingMarks || ""));
        setTotalQuestions(String(p.TotalQuestions || ""));
        setAttemptLimit(String(p.AttemptLimit || "1"));
        setPaperLevel(p.PaperLevel || "Easy");
        setScheduledDate(
          p.ScheduledDate ? new Date(p.ScheduledDate) : undefined
        );
        setStatus(p.Status || "Active");
      }
    } catch (err) {
      Alert.alert("Error loading details");
    } finally {
      setLoading(false);
    }
  };

  const saveTestPaper = async () => {
    if (!paperTitle || !testSeriesId) {
      Alert.alert("Paper Title and Test Series are required");
      return;
    }

    const data = {
      CategoryId: selectedCategory,
      TestSeriesId: testSeriesId,
      PaperTitle: paperTitle,
      Description: description,
      DurationInMinutes: Number(duration),
      TotalMarks: Number(totalMarks),
      PassingMarks: Number(passingMarks),
      TotalQuestions: Number(totalQuestions),
      AttemptLimit:
        attemptLimit === "Unlimited"
          ? "Unlimited"
          : Number(attemptLimit),
      PaperLevel: paperLevel,
      ScheduledDate: scheduledDate || null,
      Status: status,
    };

    const res = TestPaperId
      ? await updateTestPaper(TestPaperId, data)
      : await createTestPaper(data);

    if (res?.success) Alert.alert("Saved Successfully");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {TestPaperId ? "Edit Test Paper" : "Add New Test Paper"}
        </Text>

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={setSelectedCategory}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Category --" value="" />
            {categories.map((cat) => (
              <Picker.Item
                key={cat._id}
                label={cat.CategoryName}
                value={cat._id}
              />
            ))}
          </Picker>
        </View>

        {/* TEST SERIES */}
        <Text style={styles.label}>Test Series</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={testSeriesId}
            onValueChange={setTestSeriesId}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Test Series --" value="" />
            {filteredTestSeries.map((ts) => (
              <Picker.Item
                key={ts._id}
                label={ts.Title}
                value={ts._id}
              />
            ))}
          </Picker>
        </View>

        {/* TEXT INPUTS WITH LABELS */}

        <Text style={styles.label}>Paper Title</Text>
        <TextInput
          value={paperTitle}
          onChangeText={setPaperTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Duration (Minutes)</Text>
        <TextInput
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
        />

        <Text style={styles.label}>Total Marks</Text>
        <TextInput
          keyboardType="numeric"
          value={totalMarks}
          onChangeText={setTotalMarks}
          style={styles.input}
        />

        <Text style={styles.label}>Passing Marks</Text>
        <TextInput
          keyboardType="numeric"
          value={passingMarks}
          onChangeText={setPassingMarks}
          style={styles.input}
        />

        <Text style={styles.label}>Total Questions</Text>
        <TextInput
          keyboardType="numeric"
          value={totalQuestions}
          onChangeText={setTotalQuestions}
          style={styles.input}
        />

        {/* Attempt Limit */}
        <Text style={styles.label}>Attempt Limit</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={attemptLimit}
            onValueChange={setAttemptLimit}
            style={styles.picker}
          >
            <Picker.Item label="1" value="1" />
            <Picker.Item label="2" value="2" />
            <Picker.Item label="3" value="3" />
            <Picker.Item label="Unlimited" value="Unlimited" />
          </Picker>
        </View>

        {/* Paper Level */}
        <Text style={styles.label}>Paper Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={paperLevel}
            onValueChange={setPaperLevel}
            style={styles.picker}
          >
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
        </View>

        {/* Status */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            style={styles.picker}
          >
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>

        {/* Scheduled Date */}
        <Text style={styles.label}>Scheduled Date</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            {scheduledDate
              ? scheduledDate.toLocaleDateString()
              : "Select Scheduled Date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setScheduledDate(date);
            }}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={saveTestPaper}>
          <Text style={styles.buttonText}>
            {TestPaperId ? "Update Test Paper" : "Add Test Paper"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddTestPaperForm;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 20 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
    color: "#333",
  },

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

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  picker: { color: "#000", backgroundColor: "#fff" },

  button: {
    backgroundColor: "#5d3fd3",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});