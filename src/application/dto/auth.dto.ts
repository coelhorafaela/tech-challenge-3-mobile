export interface SignInDTO {
  email: string;
  password: string;
}

export interface SignUpDTO {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserResponseDTO {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

