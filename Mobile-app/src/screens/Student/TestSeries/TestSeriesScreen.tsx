import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

// ✅ API calls
import { getTestSeriesByCategory } from '../../../api/studentApi/TestSeries';
import { getAllCategories } from '../../../api/studentApi/CategoryApi';

const TestSeriesScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const params = route.params || {};
  const isPaid: boolean = params.isPaid ?? false;

  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const tabListRef = useRef<FlatList>(null);

  // 🔹 Fetch categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res?.success) {
        setCategories(res.categories);

        // set first category as default
        if (res.categories.length > 0) {
          setActiveCategory(res.categories[0]._id);
        }
      }
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

useEffect(() => {
  navigation.setOptions({
    title: 'Test Series',
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ paddingHorizontal: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
    ),
  });
}, []);


  // 🔹 Fetch test series whenever activeCategory or isPaid changes
  useEffect(() => {
    if (activeCategory) fetchTestSeries(activeCategory);
  }, [activeCategory, isPaid]);

  const fetchTestSeries = async (categoryId: string) => {
    try {
      setLoading(true);

      // Backend API call: fetch test series by categoryId & isPaid
      const res = await getTestSeriesByCategory(categoryId);

      if (res?.success) {
        setData(res.TestSeries);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log('Error fetching test series:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Scroll active tab to center
  useEffect(() => {
    const index = categories.findIndex((cat) => cat._id === activeCategory);
    if (index !== -1) {
      setTimeout(() => {
        tabListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, [activeCategory, categories]);

  // 🔹 Render Category Tab
  const renderTab = ({ item }: any) => {
    const isActive = item._id === activeCategory;
    return (
      <TouchableOpacity
        onPress={() => setActiveCategory(item._id)}
        style={[styles.tab, isActive && styles.activeTab]}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {item.CategoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  // 🔹 Render Test Series Card
 const renderItem = ({ item }: any) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() =>
      navigation.navigate('TestPaperScreen', {
        testSeriesId: item._id,
        isPaid,
      })
    }
  >
    <Image source={{ uri: item.Image }} style={styles.image} />
    
    <View style={styles.content}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.desc}>{item.Description}</Text>
      <Text style={styles.tests}>Total Tests: {item.TotalTests}</Text>

      {/* Price section optional – agar paid show karna hai */}
      {isPaid && (
        <View style={styles.priceRow}>
          {item.DiscountPrice ? (
            <>
              <Text style={styles.discountPrice}>₹{item.DiscountPrice}</Text>
              <Text style={styles.originalPrice}>₹{item.Price}</Text>
            </>
          ) : (
            <Text style={styles.discountPrice}>₹{item.Price}</Text>
          )}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Category Tabs */}
      <View style={{ paddingVertical: 8 }}>
        <FlatList
          ref={tabListRef}
          data={categories}
          horizontal
          keyExtractor={(item) => item._id}
          renderItem={renderTab}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* 🔹 Test Series List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No Test Series Found
          </Text>
        }
      />
    </View>
  );
};

export default TestSeriesScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5d3fd3',
  },
  activeTab: { backgroundColor: '#5d3fd3' },
  tabText: { color: '#5d3fd3', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: { height: 160, width: '100%' },
  content: { padding: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#555', marginBottom: 6 },
  tests: { fontSize: 12, color: '#333', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  discountPrice: { fontSize: 16, fontWeight: '700', color: '#2e7d32', marginRight: 8 },
  originalPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' },
  buyBtn: { backgroundColor: '#1976d2', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  startBtn: { backgroundColor: '#455a64', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: '600' },
});
