import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getQuestionByTestPaperId } from '@/src/api/studentApi/QuestionwithoptionApi';
import { submitStudentTestApi } from '@/src/api/studentApi/AttemptStudentTest';

const TestQuestionScreen = ({ route, navigation }) => {
  const { TestPaperId, resume } = route.params;

  const [questions, setQuestions] = useState([]);
  const [testPaper, setTestPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState({});

  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);

  const totalTimerRef = useRef<any>(null);
  const questionTimerRef = useRef<any>(null);

  /* =======================
      LOAD ATTEMPT DATA
  ======================= */
  useEffect(() => {
    const loadAttempt = async () => {
      const attemptData = await AsyncStorage.getItem(
        `Attempt_${TestPaperId}`
      );

      if (!attemptData) {
        Alert.alert('Error', 'Attempt not found');
        navigation.goBack();
        return;
      }

      const parsed = JSON.parse(attemptData);
      setAttemptId(parsed.AttemptId);
    };

    loadAttempt();
  }, []);

  /* =======================
      FETCH QUESTIONS
  ======================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getQuestionByTestPaperId(TestPaperId);

        if (res.success) {
          setQuestions(res.data.questions);
          setTestPaper(res.data.testPaper);

          // 🔁 Resume from local storage (answers + index)
          if (resume) {
            const saved = await AsyncStorage.getItem(
              `testProgress_${TestPaperId}`
            );

            if (saved) {
              const parsed = JSON.parse(saved);
              setAnswers(parsed.answers || {});
              setCurrentIndex(parsed.currentIndex ?? 0);
            }
          }
        }
      } catch (err) {
        console.log('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  /* =======================
      HEADER
  ======================= */
  useEffect(() => {
    if (!testPaper) return;

    navigation.setOptions({
      title: testPaper.PaperTitle,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [testPaper]);

  /* =======================
      INIT TOTAL TIMER (BACKEND BASED)
  ======================= */
  useEffect(() => {
    const initTimer = async () => {
      if (!testPaper) return;

      const attemptData = await AsyncStorage.getItem(
        `Attempt_${TestPaperId}`
      );
      if (!attemptData) return;

      const { StartTime } = JSON.parse(attemptData);

      const totalDuration = testPaper.DurationInMinutes * 60;
      const elapsed = Math.floor(
        (Date.now() - new Date(StartTime).getTime()) / 1000
      );

      const remaining = Math.max(totalDuration - elapsed, 0);
      setTotalTimeLeft(remaining);
    };

    initTimer();
  }, [testPaper]);

  /* =======================
      TOTAL TIMER
  ======================= */
  useEffect(() => {
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, []);

  /* =======================
      QUESTION TIMER
  ======================= */
  useEffect(() => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    setQuestionTime(0);
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(questionTimerRef.current);
  }, [currentIndex]);

  /* =======================
      RESTORE SELECTED OPTION
  ======================= */
  useEffect(() => {
    if (!currentQuestion) return;

    const qId = currentQuestion.QuestionId._id;
    const savedOptionId = answers[qId];

    if (savedOptionId) {
      const index = currentQuestion.options.findIndex(
        o => o._id === savedOptionId
      );
      setSelectedOption(index);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, currentQuestion]);

  /* =======================
      SAVE ANSWER
  ======================= */
  const saveProgress = async (nextIndex = currentIndex) => {
    if (!currentQuestion) return;

    const qId = currentQuestion.QuestionId._id;

    const updatedAnswers =
      selectedOption !== null
        ? {
            ...answers,
            [qId]: currentQuestion.options[selectedOption]._id,
          }
        : answers;

    setAnswers(updatedAnswers);

    await AsyncStorage.setItem(
      `testProgress_${TestPaperId}`,
      JSON.stringify({
        answers: updatedAnswers,
        currentIndex: nextIndex,
      })
    );
  };

  const nextQuestion = async () => {
    if (!isLastQuestion) {
      await saveProgress(currentIndex + 1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = async () => {
    if (currentIndex > 0) {
      await saveProgress(currentIndex - 1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const clearResponse = async () => {
    setSelectedOption(null);
    await saveProgress(currentIndex);
  };

  /* =======================
      SUBMIT
  ======================= */
const handleSubmitTest = () => {
  Alert.alert('Submit Test', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Submit',
      onPress: async () => {
        try {
          if (!attemptId || !currentQuestion) {
            Alert.alert('Error', 'Attempt not found');
            return;
          }

          // ✅ IMPORTANT: save last question answer
          const qId = currentQuestion.QuestionId._id;

          const finalAnswers =
            selectedOption !== null
              ? {
                  ...answers,
                  [qId]: currentQuestion.options[selectedOption]._id,
                }
              : answers;

          const payload = {
            AttemptId: attemptId,
            TestPaperId,
            answers: finalAnswers,
            totalTimeSpent:
              testPaper.DurationInMinutes * 60 - totalTimeLeft,
          };

          const res = await submitStudentTestApi(payload);

          if (res.success) {
            await AsyncStorage.removeItem(`testProgress_${TestPaperId}`);
            await AsyncStorage.removeItem(`Attempt_${TestPaperId}`);

            navigation.navigate('TestResultScreen', {
              AttemptId: attemptId,
            });
          } else {
            Alert.alert('Submit Failed', res.message);
          }
        } catch (error: any) {
          Alert.alert(
            'Error',
            error?.response?.data?.message || 'Server error'
          );
        }
      },
    },
  ]);
};


  /* =======================
      LOADING
  ======================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Questions...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.center}>
        <Text>No questions found</Text>
      </View>
    );
  }

  /* =======================
      UI
  ======================= */
  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        ⏱ {Math.floor(totalTimeLeft / 60)}:
        {('0' + (totalTimeLeft % 60)).slice(-2)}
      </Text>

      <Text style={styles.questionTimer}>
        ⏳ {Math.floor(questionTime / 60)}:
        {('0' + (questionTime % 60)).slice(-2)}
      </Text>

      <Text style={styles.question}>
        Q{currentIndex + 1}. {currentQuestion.QuestionId.QuestionText}
      </Text>

      {currentQuestion.options.map((opt, index) => (
        <TouchableOpacity
          key={opt._id}
          style={[
            styles.option,
            selectedOption === index && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption(index)}
        >
          <Text>{opt.OptionText}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity onPress={previousQuestion} disabled={currentIndex === 0}>
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={currentIndex === 0 ? '#ccc' : '#5d3fd3'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={clearResponse} style={styles.btn}>
          <Text>Clear</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            onPress={handleSubmitTest}
            style={[styles.btnPrimary, { backgroundColor: '#2e7d32' }]}
          >
            <Text style={styles.btnPrimaryText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={nextQuestion} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Save & Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TestQuestionScreen;

/* =======================
        STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timer: { textAlign: 'center', fontWeight: '700', color: '#d32f2f' },
  questionTimer: { textAlign: 'right', color: '#ff6f00' },
  question: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
  option: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  selectedOption: { borderColor: '#5d3fd3', backgroundColor: '#f0edff' },
  actions: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: '#5d3fd3',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});
