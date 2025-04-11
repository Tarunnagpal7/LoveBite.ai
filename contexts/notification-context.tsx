"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  unreadCount: number;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type ?: string,
  relationshipId ?: string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications on mount and when session changes
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const addNotification = useCallback(async (message: string) => {
    try {
      const response = await axios.post('/api/notifications', { message });
      if (response.data.success) {
        setNotifications(prev => [response.data.notification, ...prev]);
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await axios.patch(`/api/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification && notification._id && notification._id.toString() === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.filter(notification => 
            !(notification && notification._id && notification._id.toString() === notificationId)
          )
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}