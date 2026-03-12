import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getSubjectsByCourseId } from '../../../api/studentApi/CoursesApi';
import SubjectChaptersList from './SubjectChaptersList';

interface Props {
  courseId: string;
}

const CourseSubjectsList: React.FC<Props> = ({ courseId }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjectsByCourseId(courseId);
      if (res?.success) {
        setSubjects(res.subjects);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* 🔄 SHOW CHAPTERS WHEN SUBJECT SELECTED */
  if (selectedSubjectId) {
    return (
      <SubjectChaptersList
        subjectId={selectedSubjectId}
        onBack={() => setSelectedSubjectId(null)}
      />
    );
  }

  /* ⏳ LOADING */
  if (loading) {
    return <ActivityIndicator size="large" color="#5d3fd3" />;
  }

  /* 😕 EMPTY */
  if (!subjects.length) {
    return <Text style={styles.empty}>No subjects available</Text>;
  }

  /* 📘 SUBJECT LIST */
  return (
    <FlatList
      data={subjects}
      keyExtractor={item => item._id}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setSelectedSubjectId(item._id)}
        >
          <Text style={styles.title}>{item.Title}</Text>
          <Text style={styles.code}>{item.SubjectCode}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default CourseSubjectsList;

/* 🎨 STYLES */
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
  code: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});
