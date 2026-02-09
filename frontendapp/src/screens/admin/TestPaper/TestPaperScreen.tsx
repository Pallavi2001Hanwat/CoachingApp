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
import { getAllTestPaper, deleteTestPaper } from '@/src/api/adminApi/TestPaperApi';
import {
  
  getQuestionByTestPaperId,
} from '@/src/api/adminApi/QuestionWithOptionApi';

const TestPaperScreen = () => {

  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [TestPapers, setTestPapers] = useState<any[]>([]);
const [questionCountMap, setQuestionCountMap] = useState<Record<string, number>>({});



  useFocusEffect(
    useCallback(() => {
      loadTestPapers();
    }, [])
  );
 // ================= LOAD ALREADY SELECTED QUESTIONS =================
 

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
const loadTestPapers = async () => {
  setLoading(true);
  try {
    const res = await getAllTestPaper();
    if (res.success) {
      setTestPapers(res.TestPapers);
      await loadQuestionCounts(res.TestPapers); // 🔥 important
    }
  } catch (e) {
    console.log('TestPapers load error', e);
  } finally {
    setLoading(false);
  }
};


  const onRefresh = async () => {
    setRefreshing(true);
    await loadTestPapers();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this TestPaper?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteTestPaper(id);
              if (res.success) {
                Alert.alert('✅ TestPaper deleted successfully');
                await loadTestPapers();
              }
            } catch (error) {
              console.error('Delete TestPaper failed:', error);
              Alert.alert('❌ Failed to delete TestPaper');
            }
          },
        },
      ]
    );
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
    {/* Header Section */}
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Test Papers</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTestPaperForm' as never)}
      >
        <Text style={styles.addButtonText}>+ Add Test Paper</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={TestPapers}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.testPaperCard}>
          {/* Top Content */}
          <View style={styles.cardTop}>
            <Text style={styles.paperTitle}>{item.PaperTitle}</Text>

            {item.Description && (
              <Text style={styles.paperDescription}>
                {item.Description.length > 80
                  ? item.Description.slice(0, 80) + '...'
                  : item.Description}
              </Text>
            )}

            <Text style={styles.meta}>⏱ Duration: {item.DurationInMinutes} mins</Text>
            <Text style={styles.meta}>📝 Marks: {item.TotalMarks}</Text>
            <Text style={styles.meta}>🎯 Level: {item.PaperLevel}</Text>
            <Text style={styles.meta}>
              ❓ {item.totalQuestions ?? 0} Questions Selected
            </Text>
            <Text style={styles.meta}>
              💰 {item.IsFree ? 'Free Paper' : 'Paid Paper'}
            </Text>

            <Text style={styles.status}>
              📌 Status: {item.Status}
            </Text>
          </View>

          {/* Action Buttons */}
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<Text>No Test Papers found</Text>}
    />
  </View>
);

};

export default TestPaperScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  cardTop: {
    width: '100%',
  },

  paperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  paperDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },

  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  status: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },

  actionButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
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
    borderColor: '#dc3545',
    borderWidth: 1,
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
