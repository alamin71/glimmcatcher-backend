import { Notification } from '../modules/notification/notification.model';
import { sendUserNotification } from '../../socketIo'; // ✅ Import helper
import { io } from '../../server'; // ✅ Import socket instance
import mongoose from 'mongoose';

interface SaveNotificationProps {
  userId: string;
  userType: 'User' | 'Admin';
  title: string;
  message: string;
  type?: 'welcome' | 'profile' | 'payment' | 'admin' | 'custom';
}

export const saveNotification = async ({
  userId,
  userType,
  title,
  message,
  type = 'custom',
}: SaveNotificationProps) => {
  try {
    // 🟩 Save to database
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      userType,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date(),
    });

    console.log('✅ Notification saved to DB:', notification);

    // 🟨 Send real-time notification to that user via socket.io
    sendUserNotification(io, userId, {
      _id: notification._id,
      userId,
      title,
      message,
      type,
      isRead: false,
    });

    console.log(`📤 Real-time notification sent to user ${userId}`);

    return notification;
  } catch (error) {
    console.error('❌ Error in saveNotification:', error);
    throw error;
  }
};
