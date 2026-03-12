import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import { getAllTestPaper, deleteTestPaper } from '@/src/api/adminApi/TestPaperApi';
import { getQuestionByTestPaperId } from '@/src/api/adminApi/QuestionWithOptionApi';
import { getAllCategories } from '@/src/api/adminApi/CategoryApi';
import { getTestSeriesByCategory } from '@/src/api/adminApi/TestSeriesApi';

const TestPaperScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [testSeriesList, setTestSeriesList] = useState<any[]>([]);
  const [selectedTestSeriesId, setSelectedTestSeriesId] = useState<string | null>(null);

  const [TestPapers, setTestPapers] = useState<any[]>([]);
  const [questionCountMap, setQuestionCountMap] = useState<Record<string, number>>({});

  // ================= LOAD QUESTION COUNT =================
  const loadQuestionCounts = async (testPapers: any[]) => {
    try {
      const map: Record<string, number> = {};

      await Promise.all(
        testPapers.map(async (paper) => {
          try {
            const res = await getQuestionByTestPaperId(paper._id);

            if (res?.success && Array.isArray(res.data)) {
              map[paper._id] = res.data.length;
            } else {
              map[paper._id] = 0;
            }
          } catch {
            map[paper._id] = 0;
          }
        })
      );

      setQuestionCountMap(map);
    } catch (error) {
      console.log('Error loading question counts', error);
    }
  };

  // ================= LOAD TEST PAPERS =================
  const loadTestPapers = async (testSeriesId?: string) => {
    setLoading(true);
    try {
      const res = await getAllTestPaper();

      if (res.success) {
        let filtered = res.TestPapers;

        if (testSeriesId) {
          filtered = res.TestPapers.filter(
            (paper: any) => paper.TestSeriesId === testSeriesId
          );
        }

        setTestPapers(filtered);
        await loadQuestionCounts(filtered);
      }
    } catch (e) {
      console.log('TestPapers load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD TEST SERIES =================
  const loadTestSeries = async (categoryId: string) => {
    try {
      const res = await getTestSeriesByCategory(categoryId);

      if (res.success && res.TestSeries?.length > 0) {
        setTestSeriesList(res.TestSeries);

        const defaultSeries = res.TestSeries[0];
        setSelectedTestSeriesId(defaultSeries._id);

        await loadTestPapers(defaultSeries._id);
      } else {
        setTestSeriesList([]);
        setSelectedTestSeriesId(null);
        setTestPapers([]);
      }
    } catch (error) {
      console.log('TestSeries load error', error);
    }
  };

  // ================= LOAD CATEGORIES =================
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();

      if (res.success && res.categories?.length > 0) {
        setCategories(res.categories);

        const defaultCategory = res.categories[0];
        setSelectedCategoryId(defaultCategory._id);

        await loadTestSeries(defaultCategory._id);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.log('Category load error', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this TestPaper?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await deleteTestPaper(id);
            if (res.success) {
              Alert.alert('✅ TestPaper deleted successfully');
              if (selectedTestSeriesId) {
                await loadTestPapers(selectedTestSeriesId);
              }
            }
          } catch (error) {
            Alert.alert('❌ Failed to delete TestPaper');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Test Papers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTestPaperForm' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Test Paper</Text>
        </TouchableOpacity>
      </View>

      {/* Category Dropdown */}
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedCategoryId}
          dropdownIconColor="#5d3fd3"
          style={styles.picker}
          onValueChange={(value) => {
            setSelectedCategoryId(value);
            loadTestSeries(value);
          }}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat._id} label={cat.CategoryName} value={cat._id} color="#333" />
          ))}
        </Picker>
      </View>

      {/* TestSeries Dropdown */}
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedTestSeriesId}
          dropdownIconColor="#5d3fd3"
          style={styles.picker}
          onValueChange={(value) => {
            setSelectedTestSeriesId(value);
            loadTestPapers(value);
          }}
        >
          {testSeriesList.map((series) => (
            <Picker.Item key={series._id} label={series.Title} value={series._id} color="#333" />
          ))}
        </Picker>
      </View>

      <FlatList
        data={TestPapers}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.testPaperCard}>
            <Text style={styles.paperTitle}>{item.PaperTitle}</Text>

            <Text style={styles.meta}>⏱ Duration: {item.DurationInMinutes} mins</Text>
            <Text style={styles.meta}>📝 Marks: {item.TotalMarks}</Text>
            <Text style={styles.meta}>🎯 Level: {item.PaperLevel}</Text>
            <Text style={styles.meta}>
              ❓ {questionCountMap[item._id] ?? 0} Questions Selected
            </Text>
            <Text style={styles.meta}>
              💰 {item.TestSeries?.IsPaid ? 'Paid Paper' : 'Free Paper'}
            </Text>
            <Text style={styles.meta}>📌 Status: {item.Status}</Text>

            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate(
                    'AddTestPaperForm' as never,
                    { TestPaperId: item._id } as never
                  )
                }
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate(
                    'SelectQuestionToTestPaper' as never,
                    { TestPaperId: item._id } as never
                  )
                }
              >
                <Text style={styles.actionButtonText}>Select Qns</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate(
                    'AddQuestionWithOptionForm' as never,
                    { TestPaperId: item._id } as never
                  )
                }
              >
                <Text style={styles.actionButtonText}>Add Qsn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonDELETE}
                onPress={() => handleDelete(item._id)}
              >
                <Text style={styles.actionButtonTextDELETE}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No Test Papers found</Text>}
      />
    </View>
  );
};

export default TestPaperScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f3f0ff',
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    color: '#333',
  },

  heading: { fontSize: 20, fontWeight: '700' },

  addButton: {
    backgroundColor: '#5d3fd3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addButtonText: { color: '#fff', fontWeight: '600' },

  testPaperCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  paperTitle: { fontSize: 16, fontWeight: 'bold' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },

  actionButtonsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 6,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: '#5d3fd3',
    borderWidth: 1,
  },

  actionButtonDELETE: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#dc3545',
  },

  actionButtonText: {
    color: '#5d3fd3',
    fontSize: 12,
    fontWeight: '600',
  },

  actionButtonTextDELETE: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});