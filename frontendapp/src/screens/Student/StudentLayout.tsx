import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import DashboardScreen from './Dashboard/StudentDashboardScreen';
import ContactUsScreen from './ContactUsScreen/ContactUsScreen';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import TestSeriesScreen from './TestSeries/TestSeriesScreen';
import TestPaperScreen from './TestPaper/TestPaperScreen';
import TestSeriesStack from './StackNavigator/TestSeriesStack';
import CoursesStack from './StackNavigator/CoursesStack';
import CategoryStack from './StackNavigator/CategoryStack';
import PreviousYearPaperStack from './StackNavigator/PreviousYearPaperStack';
import CurrentAffairsStack from './StackNavigator/CurrentAffairsStack';
import SyllabusStack from './StackNavigator/SyllabusStack';

import ProfileStack from './StackNavigator/ProfileStack';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { signOut, user } = useContext(AuthContext);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      {/* 🔹 USER INFO HEADER */}
      <View style={styles.userSection}>
        <Icon name="person-circle-outline" size={70} color="#555" />
        <Text style={styles.userName}>
          {user?.name || user?.email?.split('@')[0] || 'Student'}
        </Text>
      </View>

      {/* Drawer Items */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      

      {/* 🔹 Logout */}
      <TouchableOpacity style={styles.logoutItem} onPress={signOut}>
        <Icon name="log-out-outline" size={22} color="#d00" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};


const StudentLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
  initialRouteName="Dashboard"
  drawerContent={(props) => <CustomDrawerContent {...props} />}
  screenOptions={({ route }) => {
    // 🔹 Default drawer header hidden for category / courses stack
    const hideHeaderScreens = ['CoursesStack', 'CategoryScreen', 'TestSeriesStack'];

    return {
      headerTitleAlign: 'center',
      headerShown: !hideHeaderScreens.includes(route.name),
      headerRight: () => (
        <View style={styles.headerRight}>
          <Icon name="person-circle-outline" size={26} color="#333" />
          <Text style={styles.headerUserName}>{user?.name ?? 'Admin'}</Text>
        </View>
      ),
    };
  }}
>
  <Drawer.Screen
  name="Dashboard"
  component={DashboardScreen}
  options={{
    title: 'Home',
    drawerLabel: 'Home',
    drawerIcon: ({ color, size }) => (
      <Icon name="home-outline" size={size} color={color} />
    ),
    headerShown: true,
  }}
/>
{/* 👇 CONTACT US — Home ke just niche */}
<Drawer.Screen
  name="ContactUs"
  component={ContactUsScreen}
  options={{
    title: 'Contact Us',
    drawerLabel: 'Contact Us',
    drawerIcon: ({ color, size }) => (
      <Icon name="call-outline" size={size} color={color} />
    ),
  }}
/>

{/* 👤 PROFILE — Home ke just niche */}
<Drawer.Screen
  name="ProfileStack"
  component={ProfileStack}
  options={{
    title: 'My Profile',
    drawerLabel: 'My Profile',
    drawerIcon: ({ color, size }) => (
      <Icon name="person-outline" size={size} color={color} />
    ),
     headerShown: false, 
  }}
/>

  <Drawer.Screen
  name="CategoryStack"
  component={CategoryStack}
  options={{
    drawerLabel: () => null,
    drawerIcon: () => null,
    headerShown: false, // Stack ke andar header manage hoga
  }}
/>


  <Drawer.Screen
    name="CoursesStack"
    component={CoursesStack}
    options={{
      drawerLabel: () => null,
      drawerIcon: () => null,
      headerShown: false, // Stack will handle header
    }}
  />

 <Drawer.Screen
    name="TestSeriesStack"
    component={TestSeriesStack}
    options={{
      drawerLabel: () => null,
      drawerIcon: () => null,
      headerShown: false, // Stack will handle header
    }}
  />

 


    <Drawer.Screen
    name="PreviousYearPaperStackNavigator"
    component={PreviousYearPaperStack}
    options={{
      drawerLabel: () => null,
      drawerIcon: () => null,
      headerShown: false, // Stack will handle header
    }}
  />

  <Drawer.Screen
    name="CurrentAffairsStack"
    component={CurrentAffairsStack}
    options={{
      drawerLabel: () => null,
      drawerIcon: () => null,
      headerShown: false, // Stack will handle header
    }}
  />

  <Drawer.Screen
    name="SyllabusStack"
    component={SyllabusStack}
    options={{
      drawerLabel: () => null,
      drawerIcon: () => null,
      headerShown: false, // Stack will handle header
    }}
  />


</Drawer.Navigator>

  );
};

export default StudentLayout;

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerUserName: { marginLeft: 5, fontWeight: '600', fontSize: 14 },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    color: '#d00',
    fontWeight: '600',
    marginLeft: 10,
  },
});
