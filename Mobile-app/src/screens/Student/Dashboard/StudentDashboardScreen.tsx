// src/screens/user/HomeScreen.tsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getAll_Active_Dashboard_Items } from '../../../api/studentApi/DashboardItemApi';
import { AuthContext } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const [dashboardItems, setDashboardItems] = useState<any[]>([]);

  // ---------------- SLIDER DATA ----------------
  const sliderImages = [
    { id: '1', image: 'https://picsum.photos/800/400?1' },
    { id: '2', image: 'https://picsum.photos/800/400?2' },
    { id: '3', image: 'https://picsum.photos/800/400?3' },
  ];

  const sliderRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ---------------- AUTO SLIDE ----------------
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        currentIndex === sliderImages.length - 1 ? 0 : currentIndex + 1;

      sliderRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // ---------------- NAVIGATION HANDLER ----------------
  const handleNavigation = (item: any) => {
    switch (item.Type) {
      case 'Paid Course':
        navigation.navigate('CategoryStack', {
          screen: 'CategoryScreen',
          params: { isPaid: true },
        });
        break;

      case 'Free Course':
        navigation.navigate('CoursesStack', {
          screen: 'CoursesScreen',
          params: { isPaid: false },
        });
        break;

      case 'Test Series':
        navigation.navigate('TestSeriesStack', {
          screen: 'TestSeriesScreen',
          params: { isPaid: true },
        });
        break;

      case 'Free Test':
        navigation.navigate('TestSeriesStack', {
          screen: 'TestSeriesScreen',
          params: { isPaid: false },
        });
        break;

      case 'Previous Papers':
        navigation.navigate('PreviousYearPaperStackNavigator', {
          screen: 'PYPCategoryScreen',
        });
        break;

      case 'Current Affairs':
        navigation.navigate('CurrentAffairsStack', {
          screen: 'CurrentAffairsScreen',
        });
        break;

          case 'Syllabus':
        navigation.navigate('SyllabusStack', {
          screen: 'SyllabusCategoryScreen',
        });
        break;

      default:
        Alert.alert('Error', 'Screen not configured');
    }
  };

  // ---------------- FETCH DASHBOARD ITEMS ----------------
  const fetchDashboardItems = async () => {
    try {
      setLoading(true);
      const res = await getAll_Active_Dashboard_Items();
      if (res?.success) {
        setDashboardItems(res.Dashboard_Items || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardItems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardItems();
    setRefreshing(false);
  };

  // ---------------- SLIDER ITEM ----------------
  const renderSliderItem = ({ item }: any) => (
    <Image source={{ uri: item.image }} style={styles.sliderImage} />
  );

  // ---------------- DASHBOARD ITEM ----------------
  const renderDashboardItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleNavigation(item)}
    >
      <Image source={{ uri: item.Image }} style={styles.thumbnail} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.cardTitle}>{item.Title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.Description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi, {user?.email?.split('@')[0] || 'Student'} 👋
          </Text>
          <Text style={styles.subtitle}>Explore learning categories</Text>
        </View>

        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE SLIDER */}
      <View>
        <FlatList
          ref={sliderRef}
          data={sliderImages}
          renderItem={renderSliderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x /
                e.nativeEvent.layoutMeasurement.width
            );
            setCurrentIndex(index);
          }}
        />

        {/* DOTS */}
        <View style={styles.dotsContainer}>
          {sliderImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* DASHBOARD LIST */}
      <FlatList
        data={dashboardItems}
        keyExtractor={(item) => item._id}
        renderItem={renderDashboardItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 60 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No dashboard items</Text>
        }
      />
    </View>
  );
};

export default DashboardScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666' },
  logoutText: { color: '#e63946', fontWeight: '600' },

  sliderImage: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    marginRight: 10,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007bff',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  thumbnail: { width: 70, height: 70, borderRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#666' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },
});
