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
import { getAllSubjects, deleteSubject } from '@/src/api/adminApi/SubjectApi';

const SubjectsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [Subjects, setSubjects] = useState<any[]>([]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await getAllSubjects();
      if (res.success) {
        setSubjects(res.Subjects);
      }

    } catch (e) {
      console.log('Subjects load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Automatically reload whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  };

  // ✅ Handle Delete Subject
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Subject?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteSubject(id);
              if (res.success) {
                Alert.alert('✅ Subject deleted successfully');
                await loadSubjects(); // refresh list
              }

            } catch (error) {
              console.error('Delete Subject failed:', error);
              Alert.alert('❌ Failed to delete Subject');
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
      <Text style={styles.heading}>Subjects</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSubjectForm' as never)}
      >
        <Text style={styles.addButtonText}>+ Add Subject</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={Subjects}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.subjectCard}>
          <View style={styles.subjectTopStyle}>
            <Text style={styles.subjectTitle}>
              {item.Title}
            </Text>

            {item.Description && (
              <Text style={styles.subjectDescription}>
                {item.Description.length > 80
                  ? item.Description.slice(0, 80) + '...'
                  : item.Description}
              </Text>
            )}

            <Text style={styles.subjectStatus}>
              📌 Status: {item.Status ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
              onPress={() =>
                navigation.navigate(
                  'AddSubjectForm' as never,
                  { SubjectId: item._id } as never
                )
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButtonDELETE,
                { backgroundColor: '#dc3545' },
              ]}
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
      ListEmptyComponent={<Text>No Subjects found</Text>}
    />
  </View>
);

};

export default SubjectsScreen;

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

  /* 🔹 Card */
  subjectCard: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    gap: 5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  subjectTopStyle: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  subjectDescription: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },

  subjectStatus: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  /* 🔹 Action Buttons */
  actionButtonsWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 10,
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

