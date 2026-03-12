import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../Models/User';
import RoleModel from '../Models/Role';
import UserRoleModel from '../Models/UserRoles';
import OtpModel from '../Models/UserOtp';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';

import { AuthRequest } from '../Middleware/studentMiddleware';

const SALT_ROUNDS = 10;
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});





async function LoginFromWeb(req: Request, res: Response): Promise<void> {
  try {
    const { Email, Phone, Password } = req.body;

    if (!Email && !Phone) {
      return res.status(400).json({ message: "Please provide Email or Phone" });
    }

    /* 1️⃣ Find User */
    let user;

    if (Email) {
      user = await UserModel.findOne({
        Email: { $regex: `^${Email}$`, $options: "i" },
      });
    }

    if (Phone) {
      user = await UserModel.findOne({ Phone });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* 2️⃣ Get Roles */

    let roleNames: string[] = [];

    const userRoles = await UserRoleModel.find({ UserId: user._id });
    const roleIds = userRoles.map((r) => r.RoleId);
    const roles = await RoleModel.find({ _id: { $in: roleIds } });

    roleNames = roles.map((r) => r.RoleName);

    const isAdminOrTeacher =
      roleNames.includes("Admin") || roleNames.includes("Teacher");

    /* 3️⃣ Password Check (Admin / Teacher only) */

    if (isAdminOrTeacher) {
      if (!Password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }

      const isMatch = await bcrypt.compare(Password, user.Password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }
    }

    /* 4️⃣ Generate OTP (ALL USERS) */

    const Otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OtpModel.create({
      UserId: user._id,
      Email: Email || null,
      Phone: Phone || null,
      Otp,
      ExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    /* 5️⃣ Send OTP */

    if (Email) {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: Email,
        subject: "Your Login OTP",
        html: `
        <div style="font-family:Arial,sans-serif;">
          <h2>Login Verification</h2>
          <p>Your OTP is:</p>
          <h3 style="color:#2f6bed;">${Otp}</h3>
          <p>It will expire in 10 minutes.</p>
        </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    if (Phone) {
      await sendSms(
        Phone,
        `Your login OTP is ${Otp}. It will expire in 10 minutes.`
      );
    }

    /* 6️⃣ Response */

    return res.status(200).json({
      message: `OTP sent successfully to ${Email ? "Email" : "Phone"}`,
      user: {
        id: user._id,
        name: `${user.FirstName} ${user.LastName}`,
        email: user.Email,
        phone: user.Phone,
        roles: roleNames,
      },
      roles: roleNames,
      email: Email || null,
      phone: Phone || null,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function LoginFromApp(req: Request, res: Response): Promise<void> {
  try {
    const { Email, Phone } = req.body;

    if (!Email && !Phone) {
      return res.status(400).json({ message: "Please provide Email or Phone" });
    }

    /* 1️⃣ Find User */
    let user;

    if (Email) {
      user = await UserModel.findOne({
        Email: { $regex: `^${Email}$`, $options: "i" },
      });
    }

    if (Phone) {
      user = await UserModel.findOne({ Phone });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* 2️⃣ Get Roles */

    let roleNames: string[] = [];

    const userRoles = await UserRoleModel.find({ UserId: user._id });
    const roleIds = userRoles.map((r) => r.RoleId);
    const roles = await RoleModel.find({ _id: { $in: roleIds } });

    roleNames = roles.map((r) => r.RoleName);

    const isAdminOrTeacher =
      roleNames.includes("Admin") || roleNames.includes("Teacher");

    

    /* 4️⃣ Generate OTP (ALL USERS) */

    const Otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OtpModel.create({
      UserId: user._id,
      Email: Email || null,
      Phone: Phone || null,
      Otp,
      ExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    /* 5️⃣ Send OTP */

    if (Email) {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: Email,
        subject: "Your Login OTP",
        html: `
        <div style="font-family:Arial,sans-serif;">
          <h2>Login Verification</h2>
          <p>Your OTP is:</p>
          <h3 style="color:#2f6bed;">${Otp}</h3>
          <p>It will expire in 10 minutes.</p>
        </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    if (Phone) {
      await sendSms(
        Phone,
        `Your login OTP is ${Otp}. It will expire in 10 minutes.`
      );
    }

    /* 6️⃣ Response */

    return res.status(200).json({
      message: `OTP sent successfully to ${Email ? "Email" : "Phone"}`,
      user: {
        id: user._id,
        name: `${user.FirstName} ${user.LastName}`,
        email: user.Email,
        phone: user.Phone,
        roles: roleNames,
      },
      roles: roleNames,
      email: Email || null,
      phone: Phone || null,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}


 const VerifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {

    const { Email, Phone, Otp } = req.body;

    // 1️⃣ Validate request
    if ((!Email && !Phone) || !Otp) {
      res.status(400).json({
        message: "Email/Phone and OTP are required"
      });
      return;
    }

    // 2️⃣ Find OTP record
    const otpRecord = await OtpModel.findOne({
      $or: [{ Email }, { Phone }],
      Otp
    });

    if (!otpRecord) {
      res.status(400).json({
        message: "Invalid OTP"
      });
      return;
    }

    // 3️⃣ Check OTP expiry
    if (new Date() > otpRecord.ExpiresAt) {
      res.status(400).json({
        message: "OTP has expired"
      });
      return;
    }

    // 4️⃣ Find user
    let user: any;

    if (Email) {
      user = await UserModel.findOne({
        Email: { $regex: `^${Email}$`, $options: "i" }
      });
    }

    if (Phone) {
      user = await UserModel.findOne({ Phone });
    }

    if (!user) {
      res.status(404).json({
        message: "User not found. Please sign up first."
      });
      return;
    }

    // 5️⃣ Get user roles
    const userRoles = await UserRoleModel.find({
      UserId: user._id
    });

    const roleIds = userRoles.map(r => r.RoleId);

    const roles = await RoleModel.find({
      _id: { $in: roleIds }
    });

    const roleNames = roles.map(r => r.RoleName);

    // 6️⃣ Create JWT token
    const payload = {
      userId: user._id,
      roles: roleNames,
      email: user.Email,
      phone: user.Phone
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });




res.cookie('token', token, {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

res.cookie('role', JSON.stringify(roleNames), {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

    // 9️⃣ Delete verified OTP
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // 🔟 Send response
    res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        email: user.Email,
        phone: user.Phone,
        roles: roleNames.length ? roleNames : null,
        name: `${user?.FirstName || ""} ${user?.LastName || ""}`
      },
      token
    });

  } catch (error) {

    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Internal Server Error"
    });

  }
};

async function SignUpUser(req: Request, res: Response): Promise<void> {
  try {
    const { FirstName, LastName, Email, Phone, Otp } = req.body;

    // 1️⃣ Validate required fields
    if (!FirstName || !Email || !Phone || !Otp) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // 2️⃣ Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ Email }, { Phone }],
    });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists, please login' });
      return;
    }

    // 3️⃣ Verify OTP
    const otpRecord = await OtpModel.findOne({
      $or: [{ Email }, { Phone }],
      Otp: Otp,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const isExpired = otpRecord.ExpiresAt.getTime() < Date.now();
    if (isExpired) {
      res.status(400).json({ message: 'OTP expired, please request a new one' });
      return;
    }


    // 5️⃣ Create new user
    const newUser = new UserModel({
      FirstName,
      LastName,
      Email,
      Phone,
      IsActive: true,
    });

    const savedUser = await newUser.save();

    // 6️⃣ Assign default "Student" role
    const role = await RoleModel.findOne({ RoleName: 'Student' });
    if (role) {
      await UserRoleModel.create({
        UserId: savedUser._id,
        RoleId: role._id,
      });
    }

    // 7️⃣ Delete OTP after successful registration
    await OtpModel.deleteMany({
      $or: [{ Email }, { Phone }],
    });

    // 8️⃣ Generate JWT token
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.Email,
        roles: ['Student'],
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 9️⃣ Send success response
    res.status(201).json({
      message: 'Signup successful, logged in successfully',
      token,
      user: {
        id: savedUser._id,
        name: `${savedUser.FirstName} ${savedUser.LastName}`,
        email: savedUser.Email,
        phone: savedUser.Phone,
        roles: ['Student'],
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ message: `${field} already exists` });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function VerifyPassword(req: Request, res: Response): Promise<void> {
  try {
    const { Email, Phone, Password } = req.body;

    // 1️⃣ Validate fields
    if ((!Email && !Phone) || !Password) {
      res.status(400).json({ message: 'Please provide email/phone and password' });
      return;
    }

    // 2️⃣ Find user by Email or Phone
    const user = await UserModel.findOne({
      $or: [{ Email }, { Phone }],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    // 4️⃣ Fetch roles for user
    const userRoles = await UserRoleModel.find({ UserId: user._id });
    const roleIds = userRoles.map(r => r.RoleId);
    const roles = await RoleModel.find({ _id: { $in: roleIds } });
    const roleNames = roles.map(r => r.RoleName);

    // 4️⃣ Generate OTP
    const Otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // 5️⃣ Save OTP record
    await OtpModel.create({
      UserId: user ? user._id : null,
      Email: Email || null,
      Phone: Phone || null,
      Otp,
      ExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // 6️⃣ Send OTP
    if (Email) {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: Email,
        subject: 'Your Login OTP',
        html: `
          <div style="font-family:Arial,sans-serif;">
            <h2>Login Verification</h2>
            <p>Hello,</p>
            <p>Your OTP is:</p>
            <h3 style="color:#2f6bed;">${Otp}</h3>
            <p>It will expire in 10 minutes.</p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    } else if (Phone) {
      await sendSms(Phone, `Your login OTP is ${Otp}. It will expire in 10 minutes.`);
    }

    // 8️⃣ Send response (no token here)
    res.status(200).json({
      message: `Password verified successfully. OTP sent to ${Email ? 'email' : 'phone'}`,
      user: {
        id: user._id,
        name: `${user.FirstName} ${user.LastName}`,
        email: user.Email,
        phone: user.Phone,
        roles: roleNames,
      },
    });
  } catch (error: any) {
    console.error('Error in VerifyPassword:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


/* --------------------------- ✅ AddUser --------------------------- */
async function AddUser(req: Request, res: Response): Promise<void> {
  try {
    const {
      FirstName,
      LastName,
      Email,
      Phone,
      AlternatePhone,
      Gender,
      Password,
      DateOfBirth,
      IsAdmin,
      IsTeacher,
      IsActive
    } = req.body;

    //  Hash the password
    const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);

    //  Create the user object
    const newUser = new UserModel({
      FirstName,
      LastName,
      Email,
      Phone,
      AlternatePhone,
      Gender,
      Password: hashedPassword,
      DateOfBirth,
      IsActive,
    });

    // Save user to DB
    const savedUser = await newUser.save();

    // Determine role based on flags
    const rolesToAssign: string[] = [];

    if (IsAdmin) rolesToAssign.push('Admin');
    if (IsTeacher) rolesToAssign.push('Teacher');
    if (!IsAdmin && !IsTeacher) rolesToAssign.push('Student');

    //  Find role ID from Role collection
    for (const roleName of rolesToAssign) {
      const role = await RoleModel.findOne({ RoleName: roleName });

      if (!role) {
        console.warn(` Role not found: ${roleName}`);
        continue; // Skip this role if not found
      }

      await UserRoleModel.create({
        UserId: savedUser._id,
        RoleId: role._id,
      });
    }


    //  Final response
    res.status(201).json({
      message: 'User created successfully',
      user: savedUser,
    });

  } catch (error: any) {
    console.error('Error adding user:', error);

    // ⚠️ Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        message: `${field} already exists`,
      });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/* --------------------------- ✅ Get All Users --------------------------- */
async function GetAllUsers(req: Request, res: Response): Promise<void> {
  try {
    // Step 1️⃣ - Get all users (excluding password)
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .select('-Password');

    // Step 2️⃣ - Get all userIds
    const userIds = users.map((u) => u._id);

    // Step 3️⃣ - Find all roles mapped to users
    const userRoles = await UserRoleModel.find({ UserId: { $in: userIds } });

    // Step 4️⃣ - Extract all roleIds
    const roleIds = userRoles.map((ur) => ur.RoleId);

    // Step 5️⃣ - Fetch all roles in one go
    const roles = await RoleModel.find({ _id: { $in: roleIds } });

    // Step 6️⃣ - Create a lookup map for roles
    const roleMap = roles.reduce((acc: any, role) => {
      acc[role._id.toString()] = role.RoleName;
      return acc;
    }, {});

    // Step 7️⃣ - Merge users + their roles
    const usersWithRoles = users.map((user) => {
      const rolesForUser = userRoles
        .filter((ur) => ur.UserId.toString() === user._id.toString())
        .map((ur) => roleMap[ur.RoleId.toString()] || 'Unknown');

      return {
        ...user.toObject(),
        Roles: rolesForUser,
      };
    });

    // ✅ Final response
    res.status(200).json({ success: true, message: 'Get User successfully', Users: usersWithRoles });

  } catch (error) {
    console.error('Error fetching users with roles:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function GetUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Step 1️⃣ - Find user
    const user = await UserModel.findById(id).select('-Password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Step 2️⃣ - Find roles assigned to this user
    const userRoles = await UserRoleModel.find({ UserId: user._id });
    const roleIds = userRoles.map((r) => r.RoleId);

    // Step 3️⃣ - Find role names
    const roles = await RoleModel.find({ _id: { $in: roleIds } });
    const roleNames = roles.map((r) => r.RoleName);

    // Step 4️⃣ - Determine flags
    const isAdmin = roleNames.includes('Admin');
    const isTeacher = roleNames.includes('Teacher');

    // Step 5️⃣ - Prepare response
    const userData = {
      ...user.toObject(),
      Roles: roleNames,
      IsAdmin: isAdmin,
      IsTeacher: isTeacher,
    };

    res.status(200).json({ success: true, User: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/* --------------------------- ✅ Update User --------------------------- */
async function UpdateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      FirstName,
      LastName,
      Email,
      Phone,
      AlternatePhone,
      Gender,
      Password,
      DateOfBirth,
      IsAdmin,
      IsTeacher,
      IsActive,
    } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If password is updated, hash it again
    if (Password) {
      user.Password = await bcrypt.hash(Password, SALT_ROUNDS);
    }

    user.FirstName = FirstName ?? user.FirstName;
    user.LastName = LastName ?? user.LastName;
    user.Email = Email ?? user.Email;
    user.Phone = Phone ?? user.Phone;
    user.AlternatePhone = AlternatePhone ?? user.AlternatePhone;
    user.Gender = Gender ?? user.Gender;
    user.DateOfBirth = DateOfBirth ?? user.DateOfBirth;
    user.IsActive = IsActive ?? user.IsActive;

    const updatedUser = await user.save();

    // Update roles if required
    await UserRoleModel.deleteMany({ UserId: user._id });

    const rolesToAssign: string[] = [];
    if (IsAdmin) rolesToAssign.push('Admin');
    if (IsTeacher) rolesToAssign.push('Teacher');
    if (!IsAdmin && !IsTeacher) rolesToAssign.push('Student');

    for (const roleName of rolesToAssign) {
      const role = await RoleModel.findOne({ RoleName: roleName });
      if (role) {
        await UserRoleModel.create({ UserId: user._id, RoleId: role._id });
      }
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/* --------------------------- ✅ Delete User --------------------------- */
async function DeleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Remove user roles too
    await UserRoleModel.deleteMany({ UserId: id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


const GetUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // ✅ Correct way
    const userId = req.user._id; // no destructuring

    const user = await UserModel.findById(userId).select('-Password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      User: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export default { AddUser, GetAllUsers, GetUserById, UpdateUser, DeleteUser, LoginFromWeb, LoginFromApp, VerifyOtp, SignUpUser, VerifyPassword, GetUserProfile };
