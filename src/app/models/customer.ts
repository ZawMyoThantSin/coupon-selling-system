export interface Customer{
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    funds: number;
    profile: string | null;
    status: number;
    createdAt: string;
    tempFund?: number; // Optional temporary property
}
