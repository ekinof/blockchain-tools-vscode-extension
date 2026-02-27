import { sha256 } from '@noble/hashes/sha2.js';
import { base58check, bech32 } from '@scure/base';
import * as crypto from 'crypto';

export type BtcAddressType = 'P2PKH' | 'P2SH' | 'Bech32';

const TXHASH_REGEX = /^[0-9a-fA-F]{64}$/;

// base58check with double-sha256 (Bitcoin standard)
const b58check = base58check(sha256);

export function generateAddress(type: BtcAddressType = 'P2PKH'): string {
    const hash = crypto.randomBytes(20);
    switch (type) {
        case 'P2PKH': {
            const payload = new Uint8Array([0x00, ...hash]);
            return b58check.encode(payload);
        }
        case 'P2SH': {
            const payload = new Uint8Array([0x05, ...hash]);
            return b58check.encode(payload);
        }
        case 'Bech32': {
            const words = bech32.toWords(hash);
            return bech32.encode('bc', [0, ...words]);
        }
    }
}

export function isValidAddress(address: string): boolean {
    // P2PKH / P2SH (Base58Check)
    try {
        const decoded = b58check.decode(address);
        if (decoded[0] === 0x00 || decoded[0] === 0x05) { return true; }
    } catch { /* not Base58Check */ }

    // Bech32 native SegWit
    try {
        const decoded = bech32.decodeUnsafe(address as `${string}1${string}`);
        if (decoded && decoded.prefix === 'bc' && decoded.words[0] === 0) {
            const data = bech32.fromWords(decoded.words.slice(1));
            return data.length === 20 || data.length === 32;
        }
    } catch { /* not Bech32 */ }

    return false;
}

export function generateTxHash(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function isValidTxHash(hash: string): boolean {
    return TXHASH_REGEX.test(hash);
}
