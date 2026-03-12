import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { GetTestResult } from '../../../api/studentApi/AttemptStudentTest';

const TestResultScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { AttemptId } = route.params;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  /* ---------------- FETCH RESULT ---------------- */
  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await GetTestResult(AttemptId);
      setResult(res.result);
    } catch (error) {
      console.error('Result Fetch Error 👉', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HEADER ---------------- */
  useEffect(() => {
    navigation.setOptions({
      title: "Test Result",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
          }}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ---------------- RENDER QUESTION ---------------- */
  const renderQuestion = ({ item, index }: any) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>
        Q{index + 1}. {item.QuestionText}
      </Text>

      <Text style={styles.answerText}>
        Your Answer:{' '}
        <Text style={{ fontWeight: '600' }}>
          {item.SelectedOption ?? 'Not Attempted'}
        </Text>
      </Text>

      <Text
        style={[
          styles.status,
          { color: item.IsCorrect ? '#2ecc71' : '#e74c3c' },
        ]}
      >
        {item.IsCorrect ? 'Correct' : 'Wrong'}
      </Text>

      <Text style={styles.marks}>
        Marks Awarded: {item.MarksAwarded}
      </Text>

      {item.Explanation ? (
        <Text style={styles.explanation}>
          Explanation: {item.Explanation}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ---------- SUMMARY ---------- */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Test Summary</Text>

        <View style={styles.row}>
          <Text>Total Marks</Text>
          <Text>{result.TotalMarks}</Text>
        </View>

        <View style={styles.row}>
          <Text>Correct</Text>
          <Text>{result.Correct}</Text>
        </View>

        <View style={styles.row}>
          <Text>Wrong</Text>
          <Text>{result.Wrong}</Text>
        </View>

        <View style={styles.row}>
          <Text>Skipped</Text>
          <Text>{result.Skipped}</Text>
        </View>

        <View style={styles.row}>
          <Text>Time Taken</Text>
          <Text>{result.TimeTaken} sec</Text>
        </View>
      </View>

      {/* ---------- QUESTION LIST ---------- */}
      <FlatList
        data={result.Questions}
        renderItem={renderQuestion}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TestResultScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  marks: {
    fontSize: 13,
    marginTop: 4,
  },
  explanation: {
    fontSize: 13,
    marginTop: 6,
    color: '#555',
  },
});
