import * as assert from 'assert';
import { generateAddress, isValidAddress, generateTxHash, isValidTxHash } from '../../util/btcAddressUtil.js';

suite('BtcAddressUtil', () => {
    test('generateAddress P2PKH produces address starting with 1', () => {
        for (let i = 0; i < 5; i++) {
            const addr = generateAddress('P2PKH');
            assert.ok(addr.startsWith('1'), `Expected P2PKH (starts with 1), got: ${addr}`);
            assert.strictEqual(isValidAddress(addr), true, `Expected valid address, got: ${addr}`);
        }
    });

    test('generateAddress P2SH produces address starting with 3', () => {
        for (let i = 0; i < 5; i++) {
            const addr = generateAddress('P2SH');
            assert.ok(addr.startsWith('3'), `Expected P2SH (starts with 3), got: ${addr}`);
            assert.strictEqual(isValidAddress(addr), true, `Expected valid address, got: ${addr}`);
        }
    });

    test('generateAddress Bech32 produces address starting with bc1', () => {
        for (let i = 0; i < 5; i++) {
            const addr = generateAddress('Bech32');
            assert.ok(addr.startsWith('bc1'), `Expected Bech32 (starts with bc1), got: ${addr}`);
            assert.strictEqual(isValidAddress(addr), true, `Expected valid address, got: ${addr}`);
        }
    });

    test('isValidAddress rejects garbage', () => {
        assert.strictEqual(isValidAddress(''), false);
        assert.strictEqual(isValidAddress('not-an-address'), false);
        assert.strictEqual(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'), false);
    });

    test('generateTxHash returns 64 lowercase hex chars (no 0x)', () => {
        for (let i = 0; i < 5; i++) {
            const hash = generateTxHash();
            assert.strictEqual(hash.length, 64, `Expected 64 chars, got: ${hash.length}`);
            assert.ok(/^[0-9a-f]+$/.test(hash), `Expected lowercase hex, got: ${hash}`);
        }
    });

    test('isValidTxHash accepts 64-char hex strings', () => {
        assert.strictEqual(isValidTxHash('a'.repeat(64)), true);
        assert.strictEqual(isValidTxHash('A'.repeat(64)), true); // uppercase also valid
        assert.strictEqual(isValidTxHash('0123456789abcdef'.repeat(4)), true);
    });

    test('isValidTxHash rejects invalid hashes', () => {
        assert.strictEqual(isValidTxHash('a'.repeat(63)), false);  // too short
        assert.strictEqual(isValidTxHash('a'.repeat(65)), false);  // too long
        assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(64)), false);  // has 0x prefix
        assert.strictEqual(isValidTxHash('g'.repeat(64)), false);  // invalid chars
    });
});
