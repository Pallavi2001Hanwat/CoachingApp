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
  getAllSyllabusCategories,
  deleteSyllabusCategory,
} from '@/src/api/adminApi/SyllabusApi';

const SyllabusCategoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllSyllabusCategories();
      if (res.success) {
        setCategories(res.SyllabusCategories);
      }
    } catch (e) {
      console.log('Syllabus category load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reload on screen focus
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

  // ✅ Delete Category
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Syllabus Category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteSyllabusCategory(id);
              if (res.success) {
                Alert.alert('✅ Category deleted successfully');
                await loadCategories();
              }
            } catch (error) {
              console.error('Delete category failed:', error);
              Alert.alert('❌ Failed to delete category');
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
        <Text style={styles.heading}>Syllabus Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddSyllabusCategoryForm' as never)
          }
        >
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.title}>{item.CategoryName}</Text>

              {item.Description && (
                <Text style={styles.description}>
                  {item.Description.length > 80
                    ? item.Description.slice(0, 80) + '...'
                    : item.Description}
                </Text>
              )}

              <Text style={styles.status}>
                📌 Status: {item.Status ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#fff' }]}
                onPress={() =>
                  navigation.navigate(
                    'AddSyllabusCategoryForm' as never,
                    { SyllabusCategoryId: item._id } as never
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
        ListEmptyComponent={<Text>No Categories found</Text>}
      />
    </View>
  );
};

export default SyllabusCategoryScreen;



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
