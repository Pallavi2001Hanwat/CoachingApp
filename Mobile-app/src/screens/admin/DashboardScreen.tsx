// src/screens/admin/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { getAdminDashboard, DashboardData } from '../../api/adminApi/adminApi';

const DashboardScreen = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboard();
      setData(res);
    } catch (e) {
      console.log('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
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
      <Text style={styles.heading}>Admin Dashboard</Text>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text>Total Students</Text>
          <Text style={styles.cardValue}>{data?.totalStudents ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text>Total Courses</Text>
          <Text style={styles.cardValue}>{data?.totalCourses ?? 0}</Text>
        </View>
      </View>

      
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    margin: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardValue: { fontSize: 18, fontWeight: '700', marginTop: 5 },
  signupRow: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
