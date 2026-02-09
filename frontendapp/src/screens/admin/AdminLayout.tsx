import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/Ionicons";

import DashboardScreen from "./DashboardScreen";
import UsersStackNavigator from "@/src/navigation/Admin/UsersStackNavigator";
import CoursesStackNavigator from "@/src/navigation/Admin/CourseStackNavigator";
import CategoryStackNavigator from "@/src/navigation/Admin/CategoryStackNavigation";
import SubjectsStackNavigator from "@/src/navigation/Admin/SubjectsStackNavigator";
import ChapterStackNavigator from "@/src/navigation/Admin/ChapterStackNavigator";
import TopicsStackNavigator from "@/src/navigation/Admin/TopicStackNavigator";
import Dashboard_ItemsStackNavigator from "@/src/navigation/Admin/Dashboard_ItemStackNavigator";
import TestSeriesStackNavigator from "@/src/navigation/Admin/TestSeriesStackNavigator";
import TestPaperStackNavigator from "@/src/navigation/Admin/TestPaperStackNavigator";
import QuestionWithOptionsStackNavigator from "@/src/navigation/Admin/QuestionWithOptionStakNavigator";
import PYPCategoryStackNavigator from "@/src/navigation/Admin/PYPCategoryStackNavigator";
import PreviousYearPaperStackNavigator from "@/src/navigation/Admin/PreviousYearPaperStackNavigator";
import CurrentAffairsStackNavigator from "@/src/navigation/Admin/CurrentAffairsStackNavigator";
import MonthlyCurrentAffairsStackNavigator from "@/src/navigation/Admin/MonthlyCurrentAffairsStackNavigator";

import { AuthContext } from "../../context/AuthContext";
import SyllabusCategoryStackNavigator from "@/src/navigation/Admin/SyllabusCategoryStackNavigator";
import SyllabusStackNavigator from "@/src/navigation/Admin/SyllabusStackNavigator";

const Drawer = createDrawerNavigator();

/* =========================
   CUSTOM DRAWER CONTENT
========================= */
const CustomDrawerContent = (props: any) => {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 SCROLLABLE ITEMS */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* 🔻 FIXED LOGOUT */}
      <TouchableOpacity style={styles.logoutItem} onPress={signOut}>
        <Icon name="log-out-outline" size={22} color="#d00" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

/* =========================
   ADMIN LAYOUT
========================= */
const AdminLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitleAlign: "center",

        headerRight: () => (
          <View style={styles.headerRight}>
            <Icon name="person-circle-outline" size={26} color="#333" />
            <Text style={styles.headerUserName}>
              {user?.name ?? "Admin"}
            </Text>
          </View>
        ),

        drawerActiveTintColor: "#5d3fd3",
        drawerActiveBackgroundColor: "#a395db5d",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontWeight: "600" },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Category"
        component={CategoryStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="albums-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Subject"
        component={SubjectsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="library-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Chapter"
        component={ChapterStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="layers-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Topics"
        component={TopicsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DashboardItems"
        component={Dashboard_ItemsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="TestSeries"
        component={TestSeriesStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="TestPaper"
        component={TestPaperStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="QuestionWithOption"
        component={QuestionWithOptionsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PYPCategory"
        component={PYPCategoryStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PreviousYearPaper"
        component={PreviousYearPaperStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="archive-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DailyCurrentAffairs"
        component={CurrentAffairsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="MonthlyCurrentAffairs"
        component={MonthlyCurrentAffairsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-outline" size={size} color={color} />
          ),
        }}
      />


      
      <Drawer.Screen
        name="SyllabusCategoryScreen"
        component={SyllabusCategoryStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />

 


          <Drawer.Screen
        name="SyllabusScreen"
        component={SyllabusStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Users"
        component={UsersStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminLayout;

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  headerUserName: {
    marginLeft: 5,
    fontWeight: "600",
    fontSize: 14,
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },

  logoutText: {
    color: "#d00",
    fontWeight: "600",
    marginLeft: 10,
  },
});
