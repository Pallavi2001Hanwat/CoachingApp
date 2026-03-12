import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getChaptersBySubjectId } from '../../../api/studentApi/SubjectApi';
import ChapterTopicsScreen from './ChapterTopicsScreen'; // 👈 topics screen import

interface Props {
  subjectId: string;
  onBack?: () => void;
}

const SubjectChaptersList: React.FC<Props> = ({ subjectId, onBack }) => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, [subjectId]);

  const fetchChapters = async () => {
    try {
      const res = await getChaptersBySubjectId(subjectId);
      if (res?.success) {
        setChapters(res.chapters);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Agar chapter select ho gaya → Topics Screen dikhao
  if (selectedChapterId) {
    return (
      <ChapterTopicsScreen
        chapterId={selectedChapterId}
        onBack={() => setSelectedChapterId(null)}
      />
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#5d3fd3" />;
  }

  if (!chapters.length) {
    return <Text style={styles.empty}>No chapters available</Text>;
  }

  return (
    <View>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Subjects</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={chapters}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedChapterId(item._id)} // 👈 CLICK HANDLER
          >
            <Text style={styles.title}>{item.Title}</Text>
            {item.Description ? (
              <Text style={styles.desc}>{item.Description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SubjectChaptersList;




const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f9f9ff',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  desc: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: '#5d3fd3',
    fontWeight: '600',
  },
});
