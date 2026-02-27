import * as assert from 'assert';
import { generateTxHash, isValidTxHash } from '../../util/ethTxHashUtil.js';

suite('EthTxHashUtil', () => {
    test('generateTxHash returns 0x + 64 lowercase hex chars', () => {
        for (let i = 0; i < 10; i++) {
            const hash = generateTxHash();
            assert.ok(hash.startsWith('0x'), `Expected 0x prefix, got: ${hash}`);
            assert.strictEqual(hash.length, 66, `Expected 66 chars, got length ${hash.length}`);
            assert.ok(/^[0-9a-f]+$/.test(hash.slice(2)), `Expected lowercase hex, got: ${hash.slice(2)}`);
        }
    });

    test('isValidTxHash accepts valid ETH tx hashes', () => {
        assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(64)), true);
        assert.strictEqual(isValidTxHash('0x' + '0123456789abcdef'.repeat(4)), true);
        assert.strictEqual(isValidTxHash('0x' + 'ABCDEF0123456789'.repeat(4)), true); // uppercase also valid
    });

    test('isValidTxHash rejects invalid hashes', () => {
        assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(63)), false);  // too short
        assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(65)), false);  // too long
        assert.strictEqual(isValidTxHash('a'.repeat(64)), false);           // no 0x
        assert.strictEqual(isValidTxHash('0x' + 'g'.repeat(64)), false);  // invalid chars
        assert.strictEqual(isValidTxHash(''), false);
    });
});
