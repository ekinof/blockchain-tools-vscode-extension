import { base58 } from '@scure/base';
import * as crypto from 'crypto';

export function generateAddress(): string {
    return base58.encode(crypto.randomBytes(32));
}

export function isValidAddress(address: string): boolean {
    try {
        const decoded = base58.decode(address);
        return decoded.length === 32;
    } catch {
        return false;
    }
}

export function generateSignature(): string {
    return base58.encode(crypto.randomBytes(64));
}

export function isValidSignature(sig: string): boolean {
    try {
        const decoded = base58.decode(sig);
        return decoded.length === 64;
    } catch {
        return false;
    }
}
