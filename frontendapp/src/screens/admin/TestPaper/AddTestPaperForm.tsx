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
  Switch,
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

const AddTestPaperForm = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { TestPaperId } = params || {};

  const [loading, setLoading] = useState(false);

  // Test Series dropdown list
  const [testSeriesList, setTestSeriesList] = useState([]);
  const [testSeriesId, setTestSeriesId] = useState("");

  // TestPaper fields
  const [paperTitle, setPaperTitle] = useState("");
  const [description, setDescription] = useState("");

  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");

  const [attemptLimit, setAttemptLimit] = useState("1");
  const [paperLevel, setPaperLevel] = useState<"Easy" | "Medium" | "Hard">("Easy");

  const [IsPaid, setIsPaid] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Load Test Series list
  useEffect(() => {
    loadAllTestSeries();
  }, []);

  const loadAllTestSeries = async () => {
    try {
      const res = await getAllTestSeries();
      console.log(res)
      if (res?.success && res.TestSeries) {
        setTestSeriesList(res.TestSeries);
      }
    } catch {
      Alert.alert("Failed to load Test Series list");
    }
  };

  // Load existing TestPaper details
  useEffect(() => {
    if (TestPaperId) loadTestPaperDetails(TestPaperId);
  }, [TestPaperId]);

  const loadTestPaperDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getTestPaperById(id);
      if (res?.success) {
        const p = res.TestPaper;

        setTestSeriesId(p.TestSeriesId || "");
        setPaperTitle(p.PaperTitle || "");
        setDescription(p.Description || "");

        setDuration(String(p.DurationInMinutes || ""));
        setTotalMarks(String(p.TotalMarks || ""));
        setPassingMarks(String(p.PassingMarks || ""));
        setTotalQuestions(String(p.TotalQuestions || ""));

        setAttemptLimit(String(p.AttemptLimit || "1"));
        setPaperLevel(p.PaperLevel || "Easy");
        setIsPaid(p.IsPaid);
        setScheduledDate(p.ScheduledDate ? new Date(p.ScheduledDate) : undefined);
        setStatus(p.Status || "Active");
      } else {
        Alert.alert("Failed to load TestPaper details");
      }
    } catch {
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
      TestSeriesId: testSeriesId,
      PaperTitle: paperTitle,
      Description: description,

      DurationInMinutes: Number(duration),
      TotalMarks: Number(totalMarks),
      PassingMarks: Number(passingMarks),
      TotalQuestions: Number(totalQuestions),

      AttemptLimit: attemptLimit === "Unlimited" ? "Unlimited" : Number(attemptLimit),
      PaperLevel: paperLevel,

      IsPaid: IsPaid,
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {TestPaperId ? 'Edit Test Paper' : 'Add New Test Paper'}
        </Text>

        {/* Test Series */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Test Series</Text>
          <Picker
            selectedValue={testSeriesId}
            onValueChange={setTestSeriesId}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Test Series --" value="" />
            {testSeriesList.map((ts: any) => (
              <Picker.Item key={ts._id} label={ts.Title} value={ts._id} />
            ))}
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* Paper Title */}
        <TextInput
          placeholder="Paper Title"
          placeholderTextColor="#000"
          value={paperTitle}
          onChangeText={setPaperTitle}
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

        {/* Numeric Fields */}
        <TextInput
          placeholder="Duration (Minutes)"
          placeholderTextColor="#000"
          keyboardType="numeric"
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
        />

        <TextInput
          placeholder="Total Marks"
          placeholderTextColor="#000"
          keyboardType="numeric"
          style={styles.input}
          value={totalMarks}
          onChangeText={setTotalMarks}
        />

        <TextInput
          placeholder="Passing Marks"
          placeholderTextColor="#000"
          keyboardType="numeric"
          style={styles.input}
          value={passingMarks}
          onChangeText={setPassingMarks}
        />

        <TextInput
          placeholder="Total Questions"
          placeholderTextColor="#000"
          keyboardType="numeric"
          style={styles.input}
          value={totalQuestions}
          onChangeText={setTotalQuestions}
        />

        {/* Attempt Limit */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Attempt Limit</Text>
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
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* Paper Level */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Paper Level</Text>
          <Picker
            selectedValue={paperLevel}
            onValueChange={setPaperLevel}
            style={styles.picker}
          >
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* Paid / Free */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Is Paid</Text>
          <Picker
            selectedValue={IsPaid}
            onValueChange={(value) => setIsPaid(value)}
            style={styles.picker}
          >
            <Picker.Item label="Free" value={false} />
            <Picker.Item label="Paid" value={true} />
          </Picker>
          <Text style={styles.arrow}>▼</Text>
        </View>

        {/* Scheduled Date */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {scheduledDate ? scheduledDate.toDateString() : 'Select Scheduled Date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={scheduledDate || new Date()}
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setScheduledDate(d);
            }}
          />
        )}

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

        {/* Submit */}
        <TouchableOpacity
          style={styles.button}
          onPress={saveTestPaper}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {TestPaperId ? 'Update Test Paper' : 'Add Test Paper'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

};

export default AddTestPaperForm;

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

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 6,
  },

  dateButton: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  dateText: {
    color: '#000',
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
});

