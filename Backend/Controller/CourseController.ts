import { Request, Response } from 'express';
import CourseModel from '../Models/Course';
import { AuthRequest } from '../Middleware/AuthMiddleware';



const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ✅ Step 1: Ensure user is authenticated
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // ✅ Step 2: Extract course data from request body
    const {
      Title,
      Description,
      Category,
      Level,
      Price,
      IsPaid,
      Language,
      Image,
      Sections,
      LiveClasses,
      Materials,
      Status,
      ExpiryDate,
      StartingDate,
      DiscountPercentage,
    } = req.body;

    // ✅ Step 3: Validate required fields
    if (!Title || !Description || !Category || !Level || Price === undefined || IsPaid === undefined) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

     let uploadedImageUrl = '';
        if (Image) {
            try {
                const cloudinary = req.app.locals.cloudinary;
                const result = await cloudinary.uploader.upload(Image, {
                    folder: 'Courses'
                });
                uploadedImageUrl = result.secure_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                return res.status(500).json({ 
                    message: 'Error uploading image to Cloudinary', 
                    data: null, 
                    error 
                });
            }
        } else {
            return res.status(400).json({ 
                message: 'Image file is required', 
                data: null 
            });
        }

    // ✅ Step 4: Create course document
    const newCourse = new CourseModel({
      Title,
      Description,
      Category,
      Level,
      Price,
      IsPaid,
      Language: Language || 'English',
      Image: uploadedImageUrl || '',
      TeacherId: user._id, // ✅ Correctly assign logged-in teacher
      Sections: Sections || [],
      LiveClasses: LiveClasses || [],
      Materials: Materials || [],
      ExpiryDate: ExpiryDate || null,
      StartingDate: StartingDate || null,
      DiscountPercentage: DiscountPercentage || 0,
      AverageRating: 0,
      TotalStudents: 0,
      Status: Status || 'Draft',
       CreatedBy: user._id,
    });

    // ✅ Step 5: Save course to database
    const savedCourse = await newCourse.save();

    // ✅ Step 6: Send success response
    res.status(201).json({
      success: true,
      message: '✅ Course created successfully',
      course: savedCourse,
    });
  } catch (error: any) {
    console.error('❌ Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};



 const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await CourseModel.find()
      .populate('TeacherId', 'FirstName LastName Email')
        .populate('Category', 'CategoryName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: courses.length, courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};


 const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id).populate('TeacherId', 'FirstName LastName Email');

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.status(200).json({ success: true, course });
  } catch (error: any) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};


const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ✅ 1. Authentication check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // ✅ 2. Role-based access
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only Admin or Teacher can update course',
      });
      return;
    }

    // ✅ 3. Fetch existing course
    const existingCourse = await CourseModel.findById(id);
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // ✅ Teachers can update only their own courses
    if (
      req.roles?.includes('Teacher') &&
      existingCourse.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own courses',
      });
      return;
    }

    // ✅ 4. Extract updatable fields
    const {
      Title,
      Description,
      Category,
      Level,
      Price,
      IsPaid,
      Language,
      Image,
      Sections,
      LiveClasses,
      Materials,
      ExpiryDate,
      StartingDate,
      DiscountPercentage,
      Status,
    } = req.body;

    // ✅ 5. Handle Cloudinary image upload if a new base64 image is sent
    let uploadedImageUrl = existingCourse.Image; // default to old one

    if (Image && Image !== existingCourse.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old image if exists
        if (existingCourse.Image) {
          const public_id = existingCourse.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Courses/${public_id}`);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'Courses',
        });

        uploadedImageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error,
        });
        return;
      }
    }

    // ✅ 6. Build dynamic update object
    const updateData: any = {
      ...(Title && { Title }),
      ...(Description && { Description }),
      ...(Category && { Category }),
      ...(Level && { Level }),
      ...(Price !== undefined && { Price }),
      ...(IsPaid !== undefined && { IsPaid }),
      ...(Language && { Language }),
      Image: uploadedImageUrl,
      ...(Sections && { Sections }),
      ...(LiveClasses && { LiveClasses }),
      ...(Materials && { Materials }),
      ...(ExpiryDate && { ExpiryDate }),
      ...(StartingDate && { StartingDate }),
      ...(DiscountPercentage !== undefined && { DiscountPercentage }),
      ...(Status && { Status }),
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    // ✅ 7. Update and return latest version
    const updatedCourse = await CourseModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCourse) {
      res.status(404).json({ success: false, message: 'Course not found after update' });
      return;
    }

    // ✅ 8. Success Response
    res.status(200).json({
      success: true,
      message: '✅ Course updated successfully',
      course: updatedCourse,
    });
  } catch (error: any) {
    console.error('❌ Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message,
    });
  }
};




 const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ✅ Authentication check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ✅ Role check
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Access denied: Only Admin or Teacher can delete course' });
      return;
    }

    // ✅ Find the course first
    const existingCourse = await CourseModel.findById(id);
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // ✅ Only the teacher who owns it or Admin can delete
    if (
      req.roles?.includes('Teacher') &&
      existingCourse.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Access denied: You can only delete your own courses' });
      return;
    }

    // ✅ Delete from Cloudinary if Image exists
   if (existingCourse.Image) {
     const cloudinary = req.app.locals.cloudinary;
          const public_id = existingCourse.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Courses/${public_id}`);
        }

    // ✅ Delete the course from MongoDB
    await CourseModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ Course and associated image deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message,
    });
  }
};

const AddSubjectToCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // -------------------------------------------------------
    // 1️⃣ AUTH VALIDATION
    // -------------------------------------------------------
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Please login first",
      });
      return;
    }

    // -------------------------------------------------------
    // 2️⃣ ROLE VALIDATION
    // -------------------------------------------------------
    const allowedRoles = ["Admin", "Teacher"];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "Access denied: Only Admin or Teacher can update course",
      });
      return;
    }

    // -------------------------------------------------------
    // 3️⃣ FETCH COURSE
    // -------------------------------------------------------
    const existingCourse = await CourseModel.findById(id);
    if (!existingCourse) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Teacher can update only own course
    if (
      req.roles?.includes("Teacher") &&
      existingCourse.TeacherId?.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied: You can update only your own courses",
      });
      return;
    }

    // -------------------------------------------------------
    // 4️⃣ EXTRACT FIELDS
    // -------------------------------------------------------
    const {
      SelectedSubjects = [],
      SelectedChapters = [],
      SelectedTopics = [],
    } = req.body;

    // -------------------------------------------------------
    // 5️⃣ VALIDATIONS
    // -------------------------------------------------------
    if (!Array.isArray(SelectedSubjects)) {
      res.status(400).json({
        success: false,
        message: "SelectedSubjects must be an array",
      });
      return;
    }
    if (!Array.isArray(SelectedChapters)) {
      res.status(400).json({
        success: false,
        message: "SelectedChapters must be an array",
      });
      return;
    }
    if (!Array.isArray(SelectedTopics)) {
      res.status(400).json({
        success: false,
        message: "SelectedTopics must be an array",
      });
      return;
    }

    // -------------------------------------------------------
    // 6️⃣ UPDATE PAYLOAD
    // -------------------------------------------------------
    const updateData: any = {
      SelectedSubjects,
      SelectedChapters,
      SelectedTopics,
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    // -------------------------------------------------------
    // 7️⃣ UPDATE COURSE
    // -------------------------------------------------------
    const updatedCourse = await CourseModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCourse) {
      res.status(404).json({
        success: false,
        message: "Course not found after update",
      });
      return;
    }

    // -------------------------------------------------------
    // 8️⃣ SUCCESS RESPONSE
    // -------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });

  } catch (error: any) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};


 const getAll_Paid_CoursesByCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const courses = await CourseModel.find({Category:categoryId, IsPaid:true}).populate('TeacherId', 'FirstName LastName Email');

    if (!courses) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.status(200).json({ success: true, courses });
  } catch (error: any) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};


 const getAll_Free_Courses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await CourseModel.find({ IsPaid:false}).populate('TeacherId', 'FirstName LastName Email');

    if (!courses) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.status(200).json({ success: true, courses });
  } catch (error: any) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};


 const getAllActiveCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await CourseModel.find({Status:"Published"})
      .populate('TeacherId', 'FirstName LastName Email')
        .populate('Category', 'CategoryName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: courses.length, courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};


const getCourseSubjects = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const course = await CourseModel.findById(courseId)
      .populate('SelectedSubjects');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      subjects: course.SelectedSubjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default { createCourse,getAllCourses,getCourseById,updateCourse,
  deleteCourse,AddSubjectToCourse,getAll_Paid_CoursesByCategoryId,getAll_Free_Courses,
  getAllActiveCourses,getCourseSubjects};