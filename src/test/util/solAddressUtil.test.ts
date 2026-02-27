import * as assert from 'assert';
import { generateAddress, isValidAddress, generateSignature, isValidSignature } from '../../util/solAddressUtil.js';

suite('SolAddressUtil', () => {
    test('generateAddress returns a valid Base58 address (32 bytes)', () => {
        for (let i = 0; i < 10; i++) {
            const addr = generateAddress();
            assert.ok(addr.length > 0, 'Expected non-empty address');
            assert.strictEqual(isValidAddress(addr), true, `Expected valid address, got: ${addr}`);
        }
    });

    test('isValidAddress rejects garbage', () => {
        assert.strictEqual(isValidAddress(''), false);
        assert.strictEqual(isValidAddress('not-valid!'), false);
        assert.strictEqual(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'), false);
    });

    test('generateSignature returns a valid Base58 signature (64 bytes)', () => {
        for (let i = 0; i < 10; i++) {
            const sig = generateSignature();
            assert.ok(sig.length > 0, 'Expected non-empty signature');
            assert.strictEqual(isValidSignature(sig), true, `Expected valid signature, got: ${sig}`);
        }
    });

    test('isValidSignature rejects addresses (32-byte decode)', () => {
        const addr = generateAddress(); // 32-byte payload
        assert.strictEqual(isValidSignature(addr), false);
    });

    test('isValidSignature rejects garbage', () => {
        assert.strictEqual(isValidSignature(''), false);
        assert.strictEqual(isValidSignature('not-valid!'), false);
    });
});
