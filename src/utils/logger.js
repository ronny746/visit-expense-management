const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (userId, activityType, entityType, entityId, description, metadata = {}) => {
  try {
    await ActivityLog.create({
      userId,
      activityType,
      entityType,
      entityId,
      description,
      metadata
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};