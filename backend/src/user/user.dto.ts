export interface AddUserDto {
  did: string;
  email: string;
  publicAddress: string;
  magicIdToken: string;
}

export interface InviteUserDto {
  contractAddress: string;
}
