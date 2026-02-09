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
import { getAllUsers, deleteUser } from '@/src/api/adminApi/UsersApi';

const UsersScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [Users, setUsers] = useState<any[]>([]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.Users);
      }

    } catch (e) {
      console.log('Users load error', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Automatically reload whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  // ✅ Handle Delete User
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteUser(id);
              if (res.success) {
                Alert.alert('✅ User deleted successfully');
                await loadUser(); // refresh list
              }

            } catch (error) {
              console.error('Delete user failed:', error);
              Alert.alert('❌ Failed to delete user');
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
    {/* Header Section */}
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Users</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUserForm' as never)}
      >
        <Text style={styles.addButtonText}>+ Add User</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={Users}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.userCard}>
          <View style={styles.userTopStyle}>
            <Text style={styles.userTitle}>
              {item.FirstName} {item.LastName}
            </Text>

            <Text style={styles.userDescription}>
              📧 {item.Email}
            </Text>

            <Text style={styles.userDescription}>
              📞 {item.Phone}
            </Text>

            <Text style={styles.userDescription}>
              🎭 Roles: {item.Roles?.join(', ') || 'N/A'}
            </Text>

            <Text style={styles.userDescription}>
              👤 Gender: {item.Gender}
            </Text>

            <Text style={styles.userStatus}>
              📌 Status: {item.IsActive ? 'Active' : 'Inactive'}
            </Text>

            <Text style={styles.userDate}>
              Created: {new Date(item.createdDate).toLocaleDateString()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
              onPress={() =>
                navigation.navigate(
                  'AddUserForm' as never,
                  { userId: item._id } as never
                )
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButtonDELETE,
                { backgroundColor: '#dc3545' },
              ]}
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
      ListEmptyComponent={<Text>No Users found</Text>}
    />
  </View>
);

};

export default UsersScreen;

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

  userCard: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    gap: 5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  userTopStyle: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  userTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  userDescription: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },

  userStatus: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  userDate: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },

  actionButtonsWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 10,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: '#5d3fd3',
    borderWidth: 1,
  },

  actionButtonDELETE: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: '#dc3545',
    borderWidth: 1,
  },

  actionButtonText: {
    color: '#5d3fd3',
    fontSize: 12,
    fontWeight: '600',
  },

  actionButtonTextDELETE: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

