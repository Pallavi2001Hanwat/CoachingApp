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
  getAllSyllabus,
  deleteSyllabus,
} from '@/src/api/adminApi/SyllabusApi';

const SyllabusScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syllabusList, setSyllabusList] = useState<any[]>([]);

  const loadSyllabus = async () => {
    setLoading(true);
    try {
      const res = await getAllSyllabus();
      if (res.success) {
        setSyllabusList(res.Syllabus);
      }
    } catch (e) {
      console.log('Syllabus load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadSyllabus();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSyllabus();
    setRefreshing(false);
  };

  // ✅ Delete Syllabus
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Syllabus?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteSyllabus(id);
              if (res.success) {
                Alert.alert('✅ Syllabus deleted successfully');
                await loadSyllabus();
              }
            } catch (error) {
              console.error('Delete syllabus failed:', error);
              Alert.alert('❌ Failed to delete syllabus');
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
        <Text style={styles.heading}>Syllabus</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddSyllabusForm' as never)
          }
        >
          <Text style={styles.addButtonText}>+ Add Syllabus</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={syllabusList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.title}>{item.Title}</Text>

              {item.Description && (
                <Text style={styles.description}>
                  {item.Description.length > 80
                    ? item.Description.slice(0, 80) + '...'
                    : item.Description}
                </Text>
              )}

              <Text style={styles.category}>
                📚 Category: {item.SyllabusCategory?.CategoryName || '—'}
              </Text>

              <Text style={styles.status}>
                📌 Status: {item.Status}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#fff' }]}
                onPress={() =>
                  navigation.navigate(
                    'AddSyllabusForm' as never,
                    { SyllabusId: item._id } as never
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
        ListEmptyComponent={<Text>No Syllabus found</Text>}
      />
    </View>
  );
};

export default SyllabusScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

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

  card: {
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

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  description: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },

  category: {
    color: '#444',
    fontSize: 13,
    marginTop: 4,
  },

  status: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  actionButtonsWrapper: {
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
