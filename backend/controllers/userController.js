import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone } = req.body;

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      user.name = normalizedName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }

      const emailInUse = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (emailInUse) {
        return res.status(409).json({ success: false, message: 'User already exists with this email' });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      const normalizedPhone = String(phone).trim();
      if (!normalizedPhone) {
        return res.status(400).json({ success: false, message: 'Phone cannot be empty' });
      }
      user.phone = normalizedPhone;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ success: false, message: 'User already exists with this email' });
    }
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
