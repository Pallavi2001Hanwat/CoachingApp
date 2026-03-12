import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllPYPCategories } from '../../../api/studentApi/PreviousYearPaper';

const PYPCategoryScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Call1")
    fetchData();

    navigation.setOptions({
      title: 'Previous Year Papers',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("pallavi")
      const data = await getAllPYPCategories();
      setCategories(data.Categories);
    } catch (error) {
      console.log('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('PreviousYearPaperScreen', {
            PYPCategoryId: item._id,
          })
        }
      >
        <Image source={{ uri: item.Image }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title}>{item.Title}</Text>
          <Text style={styles.status}>{item.Status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          No Previous Year Papers Found
        </Text>
      }
    />
  );
};

export default PYPCategoryScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    marginTop: 4,
    color: '#666',
  },
});
