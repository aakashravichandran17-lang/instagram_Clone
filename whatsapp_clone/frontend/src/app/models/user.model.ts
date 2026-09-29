export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  profileImage: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
