import { keccak_256 } from '@noble/hashes/sha3.js';
import * as crypto from 'crypto';

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

export function isValidAddress(address: string): boolean {
    return ADDRESS_REGEX.test(address);
}

export function toChecksumAddress(address: string): string {
    const stripped = address.replace(/^0x/i, '').toLowerCase();
    const hash = keccak_256(new TextEncoder().encode(stripped));
    let result = '0x';
    for (let i = 0; i < stripped.length; i++) {
        const c = stripped[i];
        if (/[a-f]/.test(c)) {
            const nibble = (hash[Math.floor(i / 2)] >> (i % 2 === 0 ? 4 : 0)) & 0xf;
            result += nibble >= 8 ? c.toUpperCase() : c;
        } else {
            result += c;
        }
    }
    return result;
}

export function isValidChecksum(address: string): boolean {
    return address === toChecksumAddress(address);
}

export function toggleCase(address: string): string {
    const checksummed = toChecksumAddress(address);
    return address === checksummed
        ? '0x' + address.slice(2).toLowerCase()
        : checksummed;
}

export function generateAddress(): string {
    const bytes = crypto.randomBytes(20);
    return toChecksumAddress('0x' + bytes.toString('hex'));
}
