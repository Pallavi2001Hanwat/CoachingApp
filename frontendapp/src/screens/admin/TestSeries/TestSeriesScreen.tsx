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
import { getAllTestSeries, deleteTestSeries } from '@/src/api/adminApi/TestSeriesApi';

const TestSeriesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testSeries, setTestSeries] = useState<any[]>([]);

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
      loadTestSeries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTestSeries();
    setRefreshing(false);
  };

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
                Alert.alert('✅ Test Series deleted successfully');
                await loadTestSeries();
              }
            } catch (error) {
              console.error('Delete Test Series failed:', error);
              Alert.alert('❌ Failed to delete Test Series');
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
      <Text style={styles.heading}>Test Series</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTestSeriesForm' as never)}
      >
        <Text style={styles.addButtonText}>+ Add Test Series</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={testSeries}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.categoryCard}>
          {/* Top Content */}
          <View style={styles.categoryTopStyle}>
            {/* Thumbnail */}
            {item.Image ? (
              <Image source={{ uri: item.Image }} style={styles.thumbnail} />
            ) : null}

            <Text style={styles.categoryTitle}>{item.Title}</Text>

            {item.Description && (
              <Text style={styles.categoryDescription}>
                {item.Description.length > 80
                  ? item.Description.slice(0, 80) + '...'
                  : item.Description}
              </Text>
            )}

            {/* Paid / Free */}
            <Text style={styles.categoryStatus}>
              💰 {item.IsPaid ? `Paid | ₹${item.Price}` : 'Free'}
            </Text>

            {/* Status */}
            <Text style={styles.categoryStatus}>
              📌 Status: {item.Status}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate(
                  'AddTestSeriesForm' as never,
                  { TestSeriesId: item._id } as never
                )
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
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
      ListEmptyComponent={<Text>No Test Series found</Text>}
    />
  </View>
);

};

export default TestSeriesScreen;

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
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  categoryTopStyle: {
    width: '100%',
    alignItems: 'flex-start',
  },

  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
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

