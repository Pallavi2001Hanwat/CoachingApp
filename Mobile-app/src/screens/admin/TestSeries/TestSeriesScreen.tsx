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
import { Picker } from '@react-native-picker/picker';

import { getAllTestSeries, deleteTestSeries } from '@/src/api/adminApi/TestSeriesApi';
import { getAllCategories } from '@/src/api/adminApi/CategoryApi';

const TestSeriesScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // ---------------- LOAD CATEGORIES ----------------
  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setSelectedCategory(res.categories[0]._id);
        }
      }
    } catch (error) {
      console.log('Category load error', error);
    }
  };

  // ---------------- LOAD TEST SERIES ----------------
  const loadTestSeries = async () => {
    setLoading(true);
    try {
      const res = await getAllTestSeries();
      if (res.success) {
        setTestSeries(res.TestSeries);
      }
    } catch (e) {
      console.log('TestSeries load error', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadTestSeries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTestSeries();
    setRefreshing(false);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Test Series?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteTestSeries(id);
              if (res.success) {
                Alert.alert('✅ Deleted successfully');
                await loadTestSeries();
              }
            } catch (error) {
              Alert.alert('❌ Delete failed');
            }
          },
        },
      ]
    );
  };

  // ---------------- FILTER ----------------
  const filtered = testSeries.filter(
    item => item.CategoryId === selectedCategory
  );

  const paidSeries = filtered.filter(item => item.IsPaid);
  const freeSeries = filtered.filter(item => !item.IsPaid);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderRow = (item: any) => (
    <View style={styles.cardRow}>

      {/* LEFT IMAGE */}
      {item.Image ? (
        <Image source={{ uri: item.Image }} style={styles.rowImage} />
      ) : (
        <View style={styles.placeholderImage} />
      )}

      {/* CENTER CONTENT */}
      <View style={styles.rowContent}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {item.Title}
        </Text>

        <Text style={styles.rowPrice}>
          {item.IsPaid ? `₹${item.Price}` : 'Free'}
        </Text>
      </View>

      {/* RIGHT BUTTONS */}
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate(
              'AddTestSeriesForm' as never,
              { TestSeriesId: item._id } as never
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
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Test Series</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTestSeriesForm' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Test Series</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY DROPDOWN */}
      <View style={styles.dropdownWrapper}>
        <Picker
          mode="dropdown"
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={{ color: '#000' }}
          dropdownIconColor="#000"
        >
          {categories.map((cat) => (
            <Picker.Item
              key={cat._id}
              label={cat.CategoryName}
              value={cat._id}
            />
          ))}
        </Picker>
      </View>

      {/* PAID SECTION */}
      <Text style={styles.sectionHeader}>Paid Series</Text>
      <View style={styles.sectionContainer}>
        <FlatList
          data={paidSeries}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => renderRow(item)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Paid Series</Text>
          }
        />
      </View>

      {/* FREE SECTION */}
      <Text style={styles.sectionHeader}>Free Series</Text>
      <View style={styles.sectionContainer}>
        <FlatList
          data={freeSeries}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => renderRow(item)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Free Series</Text>
          }
        />
      </View>

    </View>
  );
};

export default TestSeriesScreen;

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
    color: '#5d3fd3',
  },

  sectionContainer: {
    height: 220,
    marginBottom: 15,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  rowImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },

  rowContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  rowPrice: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },

  rowButtons: {
    justifyContent: 'center',
    gap: 6,
  },

  editBtn: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  editText: { color: '#5d3fd3', fontWeight: '600', fontSize: 12 },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});