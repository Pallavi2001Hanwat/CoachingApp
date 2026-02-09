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
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getAllPYPCategories,
  deletePYPCategory,
} from '@/src/api/adminApi/PreviousYearPapaerCategory';

const PYPCategorysScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllPYPCategories();

      if (res?.success) {
        setCategories(res.Categories);
      }
    } catch (error) {
      console.log('Load PYP Categories error:', error);
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

  // ✅ Delete Category
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deletePYPCategory(id);
              if (res?.success) {
                Alert.alert('✅ Category deleted');
                loadCategories();
              }
            } catch (err) {
              console.log(err);
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
        <Text style={styles.heading}>Previous Year Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddPYPCategoryForm' as never)
          }
        >
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text>No categories found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Image */}
            {item.Image ? (
              <Image source={{ uri: item.Image }} style={styles.image} />
            ) : null}

            {/* Title */}
            <Text style={styles.title}>{item.Title}</Text>

            {/* Status */}
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
                    'AddPYPCategoryForm' as never,
                    { PYPCategoryId: item._id } as never
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

export default PYPCategorysScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  heading: { fontSize: 20, fontWeight: '700' },

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

  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },

  title: { fontSize: 16, fontWeight: '700', color: '#333' },

  status: {
    marginTop: 4,
    fontWeight: '600',
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
