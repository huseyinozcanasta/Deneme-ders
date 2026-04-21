import type { User as FirebaseUser } from 'firebase/auth';
import type { NostrSigner } from '@nostrify/nostrify';

/**
 * Nostr user metadata from kind:0 event
 */
export interface NostrUserMetadata {
  name?: string;
  display_name?: string;
  picture?: string;
  banner?: string;
  about?: string;
  website?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
  bot?: boolean;
}

/**
 * Extended User type that combines Firebase User with additional properties
 * needed for Nostr integration and application-specific features.
 */
export interface User extends Omit<FirebaseUser, 'metadata'> {
  /** Firebase UserMetadata (creationTime, lastSignInTime) */
  metadata?: FirebaseUser['metadata'];
  /** Nostr public key (hex) - may be undefined for users without Nostr integration */
  pubkey?: string;
  /** Nostr signer for signing events - may be undefined for users without Nostr integration */
  signer?: NostrSigner;
  /** User metadata from Nostr kind:0 event */
  nostrMetadata?: NostrUserMetadata;
}

/**
 * User with Nostr capabilities - guaranteed to have pubkey and signer
 */
export interface NostrUser extends User {
  pubkey: string;
  signer: NostrSigner;
}

/**
 * Type guard to check if a user has Nostr capabilities
 */
export function isNostrUser(user: FirebaseUser | User | null): user is User & { pubkey: string; signer: NostrSigner } {
  return user !== null && 'pubkey' in user && 'signer' in user && user.pubkey !== undefined && user.signer !== undefined;
}