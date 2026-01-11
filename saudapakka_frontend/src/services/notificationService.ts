import axios from "@/lib/axios";

export interface NotificationItem {
    id: number;
    recipient: number;
    title: string;
    message: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
}

const BASE_URL = "/api/notifications/";

export const notificationService = {
    // Fetch all notifications for the current user
    getNotifications: async (): Promise<NotificationItem[]> => {
        const { data } = await axios.get(BASE_URL);
        return data;
    },

    // Mark a specific notification as read
    markAsRead: async (id: number): Promise<void> => {
        await axios.post(`${BASE_URL}${id}/mark_as_read/`);
    },

    // Mark all as read
    markAllAsRead: async (): Promise<void> => {
        await axios.post(`${BASE_URL}mark_all_as_read/`);
    }
};
