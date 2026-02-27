import * as assert from 'assert';
import {
    toChecksumAddress,
    isValidAddress,
    isValidChecksum,
    toggleCase,
    generateAddress,
} from '../../util/ethAddressUtil.js';

// EIP-55 test vectors from the specification
const vectors = [
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
    '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
];

suite('EthAddressUtil', () => {
    test('toChecksumAddress produces correct EIP-55 output for spec vectors', () => {
        for (const v of vectors) {
            assert.strictEqual(toChecksumAddress(v.toLowerCase()), v, `lowercase → checksum failed for ${v}`);
            assert.strictEqual(toChecksumAddress(v.toUpperCase()), v, `uppercase → checksum failed for ${v}`);
            assert.strictEqual(toChecksumAddress(v), v, `already-checksummed → checksum failed for ${v}`);
        }
    });

    test('isValidChecksum returns true for correctly checksummed addresses', () => {
        for (const v of vectors) {
            assert.strictEqual(isValidChecksum(v), true);
        }
    });

    test('isValidChecksum returns false for lowercase addresses', () => {
        assert.strictEqual(isValidChecksum(vectors[0].toLowerCase()), false);
    });

    test('isValidAddress accepts valid hex addresses regardless of case', () => {
        assert.strictEqual(isValidAddress('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed'), true);
        assert.strictEqual(isValidAddress(vectors[0]), true);
    });

    test('isValidAddress rejects malformed addresses', () => {
        assert.strictEqual(isValidAddress('5aaeb6053f3e94c9b9a09f33669435e7ef1beaed'), false); // no 0x
        assert.strictEqual(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAe'), false);   // too short
        assert.strictEqual(isValidAddress('0xGGGG'), false);                                        // invalid chars
        assert.strictEqual(isValidAddress(''), false);
    });

    test('toggleCase converts checksummed to lowercase', () => {
        const checksummed = vectors[0];
        const lower = '0x' + checksummed.slice(2).toLowerCase();
        assert.strictEqual(toggleCase(checksummed), lower);
    });

    test('toggleCase converts lowercase to checksummed', () => {
        const checksummed = vectors[0];
        const lower = '0x' + checksummed.slice(2).toLowerCase();
        assert.strictEqual(toggleCase(lower), checksummed);
    });

    test('generateAddress returns a valid checksummed address', () => {
        for (let i = 0; i < 10; i++) {
            const addr = generateAddress();
            assert.strictEqual(isValidAddress(addr), true, `Expected valid address, got: ${addr}`);
            assert.strictEqual(isValidChecksum(addr), true, `Expected checksummed, got: ${addr}`);
        }
    });
});
