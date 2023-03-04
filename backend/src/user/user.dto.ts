export interface AddUserDto {
  did: string;
  email: string;
  publicAddress: string;
  magicIdToken: string;
}

export interface QueueAwardDto {
  assignments: {
    email: string;
    tokenId: string;
  }[];
}

export interface InviteUserDto {
  contractAddress: string;
}
