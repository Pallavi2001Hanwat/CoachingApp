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
import { getAll_TestPaperbyTestseiesId } from '../../../api/studentApi/TestPaperApi';
import { GetTestProgress } from '../../../api/studentApi/AttemptStudentTest';
import { Ionicons } from "@expo/vector-icons";

const TestPaperScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { testSeriesId, isPaid } = route.params;

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<any>({}); // progress from DB

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1️⃣ fetch test papers
      const papersRes = await getAll_TestPaperbyTestseiesId(testSeriesId, isPaid);
      if (!papersRes?.success) return;
      setPapers(papersRes.testPapers);

      // 2️⃣ fetch student progress from backend
      const progressRes = await GetTestProgress(testSeriesId);
      if (progressRes?.success) {
        setProgressMap(progressRes.progressMap);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const isLocked = isPaid && !item.IsFree;
    const progress = progressMap[item._id]; // progress from DB
    const attemptStatus = progress?.AttemptStatus; // undefined | InProgress | Completed
    const AttemptId = progress?.AttemptId;

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.PaperTitle}</Text>
          {item.IsFree && isPaid && <Text style={styles.freeTag}>FREE</Text>}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱ {item.DurationInMinutes} min</Text>
          <Text style={styles.meta}>📝 {item.TotalQuestions} Qs</Text>
          <Text style={styles.meta}>🎯 {item.TotalMarks} Marks</Text>
        </View>

        {/* ---------- BUTTONS ---------- */}
        {!progress ? (
          // Test never started
          <TouchableOpacity
            style={[styles.actionBtn, isLocked && styles.lockedBtn]}
            onPress={() => {
              if (isLocked) {
                navigation.navigate('PurchaseScreen', { testId: item._id });
              } else {
                navigation.navigate('AttemptTestScreen', {
                  testId: item._id,
                  duration: item.DurationInMinutes,
                  marks: item.TotalMarks,
                  PaperTitle: item.PaperTitle,
                  resume: false,
                });
              }
            }}
          >
            <Text style={styles.actionText}>
              {isLocked ? 'Buy to Unlock 🔒' : 'Start Test ▶'}
            </Text>
          </TouchableOpacity>
        ) : attemptStatus === 'InProgress' ? (
          // Test started but not submitted
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#2e7d32', marginRight: 10 }]}
              onPress={() =>
                navigation.navigate('AttemptTestScreen', {
                  TestPaperId: item._id,
                  resume: true,
                })
              }
            >
              <Text style={styles.actionText}>Resume Test ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1976d2' }]}
              onPress={() =>
                navigation.navigate('AttemptTestScreen', {
                  testId: item._id,
                  duration: item.DurationInMinutes,
                  marks: item.TotalMarks,
                  PaperTitle: item.PaperTitle,
                  resume: false,
                })
              }
            >
              <Text style={styles.actionText}>Reattempt Test ▶</Text>
            </TouchableOpacity>
          </View>
        ) : attemptStatus === 'Completed' ? (
          // Test submitted
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#f39c12', marginRight: 10 }]}
              onPress={() =>
                navigation.navigate('TestResultScreen', {
                  AttemptId: AttemptId,
                })
              }
            >
              <Text style={styles.actionText}>View Result 📊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1976d2' }]}
              onPress={() =>
                navigation.navigate('AttemptTestScreen', {
                  testId: item._id,
                  duration: item.DurationInMinutes,
                  marks: item.TotalMarks,
                  PaperTitle: item.PaperTitle,
                  resume: false,
                })
              }
            >
              <Text style={styles.actionText}>Reattempt Test ▶</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  /* ---------------- HEADER ---------------- */
  useEffect(() => {
    navigation.setOptions({
      title: isPaid ? "Paid Test Paper" : "Free Test Paper",
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
  }, [isPaid]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={papers}
      keyExtractor={(item) => item._id!}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          No Test Papers Found
        </Text>
      }
    />
  );
};

export default TestPaperScreen;

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 16, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  freeTag: { backgroundColor: '#2e7d32', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  meta: { fontSize: 12, color: '#333' },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  lockedBtn: { backgroundColor: '#9e9e9e' },
  actionText: { color: '#000', fontWeight: '600' },
});
