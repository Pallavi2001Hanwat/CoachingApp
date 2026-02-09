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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllCourses, deleteCourse } from '@/src/api/adminApi/CoursesApi';

const CoursesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      if (res.success) {
        setCourses(res.courses);
      }

    } catch (e) {
      console.log('Courses load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Automatically reload whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  // ✅ Handle Delete Course
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteCourse(id);
              if (res.success) {
                Alert.alert('✅ Course deleted successfully');
                await loadCourses(); // refresh list
              }

            } catch (error) {
              console.error('Delete Course failed:', error);
              Alert.alert('❌ Failed to delete Course');
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
      {/* Header Section with Add Course Button */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Courses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCourseForm' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Course</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <View style={ styles.coursetopstyle }>
              <Text style={styles.courseTitle}>{item.Title}</Text>
              <Text style={styles.courseDescription}>
                {item.Description?.length > 80
                  ? item.Description.slice(0, 80) + '...'
                  : item.Description}
              </Text>
              <Text style={styles.courseCategory}>
                📚 Category: {item?.Category?.CategoryName ?? "No Category"}

              </Text>
              <Text style={styles.courseLevel}>🎓 Level: {item.Level}</Text>
              <Text style={styles.coursePrice}>
                💰 Price: {item.IsPaid ? `₹${item.Price}` : 'Free'}
              </Text>
              {item.Language && (
                <Text style={styles.courseLanguage}>
                  🌐 Language: {item.Language}
                </Text>
              )}
            </View>

            {/* ✅ Edit Button */}
            <View style={styles.actionbuttonswrapper}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
              onPress={() =>
                navigation.navigate(
                  'AddCourseForm' as never,
                  { CourseId: item._id } as never
                )
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

             <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
              onPress={() =>
                navigation.navigate(
                  'SelectSubjectsToCourse' as never,
                  { CourseId: item._id } as never
                )
              }
            >
              <Text style={styles.actionButtonText}>Add Subjects</Text>
            </TouchableOpacity>

            {/* ✅ Delete Button */}
            <TouchableOpacity
              style={[styles.actionButtonDELETE, { backgroundColor: '#dc3545' }]}
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
        ListEmptyComponent={<Text>No Courses found</Text>}
      />
    </View>
  );
};

export default CoursesScreen;

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
  courseCard: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    gap:5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  courseTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  courseDescription: { color: '#555', fontSize: 14, marginTop: 4 },
  courseCategory: { color: '#666', fontSize: 13, marginTop: 4 },
  courseLevel: { color: '#666', fontSize: 13, marginTop: 2 },
  coursePrice: { color: '#007bff', fontSize: 13, marginTop: 4 },
  courseLanguage: { color: '#555', fontSize: 13, marginTop: 2 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
    borderColor:'#5d3fd3',
    borderWidth:1
  },

  actionButtonDELETE:{
 paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
    borderColor:'#dc3545',
    borderWidth:1
  },
  actionButtonTextDELETE:{color: '#FFF', fontSize: 12, fontWeight: '600' },
  actionButtonText: { color: '#5d3fd3', fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
actionbuttonswrapper: {
  width:'100%',
  flex: 1,
  flexDirection: 'row',
  alignItems:'flex-end',
  justifyContent: 'flex-end',
  gap:2,
  marginTop:10,
},

coursetopstyle: {
  width: '100%',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
}


});
