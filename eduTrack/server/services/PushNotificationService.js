// pushNotificationService.js - Service để gửi push notifications
const { Expo } = require('expo-server-sdk');

class PushNotificationService {
  constructor() {
    this.expo = new Expo();
  }

  // Send push notification to specific tokens
  async sendPushNotifications(tokens, title, body, data = {}) {
    try {
      // Create the messages that you want to send to clients
      const messages = [];
      
      for (const pushToken of tokens) {
        // Check that all push tokens are valid
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }

        messages.push({
          to: pushToken,
          sound: 'default',
          title: title,
          body: body,
          data: data,
          priority: 'high',
          channelId: 'default',
        });
      }

      // The Expo push notification service accepts batches of notifications
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          console.log('Push notification tickets:', ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error in sendPushNotifications:', error);
      throw error;
    }
  }

  // Get delivery receipts (to track delivery status)
  async getDeliveryReceipts(tickets) {
    try {
      const receiptIds = [];
      for (const ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }

      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
      
      for (const chunk of receiptIdChunks) {
        try {
          const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
          console.log('Push notification receipts:', receipts);
          
          // Process receipts to check for errors
          for (const receiptId in receipts) {
            const receipt = receipts[receiptId];
            if (receipt.status === 'error') {
              console.error(`Error in receipt ${receiptId}:`, receipt.message);
              if (receipt.details && receipt.details.error) {
                console.error(`Error details:`, receipt.details.error);
              }
            }
          }
        } catch (error) {
          console.error('Error getting push notification receipts:', error);
        }
      }
    } catch (error) {
      console.error('Error in getDeliveryReceipts:', error);
      throw error;
    }
  }

  // Send notification to parents by email (find their push tokens)
  async sendNotificationToParents(parentEmails, title, body, data = {}) {
    try {
      // TODO: In a real app, you would:
      // 1. Find users by email
      // 2. Get their stored push tokens from database
      // 3. Send push notifications to those tokens
      
      console.log(`📤 Would send push notification to parents: ${parentEmails.join(', ')}`);
      console.log(`📋 Title: ${title}`);
      console.log(`📝 Body: ${body}`);
      console.log(`📊 Data:`, data);
      
      // For now, we'll just log and return success
      // In production, implement the actual push token lookup and sending
      return {
        success: true,
        message: `Push notifications would be sent to ${parentEmails.length} parent(s)`,
        recipientCount: parentEmails.length
      };
      
    } catch (error) {
      console.error('Error sending notifications to parents:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();