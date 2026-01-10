export interface User {
    id: string | number;
    full_name: string;
    email: string;
    phone_number?: string;
    role?: 'SELLER' | 'BROKER' | 'ADMIN';
    is_active_seller?: boolean;
    is_active_broker?: boolean;
}
