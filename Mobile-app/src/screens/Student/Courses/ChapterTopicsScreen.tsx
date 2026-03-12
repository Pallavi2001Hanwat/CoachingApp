import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getTopicsByChapterId, Topic } from '../../../api/studentApi/TopicOrClass';

interface Props {
  chapterId: string;
  onBack?: () => void;
}

const ChapterTopicsScreen: React.FC<Props> = ({ chapterId, onBack }) => {
  const [topics, setTopics] = useState<Topic[]>([]); // ✅ always array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [chapterId]);

  const fetchTopics = async () => {
    try {
      const res = await getTopicsByChapterId(chapterId);

      console.log('TOPICS API RESPONSE 👉', res); // 🔍 debug

      if (res?.success && Array.isArray(res.topics)) {
        setTopics(res.topics);
      } else {
        setTopics([]); // ✅ safety fallback
      }
    } catch (error) {
      console.log('Error fetching topics', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#5d3fd3" />;
  }

  if (topics.length === 0) {
    return <Text style={styles.empty}>No topics available</Text>;
  }

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Chapters</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={topics}
        keyExtractor={(item) => item._id!}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.Title}</Text>

            {item.Description && (
              <Text style={styles.desc}>{item.Description}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ChapterTopicsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: '#5d3fd3',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    marginTop: 6,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});
