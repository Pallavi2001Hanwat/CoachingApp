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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    createCourse,
    getCourseById,
    updateCourse,
} from '@/src/api/adminApi/CoursesApi';
import { getAllCategories } from '@/src/api/adminApi/CategoryApi';

const AddCourseForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { CourseId } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [price, setPrice] = useState('');
    const [isPaid, setIsPaid] = useState(true);
    const [discount, setDiscount] = useState('');
    const [language, setLanguage] = useState('');
    const [image, setimage] = useState('');
    const [startingDate, setStartingDate] = useState<Date | undefined>();
    const [expiryDate, setExpiryDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showExpiryPicker, setShowExpiryPicker] = useState(false);


    // ✅ Load categories for dropdown
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getAllCategories();
            if (res && res.success) setCategories(res.categories);
        } catch (error) {
            console.log('Error loading categories:', error);
        }
    };

    // ✅ Load course details if editing
    useEffect(() => {
        if (CourseId) {
            loadCourseDetails(CourseId);
        }
    }, [CourseId]);

    const loadCourseDetails = async (id: string) => {
        try {
            setLoading(true);
            const res = await getCourseById(id);
            if (res && res.success) {
                const course = res.course;
                setTitle(course.Title || '');
                setDescription(course.Description || '');
                setCategory(course.Category || '');
                setLevel(course.Level || 'Beginner');
                setPrice(course.Price?.toString() || '');
                setIsPaid(course.IsPaid || false);
                setDiscount(course.DiscountPercentage?.toString() || '');
                setLanguage(course.Language || '');
                setimage(course.Image || '');
                setStartingDate(course.StartingDate ? new Date(course.StartingDate) : undefined);
                setExpiryDate(course.ExpiryDate ? new Date(course.ExpiryDate) : undefined);
                setStatus(course.Status || 'Draft');

            } else {
                Alert.alert('Failed to load course details');
            }
        } catch (err) {
            console.log('Error loading course details:', err);
            Alert.alert('Error loading course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'You need to allow access to your gallery!');
                return;
            }

            // ✅ Use universal compatible media type option
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ works in all stable SDKs
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true, // no need for extra FileSystem calls
            });

            if (!result.canceled) {
                const selectedAsset = result.assets[0];
                const imageUri = selectedAsset.uri;

                // ✅ Use built-in base64 if available
                const base64Image = selectedAsset.base64
                    ? `data:image/jpeg;base64,${selectedAsset.base64}`
                    : imageUri;

                setimage(base64Image);
                console.log('✅ Image selected and ready to upload');
            }
        } catch (error) {
            console.error('❌ Error selecting image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };



    // ✅ Save handler
    const handleSaveCourse = async () => {
        if (!title || !description || !category) {
            Alert.alert('Please fill all required fields');
            return;
        }

        try {
            const courseData = {
                Title: title,
                Description: description,
                Category: category,
                Level: level,
                Price: Number(price) || 0,
                IsPaid: isPaid,
                DiscountPercentage: Number(discount) || 0,
                Language: language,
                Image: image,
                StartingDate: startingDate,
                ExpiryDate: expiryDate,
                Status: status,
            };

            if (CourseId) {
                const res = await updateCourse(CourseId, courseData);
                if (res && res.success) {
                    Alert.alert('✅ Course updated successfully');
                }
            } else {
                const res = await createCourse(courseData);
                if (res && res.success) {
                    Alert.alert('✅ Course added successfully');
                }
            }

            navigation.goBack();
        } catch (error) {
            console.log('Save course error:', error);
            Alert.alert('❌ Failed to save course');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.heading}>{'Add New Course'}</Text>

                <TextInput
                    placeholder="Course Title"
                    placeholderTextColor="#000" // Placeholder color black
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Description"
                    placeholderTextColor="#000" // Placeholder color black
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={[styles.input, styles.textArea]}
                />

                {/* ✅ Category Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Category</Text>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Category" value="" />
                        {categories.map((cat) => (
                            <Picker.Item key={cat._id} label={cat.CategoryName} value={cat._id} />
                        ))}
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                {/* ✅ Level Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Level</Text>
                    <Picker
                        selectedValue={level}
                        onValueChange={(val) => setLevel(val)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Beginner" value="Beginner" />
                        <Picker.Item label="Intermediate" value="Intermediate" />
                        <Picker.Item label="Advanced" value="Advanced" />
                    </Picker>
                    <Text style={styles.arrow}>▼</Text>
                </View>

                {/* ✅ Is Paid Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Is Paid or Free</Text>
                    <Picker
                        selectedValue={isPaid}
                        onValueChange={(v) => {
                            setIsPaid(v);
                            if (!v) {
                                setPrice('');
                                setDiscount('');
                            }
                        }}
                        style={styles.picker}
                    >
                        <Picker.Item label="Paid" value={true} />
                        <Picker.Item label="Free" value={false} />
                    </Picker>
                </View>

                {/* ✅ Show Price & Discount only if Paid */}
                {isPaid && (
                    <>
                        <TextInput
                            placeholder="Price"
                            placeholderTextColor="#000"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Discount Percentage (%)"
                            placeholderTextColor="#000"
                            value={discount}
                            onChangeText={setDiscount}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                    </>
                )}

                {/* ✅ Language */}
                <TextInput
                    placeholder="Language"
                    placeholderTextColor="#000"
                    value={language}
                    onChangeText={setLanguage}
                    style={styles.input}
                />

                {/* ✅  Image Selection and Preview */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}> Image</Text>

                    <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                        <Text style={styles.imageButtonText}>
                            {image ? 'Change Image' : 'Select Image'}
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

                {/* ✅ Starting Date Picker */}
                <View style={styles.dateContainer}>
                    <Text style={styles.label}>Starting Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {startingDate ? startingDate.toDateString() : 'Select Start Date'}
                        </Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startingDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowStartPicker(false);
                                if (date) setStartingDate(date);
                            }}
                        />
                    )}
                </View>

                {/* ✅ Expiry Date Picker */}
                <View style={styles.dateContainer}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowExpiryPicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {expiryDate ? expiryDate.toDateString() : 'Select Expiry Date'}
                        </Text>
                    </TouchableOpacity>
                    {showExpiryPicker && (
                        <DateTimePicker
                            value={expiryDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowExpiryPicker(false);
                                if (date) setExpiryDate(date);
                            }}
                        />
                    )}
                </View>

                {/* ✅ Status Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Status</Text>

                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={status}
                            onValueChange={(val) => setStatus(val)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Draft" value="Draft" />
                            <Picker.Item label="Published" value="Published" />
                            <Picker.Item label="Archived" value="Archived" />
                        </Picker>

                        <Text style={styles.arrow}>▼</Text>
                        {/* or use react-native-vector-icons */}
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveCourse}>
                    {CourseId ? (
                        <Text style={styles.buttonText}>Update Course</Text>
                    ) : (
                        <Text style={styles.buttonText}>Add Course</Text>
                    )}
                </TouchableOpacity>


                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );

};

export default AddCourseForm;

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#fff' },
    scrollContainer: { padding: 16 },

    heading: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: '#000',
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

    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#5d3fd3',
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: '#fff',
    },

    pickerWrapper: {
        position: 'relative',
    },

    picker: {
        color: '#000',
        backgroundColor: '#fff',
    },

    arrow: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -8 }],
        color: '#5d3fd3',
        fontSize: 14,
        pointerEvents: 'none',
    },


    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        color: '#000',
        paddingLeft: 8,
        paddingTop: 6,
    },

    dateContainer: { marginBottom: 12 },

    dateButton: {
        borderWidth: 1,
        borderColor: '#5d3fd3',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#fff',
    },

    dateText: {
        color: '#000',
        fontSize: 15,
    },

    button: {
        backgroundColor: '#5d3fd3',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
