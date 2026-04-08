export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  token: string;
}

export type AuthAccount = NostrAccount | GoogleAccount;

export interface NostrAccount {
  type: 'nostr';
  id: string;
  pubkey: string;
  metadata: any;
}

export interface GoogleAccount {
  type: 'google';
  user: GoogleUser;
}

