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
import { getAllCategories, deleteCategory } from '@/src/api/adminApi/CategoryApi';

const CategorysScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      if (res.success) {
      setCategories(res.categories);
      }
    } catch (e) {
      console.log('Categories load error', e);
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
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteCategory(id);
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
      <View >
        <ActivityIndicator size="large" />
      </View>
    );
  }

 return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCategoryForm' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryTopStyle}>
              <Text style={styles.categoryTitle}>
                {item.CategoryName}
              </Text>

              {item.Description && (
                <Text style={styles.categoryDescription}>
                  {item.Description.length > 80
                    ? item.Description.slice(0, 80) + '...'
                    : item.Description}
                </Text>
              )}

              <Text style={styles.categoryStatus}>
                📌 Status: {item.Status ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
                onPress={() =>
                  navigation.navigate(
                    'AddCategoryForm' as never,
                    { CategoryId: item._id } as never
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

export default CategorysScreen;

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

  categoryCard: {
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

  categoryTopStyle: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  categoryDescription: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },

  categoryStatus: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

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

