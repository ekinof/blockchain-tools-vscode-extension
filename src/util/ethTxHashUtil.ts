import * as crypto from 'crypto';

const TXHASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

export function generateTxHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
}

export function isValidTxHash(hash: string): boolean {
    return TXHASH_REGEX.test(hash);
}
