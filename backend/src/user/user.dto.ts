export interface AddUserDto {
  did: string;
  email: string;
  publicAddress: string;
  magicIdToken: string;
}

export interface AddEventDto {
  contractAddress: string;
}

export interface InviteUserDto {
  contractAddress: string;
}
