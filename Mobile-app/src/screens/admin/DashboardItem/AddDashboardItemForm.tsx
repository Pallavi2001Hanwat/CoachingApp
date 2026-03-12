import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    createDashboard_Item,
    getDashboard_ItemById,
    updateDashboard_Item,
} from '@/src/api/adminApi/DashboardItemApi';

const AddDashboard_ItemForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { Dashboard_ItemId } = route.params || {};

    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [visibility, setVisibility] = useState('Free');
    const [type, setType] = useState('Paid Course');
    const [action, setAction] = useState('');

    const [orderNumber, setOrderNumber] = useState('0');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    // Auto slug generator
    useEffect(() => {
        const makeSlug = (text: string) =>
            text
                .toLowerCase()
                .replace(/\s+/g, "-");

        setAction(`/${makeSlug(type)}`);
    }, [type]);

    // Load Existing Dashboard Item
    useEffect(() => {
        if (Dashboard_ItemId) loadDashboard_ItemDetails(Dashboard_ItemId);
    }, [Dashboard_ItemId]);

    const loadDashboard_ItemDetails = async (id: string) => {
        try {
            setLoading(true);
            const res = await getDashboard_ItemById(id);

            if (res?.success) {
                const item = res.Dashboard_Item;

                setTitle(item.Title || '');
                setDescription(item.Description || '');
                setImage(item.Image || '');
                setType(item.Type || 'Paid Course');
                setVisibility(item.Visibility || 'Free');
                setAction(item.Action || '');
                setOrderNumber(item.OrderNumber?.toString() || '0');
                setStatus(item.Status || 'Active');
            }
        } catch (err) {
            console.log("Error loading:", err);
        } finally {
            setLoading(false);
        }
    };

    // Image Picker
    const handleSelectImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Please allow gallery access!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                setImage(`data:image/jpeg;base64,${asset.base64}`);
            }
        } catch (err) {
            Alert.alert("Error selecting image");
        }
    };

    // Save Dashboard Item
    const handleSaveDashboard_Item = async () => {
        if (!title || !type) {
            Alert.alert("Please fill required fields");
            return;
        }

        const Dashboard_ItemData = {
            Title: title,
            Description: description,
            Image: image,
            Type: type,
            Action: action,  // Auto slug
            Visibility: visibility,
            OrderNumber: Number(orderNumber),
            Status: status
        };

        try {
            let res;
            if (Dashboard_ItemId) {
                res = await updateDashboard_Item(Dashboard_ItemId, Dashboard_ItemData);
            } else {
                res = await createDashboard_Item(Dashboard_ItemData);
            }

            if (res?.success) {
                Alert.alert(`Dashboard Item ${Dashboard_ItemId ? 'updated' : 'added'} successfully`);
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Failed to save Dashboard Item");
        }
    };

  return (
    <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.heading}>
                {Dashboard_ItemId ? "Edit Dashboard Item" : "Add New Dashboard Item"}
            </Text>

            {/* Title */}
            <TextInput
                placeholder="Title *"
                placeholderTextColor="#000"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />

            {/* Description */}
            <TextInput
                placeholder="Description"
                placeholderTextColor="#000"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
            />

            {/* Type Picker */}
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Type *</Text>
                <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
                    <Picker.Item label="Paid Course" value="Paid Course" />
                    <Picker.Item label="Free Course" value="Free Course" />
                    <Picker.Item label="Test Series" value="Test Series" />
                    <Picker.Item label="Free Test" value="Free Test" />
                    <Picker.Item label="Previous Papers" value="Previous Papers" />
                    <Picker.Item label="Current Affairs" value="Current Affairs" />
                    <Picker.Item label="Quiz" value="Quiz" />
                    <Picker.Item label="Syllabus" value="Syllabus" />
                    <Picker.Item label="Books" value="Books" />
                    <Picker.Item label="Job Alerts" value="Job Alerts" />
                    <Picker.Item label="E-Books" value="E-Books" />
                </Picker>
                <Text style={styles.arrow}>▼</Text>
            </View>

            {/* Visibility Picker */}
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Visibility</Text>
                <Picker selectedValue={visibility} onValueChange={setVisibility} style={styles.picker}>
                    <Picker.Item label="Free" value="Free" />
                    <Picker.Item label="Paid" value="Paid" />
                </Picker>
                <Text style={styles.arrow}>▼</Text>
            </View>

            {/* Action URL (Readonly) */}
            <TextInput
                placeholder="Action URL"
                value={action}
                editable={false}
                style={[styles.input, { backgroundColor: "#eee" }]}
            />

            {/* Order Number */}
            <TextInput
                placeholder="Order Number"
                placeholderTextColor="#000"
                keyboardType="numeric"
                value={orderNumber}
                onChangeText={setOrderNumber}
                style={styles.input}
            />

            {/* Image Selection */}
            <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>Image</Text>
                <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                    <Text style={styles.imageButtonText}>
                        {image ? "Change Image" : "Select Image"}
                    </Text>
                </TouchableOpacity>

                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={{
                            width: '100%',
                            height: 180,
                            marginTop: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#ccc',
                        }}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={{ color: '#999', marginTop: 6 }}>No image selected</Text>
                )}
            </View>

            {/* Status Picker */}
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Status</Text>
                <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Inactive" value="Inactive" />
                </Picker>
                <Text style={styles.arrow}>▼</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.button} onPress={handleSaveDashboard_Item} disabled={loading}>
                <Text style={styles.buttonText}>
                    {Dashboard_ItemId ? "Update Dashboard Item" : "Add Dashboard Item"}
                </Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
        </ScrollView>
    </KeyboardAvoidingView>
);

};

export default AddDashboard_ItemForm;

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#fff' },
    scrollContainer: { padding: 16, paddingBottom: 40 },
    heading: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#000' },

    arrow: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -8 }],
        color: '#5d3fd3',
        fontSize: 14,
        pointerEvents: 'none',
    },

    input: {
        borderWidth: 1,
        borderColor: '#5d3fd3',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        color: '#000',
        backgroundColor: '#fff',
    },

    textArea: { height: 100, textAlignVertical: 'top' },

    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        color: '#000',
        paddingLeft: 8,
        paddingTop: 6,
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#5d3fd3',
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: '#fff',
    },

    picker: { color: '#000', backgroundColor: '#fff' },

    button: {
        backgroundColor: '#5d3fd3',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    imageButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#5d3fd3',
        borderRadius: 6,
        padding: 12,
        alignItems: 'center',
    },

    imageButtonText: { color: '#5d3fd3', fontWeight: '600' },
});

