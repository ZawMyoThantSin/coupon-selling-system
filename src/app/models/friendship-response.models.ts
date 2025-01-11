export interface FriendshipResponse {
    id: number;
    senderName: string;
    accepterName: string;
    profileImagePath: string;
    status: number; // 0 = Pending, 1 = Accepted, 2 = Declined
    createdAt: Date;
    acceptedDate?: Date | null; // Nullable for pending requests
  }
