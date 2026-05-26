const User = require('../models/User');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const Notification = require('../models/Notification');


// ───────────────── Helper: Send Cookie Response ─────────────────

const sendToken = (user, statusCode, res, doctorProfile=null) => {

  const token = generateToken(user._id, user.role);

  res.cookie('mc_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(statusCode).json({
    success:true,

    user:{
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      avatar:user.avatar,
      isVerified:user.isVerified
    },

    doctorProfile
  });
};


// ───────────────── Register ─────────────────

exports.register = async (req,res,next) => {

  try {

    const {
      name,
      email,
      password,
      role,
      phone,
      gender,
      dateOfBirth,
      specialization,
      licenseNumber,
      experience,
      consultationFee
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success:false,
        message:'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      gender,
      dateOfBirth
    });

    if (user.role === 'doctor') {

      const lic =
        licenseNumber || `LIC-${Date.now()}`;

      if (!(await Doctor.findOne({
        licenseNumber: lic
      }))) {

        await Doctor.create({
          user:user._id,
          specialization:
            specialization || 'General Physician',
          licenseNumber:lic,
          experience:Number(experience)||0,
          consultationFee:Number(consultationFee)||500,
          isApproved:false
        });
      }
    }

    await Notification.create({
      user:user._id,
      type:'system',
      title:'Welcome to MediConnect!',
      message:`Hello ${name}, your account has been created successfully.`
    });

    sendToken(user,201,res);

  } catch(err) {

    next(err);

  }
};


// ───────────────── Login ─────────────────

exports.login = async (req,res,next) => {

  try {

    const { email,password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success:false,
        message:'Please provide email and password'
      });
    }

    const user =
      await User
        .findOne({ email })
        .select('+password');

    if (
      !user ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        success:false,
        message:'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success:false,
        message:'Account deactivated'
      });
    }

    user.lastLogin = Date.now();

    await user.save({
      validateBeforeSave:false
    });

    let doctorProfile = null;

    if (user.role === 'doctor') {
      doctorProfile =
        await Doctor.findOne({
          user:user._id
        });
    }

    sendToken(
      user,
      200,
      res,
      doctorProfile
    );

  } catch(err) {

    next(err);

  }
};


// ───────────────── Get Current User ─────────────────

exports.getMe = async (req,res,next) => {

  try {

    const user =
      await User.findById(req.user.id);

    let doctorProfile = null;

    if (user.role === 'doctor') {

      doctorProfile =
        await Doctor
          .findOne({ user:user._id })
          .populate(
            'user',
            'name email avatar'
          );
    }

    res.json({
      success:true,
      data:{
        user,
        doctorProfile
      }
    });

  } catch(err) {

    next(err);

  }
};


// ───────────────── Update Profile ─────────────────

exports.updateProfile = async (req,res,next) => {

  try {

    const allowed = [
      'name',
      'phone',
      'gender',
      'dateOfBirth',
      'address',
      'bloodGroup',
      'avatar'
    ];

    const update = {};

    allowed.forEach(f => {

      if (req.body[f] !== undefined) {
        update[f] = req.body[f];
      }

    });

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        update,
        {
          new:true,
          runValidators:true
        }
      );

    res.json({
      success:true,
      data:user
    });

  } catch(err) {

    next(err);

  }
};


// ───────────────── Update Password ─────────────────

exports.updatePassword = async (req,res,next) => {

  try {

    const {
      currentPassword,
      newPassword
    } = req.body;

    const user =
      await User
        .findById(req.user.id)
        .select('+password');

    if (
      !(await user.matchPassword(currentPassword))
    ) {

      return res.status(401).json({
        success:false,
        message:'Current password incorrect'
      });

    }

    user.password = newPassword;

    await user.save();

    sendToken(user,200,res);

  } catch(err) {

    next(err);

  }
};


// ───────────────── Logout ─────────────────

exports.logout = (req,res) => {

  res.clearCookie('mc_token', {
    httpOnly:true,
    secure:
      process.env.NODE_ENV === 'production',

    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax'
  });

  res.json({
    success:true,
    message:'Logged out successfully'
  });
};