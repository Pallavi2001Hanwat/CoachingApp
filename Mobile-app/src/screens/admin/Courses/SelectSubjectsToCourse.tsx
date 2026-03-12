// SelectSubjectsChaptersTopicsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// ---- Replace these imports with your actual api functions ----
import { getAllSubjects } from '@/src/api/adminApi/SubjectApi';
import { getChaptersBySubjectId } from '@/src/api/adminApi/ChapterApi';
import { getTopicsByChapterId } from '@/src/api/adminApi/TopicsApi';
import { getCourseById, addSubjectToCourse } from '@/src/api/adminApi/CoursesApi';
// --------------------------------------------------------------

type Subject = { _id: string; Title: string };
type Chapter = { _id: string; Title: string };
type Topic = { _id: string; title: string };

const Checkbox = ({ checked }: { checked: boolean }) => (
  <Text style={{ width: 28, textAlign: 'center' }}>{checked ? '✔' : '⬜'}</Text>
);

const SelectSubjectsChaptersTopicsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { CourseId } = (route.params || {}) as { CourseId?: string };

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [courseTitle, setCourseTitle] = useState<string>('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chaptersBySubject, setChaptersBySubject] = useState<Record<string, Chapter[]>>({});
  const [topicsByChapter, setTopicsByChapter] = useState<Record<string, Topic[]>>({});

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    loadInitial();
  }, [CourseId]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      // 1. Load all subjects
      const sRes = await getAllSubjects();
      if (sRes?.success) {
        setSubjects(sRes.Subjects || []);
      } else {
        setSubjects([]);
      }

      // 2. If CourseId provided → load course details and preselect
      if (CourseId) {
        const cRes = await getCourseById(CourseId);
        if (cRes?.success && cRes.course) {
          const c = cRes.course;
          setCourseTitle(c.Title || '');
          setSelectedSubjects(Array.isArray(c.SelectedSubjects) ? c.SelectedSubjects : []);
          setSelectedChapters(Array.isArray(c.SelectedChapters) ? c.SelectedChapters : []);
          setSelectedTopics(Array.isArray(c.SelectedTopics) ? c.SelectedTopics : []);

          // Load chapters for preselected subjects (so UI can show expanded lists)
          if (Array.isArray(c.SelectedSubjects)) {
            await Promise.all(
              c.SelectedSubjects.map(async (subId: string) => {
                try {
                  const chRes = await getChaptersBySubjectId(subId);
                  if (chRes?.success) {
                    setChaptersBySubject((prev) => ({ ...prev, [subId]: chRes.Chapters || [] }));
                  }
                } catch (e) {
                  // ignore single subject failure
                }
              })
            );
          }

          // Load topics for preselected chapters
          if (Array.isArray(c.SelectedChapters)) {
            await Promise.all(
              c.SelectedChapters.map(async (chId: string) => {
                try {
                  const tRes = await getTopicsByChapterId(chId);
                  if (tRes?.success) {
                    setTopicsByChapter((prev) => ({ ...prev, [chId]: tRes.Topics || [] }));
                  }
                } catch (e) {
                  // ignore
                }
              })
            );
          }
        } else {
          Alert.alert('Failed to load course details');
        }
      }
    } catch (err) {
      Alert.alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle subject selection
  const toggleSubject = async (subjectId: string) => {
    let updated = [...selectedSubjects];
    if (updated.includes(subjectId)) {
      // remove subject
      updated = updated.filter((id) => id !== subjectId);
      setSelectedSubjects(updated);

      // remove all chapters under this subject from selectedChapters & selectedTopics
      const itsChapters = chaptersBySubject[subjectId] || [];
      const itsChapterIds = itsChapters.map((c) => c._id);

      setSelectedChapters((prev) => prev.filter((id) => !itsChapterIds.includes(id)));
      setSelectedTopics((prev) =>
        prev.filter((tId) => {
          // keep topics whose chapter is not this subject's chapters
          for (const chId of itsChapterIds) {
            const topics = topicsByChapter[chId] || [];
            if (topics.some((t) => t._id === tId)) return false;
          }
          return true;
        })
      );
    } else {
      // add subject
      updated.push(subjectId);
      setSelectedSubjects(updated);

      // load chapters for this subject (if not already)
      if (!chaptersBySubject[subjectId]) {
        try {
          const chRes = await getChaptersBySubjectId(subjectId);
          if (chRes?.success) {
            setChaptersBySubject((prev) => ({ ...prev, [subjectId]: chRes.Chapters || [] }));
          } else {
            setChaptersBySubject((prev) => ({ ...prev, [subjectId]: [] }));
          }
        } catch (e) {
          setChaptersBySubject((prev) => ({ ...prev, [subjectId]: [] }));
        }
      }
    }
  };

  // Toggle chapter selection
  const toggleChapter = async (chapterId: string, subjectId: string) => {
    let updated = [...selectedChapters];
    if (updated.includes(chapterId)) {
      // remove chapter
      updated = updated.filter((id) => id !== chapterId);
      setSelectedChapters(updated);

      // remove topics of this chapter
      const itsTopics = topicsByChapter[chapterId] || [];
      const itsTopicIds = itsTopics.map((t) => t._id);
      setSelectedTopics((prev) => prev.filter((tId) => !itsTopicIds.includes(tId)));
    } else {
      // add chapter
      updated.push(chapterId);
      setSelectedChapters(updated);

      // ensure its chapter list loaded
      if (!topicsByChapter[chapterId]) {
        try {
          const tRes = await getTopicsByChapterId(chapterId);
          if (tRes?.success) {
            setTopicsByChapter((prev) => ({ ...prev, [chapterId]: tRes.Topics || [] }));
          } else {
            setTopicsByChapter((prev) => ({ ...prev, [chapterId]: [] }));
          }
        } catch (e) {
          setTopicsByChapter((prev) => ({ ...prev, [chapterId]: [] }));
        }
      }
    }
  };

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    let updated = [...selectedTopics];
    if (updated.includes(topicId)) {
      updated = updated.filter((id) => id !== topicId);
    } else {
      updated.push(topicId);
    }
    setSelectedTopics(updated);
  };

  const handleSave = async () => {
    if (!CourseId) {
      Alert.alert('CourseId missing');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        SelectedSubjects: selectedSubjects,
        SelectedChapters: selectedChapters,
        SelectedTopics: selectedTopics,
      };

      const res = await addSubjectToCourse(CourseId, payload);
      if (res?.success) {
        Alert.alert('Saved successfully');
        navigation.goBack();
      } else {
        Alert.alert('Failed to save');
      }
    } catch (err) {
      Alert.alert('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{courseTitle || 'Select Subjects / Chapters / Topics'}</Text>

        {subjects.length === 0 && (
          <Text style={{ marginBottom: 10 }}>No subjects available.</Text>
        )}

        {subjects.map((sub) => {
          const isSubSelected = selectedSubjects.includes(sub._id);
          const chList = chaptersBySubject[sub._id] || [];

          return (
            <View key={sub._id} style={styles.block}>
              <TouchableOpacity
                onPress={() => toggleSubject(sub._id)}
                style={styles.row}
                activeOpacity={0.7}
              >
                <Checkbox checked={isSubSelected} />
                <Text style={styles.subjectTitle}>{sub.Title}</Text>
              </TouchableOpacity>

              {/* Chapters (shown if subject selected) */}
              {isSubSelected && (
                <View style={{ marginLeft: 18, marginTop: 8 }}>
                  {/* If chapters not yet loaded, show load button / spinner */}
                  {chList.length === 0 ? (
                    <TouchableOpacity
                      onPress={async () => {
                        // force load
                        try {
                          const chRes = await getChaptersBySubjectId(sub._id);
                          if (chRes?.success) {
                            setChaptersBySubject((prev) => ({ ...prev, [sub._id]: chRes.Chapters || [] }));
                          } else {
                            setChaptersBySubject((prev) => ({ ...prev, [sub._id]: [] }));
                          }
                        } catch (e) {
                          setChaptersBySubject((prev) => ({ ...prev, [sub._id]: [] }));
                        }
                      }}
                      style={{ paddingVertical: 6 }}
                    >
                      <Text style={{ color: '#007bff' }}>Load chapters</Text>
                    </TouchableOpacity>
                  ) : null}

                  {chList.map((ch) => {
                    const isChSelected = selectedChapters.includes(ch._id);
                    const tList = topicsByChapter[ch._id] || [];

                    return (
                      <View key={ch._id} style={{ marginBottom: 6 }}>
                        <TouchableOpacity
                          onPress={() => toggleChapter(ch._id, sub._id)}
                          style={styles.row}
                          activeOpacity={0.7}
                        >
                          <Checkbox checked={isChSelected} />
                          <Text style={styles.chapterTitle}>{ch.Title}</Text>
                        </TouchableOpacity>

                        {/* Topics under chapter */}
                        {isChSelected && (
                          <View style={{ marginLeft: 18, marginTop: 6 }}>
                            {tList.length === 0 ? (
                              <TouchableOpacity
                                onPress={async () => {
                                  try {
                                    const tRes = await getTopicsByChapterId(ch._id);
                                    if (tRes?.success) {
                                      setTopicsByChapter((prev) => ({ ...prev, [ch._id]: tRes.Topics || [] }));
                                    } else {
                                      setTopicsByChapter((prev) => ({ ...prev, [ch._id]: [] }));
                                    }
                                  } catch (e) {
                                    setTopicsByChapter((prev) => ({ ...prev, [ch._id]: [] }));
                                  }
                                }}
                                style={{ paddingVertical: 6 }}
                              >
                                <Text style={{ color: '#007bff' }}>Load topics</Text>
                              </TouchableOpacity>
                            ) : null}

                            {tList.map((t) => {
                              const isTSelected = selectedTopics.includes(t._id);
                              return (
                                <TouchableOpacity
                                  key={t._id}
                                  onPress={() => toggleTopic(t._id)}
                                  style={[styles.row, { marginBottom: 4 }]}
                                  activeOpacity={0.7}
                                >
                                  <Checkbox checked={isTSelected} />
                                  <Text style={styles.topicTitle}>{t.Title}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 30 }} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Selections</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default SelectSubjectsChaptersTopicsScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  block: { marginBottom: 12, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  subjectTitle: { fontSize: 16, marginLeft: 8, fontWeight: '600' },
  chapterTitle: { fontSize: 15, marginLeft: 8 },
  topicTitle: { fontSize: 14, marginLeft: 8, color: '#333' },
  saveBtn: {
    backgroundColor: '#5d3fd3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
