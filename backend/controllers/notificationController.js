const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { unread, page=1, limit=30 } = req.query;
    const query = { user: req.user.id };
    if (unread==='true') query.isRead = false;
    const total       = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user:req.user.id, isRead:false });
    const data        = await Notification.find(query).sort({ createdAt:-1 }).skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit));
    res.json({ success:true, count:data.length, total, unreadCount, data });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id:req.params.id, user:req.user.id }, { isRead:true });
    res.json({ success:true, message:'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user:req.user.id, isRead:false }, { isRead:true });
    res.json({ success:true, message:'All notifications marked as read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id:req.params.id, user:req.user.id });
    res.json({ success:true, message:'Notification deleted' });
  } catch (err) { next(err); }
};
