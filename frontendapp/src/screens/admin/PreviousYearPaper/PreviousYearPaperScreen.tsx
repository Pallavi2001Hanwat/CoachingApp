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

import {
  getAllPreviousYearPapers,
  deletePreviousYearPaper,
} from '@/src/api/adminApi/PreviousYearPaper';

const PreviousYearPapersScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const res = await getAllPreviousYearPapers();

      if (res?.success) {
        setPapers(res.Papers);
      }
    } catch (error) {
      console.log('Load PreviousYearPapers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPapers();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPapers();
    setRefreshing(false);
  };

  // ✅ Delete Paper
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Paper',
      'Are you sure you want to delete this paper?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deletePreviousYearPaper(id);
              if (res?.success) {
                Alert.alert('✅ Paper deleted successfully');
                loadPapers();
              }
            } catch (err) {
              console.log(err);
              Alert.alert('❌ Failed to delete paper');
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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Previous Year Papers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddPreviousYearPaperForm' as never)
          }
        >
          <Text style={styles.addButtonText}>+ Add Paper</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={papers}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text>No papers found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.PaperTitle}</Text>

            <Text style={styles.subText}>🆔 Code: {item.PaperCode}</Text>
            <Text style={styles.subText}>📅 Year: {item.Year}</Text>
            <Text style={styles.subText}>🎯 Stage: {item.Stage}</Text>
            <Text style={styles.subText}>⏱ Shift: {item.Shift}</Text>
            <Text style={styles.subText}>🌐 Language: {item.Language}</Text>

            <View style={styles.row}>
              <Text style={styles.badge}>❓ {item.TotalQuestions} Qs</Text>
              <Text style={styles.badge}>🏆 {item.TotalMarks} Marks</Text>
              <Text style={styles.badge}>⏳ {item.TimeDuration} min</Text>
            </View>

            <Text
              style={[
                styles.status,
                { color: item.Status === 'Active' ? 'green' : 'red' },
              ]}
            >
              {item.Status}
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate(
                    'AddPreviousYearPaperForm' as never,
                    { PreviousYearPaperId: item._id } as never
                  )
                }
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default PreviousYearPapersScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  heading: { fontSize: 20, fontWeight: '700', color: '#000' },

  addButton: {
    backgroundColor: '#5d3fd3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addButtonText: { color: '#fff', fontWeight: '600' },

  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  subText: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  badge: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#333',
  },

  status: {
    marginTop: 8,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },

  editBtn: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },

  editText: { color: '#5d3fd3', fontWeight: '600' },

  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  deleteText: { color: '#fff', fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
