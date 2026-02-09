import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllPreviousYearPapersByCategoryId } from '../../../api/studentApi/PreviousYearPaper';

type PreviousYearPaper = {
  _id?: string;
  PYPCategoryId: string;
  PaperTitle: string;
  Year: number;
  TotalQuestions: number;
  TotalMarks: number;
  TimeDuration: number;
  PaperFileUrl: string;
  Status: 'Active' | 'Inactive';
};

const PreviousYearPaperScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const PYPCategoryId = route.params?.PYPCategoryId;

  const [papers, setPapers] = useState<PreviousYearPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: 'Previous Year Papers',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    if (PYPCategoryId) {
      fetchData();
    }
  }, [PYPCategoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllPreviousYearPapersByCategoryId(PYPCategoryId);
      if (res?.success) {
        setPapers(res.Papers);
      }
    } catch (error) {
      console.log('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

 const openPDF = (url: string) => {
  if (!url) return;
  navigation.navigate('PDFViewerScreen', { url });
};


  const renderItem = ({ item }: { item: PreviousYearPaper }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {item.PaperTitle} ({item.Year})
        </Text>

        <View style={styles.row}>
          <Text style={styles.meta}>📝 Questions: {item.TotalQuestions}</Text>
          <Text style={styles.meta}>🎯 Marks: {item.TotalMarks}</Text>
          <Text style={styles.meta}>⏱ Time: {item.TimeDuration} min</Text>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openPDF(item.PaperFileUrl)}
        >
          <Text style={styles.actionText}>Attempt ▶</Text>
        </TouchableOpacity>
      </View>
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
      data={papers}
      keyExtractor={(item) => item._id!}
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

export default PreviousYearPaperScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    marginBottom: 10,
  },
  meta: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#4caf50',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
