export interface Customer{
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    funds: number;
    authProvider:string;
    profile: string | null;
    status: number;
    created_at: string;
    tempFund?: number; // Optional temporary property
}
