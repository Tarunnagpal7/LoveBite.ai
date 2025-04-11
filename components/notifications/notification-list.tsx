"use client";

import { format } from "date-fns";
import { Check, X, Loader2, UserPlus2, UserMinus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/notification-context";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export function NotificationList() {
  const { notifications, markAsRead, deleteNotification, addNotification } = useNotifications();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: { delete: boolean; read: boolean; accept: boolean; decline: boolean };
  }>({});


  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No notifications
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    
    setLoadingStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), read: true }
    }));
    
    await markAsRead(id.toString());
    
    setTimeout(() => {
      setLoadingStates(prev => ({
        ...prev,
        [id]: { ...(prev[id] || {}), read: false }
      }));
    }, 2000);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setLoadingStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), delete: true }
    }));
    
    await deleteNotification(id.toString());
    
    setTimeout(() => {
      setLoadingStates(prev => ({
        ...prev,
        [id]: { ...(prev[id] || {}), delete: false }
      }));
    }, 2000);
  };

  const handleAcceptRequest = async (relationshipId: string, notificationId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        [notificationId]: { ...(prev[notificationId] || {}), accept: true }
      }));

      const response = await axios.patch(`/api/relationships/${relationshipId}`,{
        status : "accepted"
      });
      
      if (response.data.success) {
        addNotification("Reltionship request is accepted")
        await handleDelete(notificationId);
      }else{
        addNotification(response.data.message)
      }
    } catch (error) {
      console.error("Error accepting relationship request:", error);
       if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
              addNotification(error.response.data.message);
            } else {
              addNotification("Failed to send relationship request");
        }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [notificationId]: { ...(prev[notificationId] || {}), accept: false }
      }));
    }
  };

  const handleDeclineRequest = async (relationshipId: string, notificationId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        [notificationId]: { ...(prev[notificationId] || {}), decline: true }
      }));

      const response = await axios.delete(`/api/relationships/${relationshipId}`);
      
      if (response.data.success) {
        addNotification('Relationship request decline')
        await handleDelete(notificationId);
      }
    } catch (error) {
      console.error("Error declining relationship request:", error);
       if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
              addNotification(error.response.data.message);
          } else {
              addNotification("Failed to send relationship request");
            }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [notificationId]: { ...(prev[notificationId] || {}), decline: false }
      }));
    }
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="p-4 space-y-4">
        {notifications.map((notification) => {
          const id = notification._id?.toString() || "";
          const isReadLoading = loadingStates[id]?.read;
          const isDeleteLoading = loadingStates[id]?.delete;
          const isAcceptLoading = loadingStates[id]?.accept;
          const isDeclineLoading = loadingStates[id]?.decline;
          const isRelationshipRequest = notification.type === "relationship_request";
          
          return (
            <div
              key={id}
              className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                notification.read ? "bg-secondary/40" : "bg-secondary"
              }`}
            >
              <div className="flex-1">
                <p className={notification.read ? "text-muted-foreground" : ""}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(notification.createdAt)}
                </p>
                
                {isRelationshipRequest && notification.relationshipId && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={isAcceptLoading}
                      onClick={() => handleAcceptRequest(notification.relationshipId!, id)}
                    >
                      {isAcceptLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus2 className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      disabled={isDeclineLoading}
                      onClick={() => handleDeclineRequest(notification.relationshipId!, id)}
                    >
                      {isDeclineLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserMinus2 className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                {!notification.read && !isRelationshipRequest && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isReadLoading}
                    onClick={() => handleMarkAsRead(id)}
                  >
                    {isReadLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {!isRelationshipRequest && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    disabled={isDeleteLoading}
                    onClick={() => handleDelete(id)}
                  >
                    {isDeleteLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}