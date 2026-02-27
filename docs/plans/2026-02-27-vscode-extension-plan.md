# Blockchain Tools VSCode Extension — Implementation Plan

**Date:** 2026-02-27
**Status:** Draft
**Design:** See [2026-02-27-vscode-extension-design.md](./2026-02-27-vscode-extension-design.md)

Phased plan. Each phase builds on the previous. Complete Phase 1 before starting Phase 2.

---

## Phase 1: Ethereum Core

Goal: all five ETH commands working end-to-end with tests.

---

### Task 1.1: Install dependencies and set up folder structure

**Files:**
- Modify: `package.json`
- Create: `src/util/`, `src/commands/eth/`

**Step 1: Install runtime dependencies**

```bash
pnpm add @noble/hashes @scure/base
```

**Step 2: Create folder structure**

```
src/
  util/
  commands/
    eth/
```

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add @noble/hashes and @scure/base dependencies"
```

---

### Task 1.2: Create `EthAddressUtil` (TDD)

**Files:**
- Create: `src/util/ethAddressUtil.ts`
- Create: `src/test/util/ethAddressUtil.test.ts`

**Step 1: Write failing tests**

```typescript
// src/test/util/ethAddressUtil.test.ts
import * as assert from 'assert';
import { toChecksumAddress, isValidAddress, isValidChecksum, toggleCase, generateAddress } from '../../util/ethAddressUtil';

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
      assert.strictEqual(toChecksumAddress(v.toLowerCase()), v);
      assert.strictEqual(toChecksumAddress(v.toUpperCase()), v);
      assert.strictEqual(toChecksumAddress(v), v);
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
    assert.strictEqual(isValidAddress('0xGGGG'), false);
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
      assert.strictEqual(isValidChecksum(addr), true, `Expected checksummed address, got: ${addr}`);
    }
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
pnpm test
```

**Step 3: Implement `EthAddressUtil`**

```typescript
// src/util/ethAddressUtil.ts
import { keccak_256 } from '@noble/hashes/sha3';
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
```

**Step 4: Run tests to confirm they pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/util/ethAddressUtil.ts src/test/util/ethAddressUtil.test.ts
git commit -m "feat: add EthAddressUtil with EIP-55 checksum, toggle, and address generation"
```

---

### Task 1.3: Create `EthTxHashUtil` (TDD)

**Files:**
- Create: `src/util/ethTxHashUtil.ts`
- Create: `src/test/util/ethTxHashUtil.test.ts`

**Step 1: Write failing tests**

```typescript
// src/test/util/ethTxHashUtil.test.ts
import * as assert from 'assert';
import { generateTxHash, isValidTxHash } from '../../util/ethTxHashUtil';

suite('EthTxHashUtil', () => {
  test('generateTxHash returns 0x + 64 lowercase hex chars', () => {
    for (let i = 0; i < 10; i++) {
      const hash = generateTxHash();
      assert.ok(hash.startsWith('0x'), `Expected 0x prefix, got: ${hash}`);
      assert.strictEqual(hash.length, 66, `Expected 66 chars, got: ${hash}`);
      assert.ok(/^[0-9a-f]+$/.test(hash.slice(2)), `Expected hex chars, got: ${hash.slice(2)}`);
    }
  });

  test('isValidTxHash accepts valid ETH tx hash', () => {
    assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(64)), true);
    assert.strictEqual(isValidTxHash('0x' + '0123456789abcdef'.repeat(4)), true);
  });

  test('isValidTxHash rejects invalid hashes', () => {
    assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(63)), false);  // too short
    assert.strictEqual(isValidTxHash('0x' + 'a'.repeat(65)), false);  // too long
    assert.strictEqual(isValidTxHash('a'.repeat(64)), false);          // no 0x
    assert.strictEqual(isValidTxHash('0x' + 'g'.repeat(64)), false);  // invalid chars
  });
});
```

**Step 2: Implement**

```typescript
// src/util/ethTxHashUtil.ts
import * as crypto from 'crypto';

const TXHASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

export function generateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

export function isValidTxHash(hash: string): boolean {
  return TXHASH_REGEX.test(hash);
}
```

**Step 3: Run tests and commit**

```bash
pnpm test
git add src/util/ethTxHashUtil.ts src/test/util/ethTxHashUtil.test.ts
git commit -m "feat: add EthTxHashUtil with generate and validate"
```

---

### Task 1.4: Create `InsertUtil` (shared editor helper)

**Files:**
- Create: `src/util/insertUtil.ts`

```typescript
// src/util/insertUtil.ts
import * as vscode from 'vscode';

export interface InsertSettings {
  quoteStyle: 'none' | 'single' | 'double';
  include0xPrefix: boolean;
}

export function getSettings(): InsertSettings {
  const cfg = vscode.workspace.getConfiguration('blockchainTools');
  return {
    quoteStyle: cfg.get<'none' | 'single' | 'double'>('quoteStyle', 'none'),
    include0xPrefix: cfg.get<boolean>('include0xPrefix', true),
  };
}

export function applySettings(raw: string, settings: InsertSettings): string {
  let value = raw;
  if (!settings.include0xPrefix && value.startsWith('0x')) {
    value = value.slice(2);
  }
  switch (settings.quoteStyle) {
    case 'single': return `'${value}'`;
    case 'double': return `"${value}"`;
    default: return value;
  }
}

export function insertAtCursor(editor: vscode.TextEditor, text: string): Thenable<boolean> {
  return editor.edit(b => b.insert(editor.selection.active, text));
}

export function replaceSelection(editor: vscode.TextEditor, text: string): Thenable<boolean> {
  return editor.edit(b => b.replace(editor.selection, text));
}

export function getSelectedText(editor: vscode.TextEditor): string | undefined {
  if (editor.selection.isEmpty) { return undefined; }
  return editor.document.getText(editor.selection);
}
```

**Commit:**

```bash
git add src/util/insertUtil.ts
git commit -m "feat: add InsertUtil shared editor helper"
```

---

### Task 1.5: Register settings and commands in `package.json`

**Files:**
- Modify: `package.json`

Add all ETH commands, the menu command, keybinding, and configuration to `contributes`.
See [design doc](./2026-02-27-vscode-extension-design.md) for the full JSON.

**Commit:**

```bash
git add package.json
git commit -m "feat: register ETH commands, keybinding, and settings in package.json"
```

---

### Task 1.6: Implement ETH commands

For each command below, create the file and register it in `extension.ts`.

#### `crypto-blockchain-tools.eth.generateAddress`

```typescript
// src/commands/eth/generateAddress.ts
import * as vscode from 'vscode';
import { generateAddress } from '../../util/ethAddressUtil';
import { getSettings, applySettings, insertAtCursor } from '../../util/insertUtil';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.eth.generateAddress', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const text = applySettings(generateAddress(), getSettings());
      insertAtCursor(editor, text);
    })
  );
}
```

#### `crypto-blockchain-tools.eth.checksumAddress`

```typescript
// src/commands/eth/checksumAddress.ts
import * as vscode from 'vscode';
import { isValidAddress, isValidChecksum } from '../../util/ethAddressUtil';
import { getSelectedText } from '../../util/insertUtil';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.eth.checksumAddress', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const selected = getSelectedText(editor);
      if (!selected) {
        vscode.window.showWarningMessage('Select an Ethereum address first');
        return;
      }
      if (!isValidAddress(selected)) {
        vscode.window.showErrorMessage('Not a valid Ethereum address');
        return;
      }
      if (isValidChecksum(selected)) {
        vscode.window.showInformationMessage('✓ Valid EIP-55 checksum');
      } else {
        vscode.window.showWarningMessage('✗ Invalid checksum');
      }
    })
  );
}
```

#### `crypto-blockchain-tools.eth.toggleCase`

```typescript
// src/commands/eth/toggleCase.ts
import * as vscode from 'vscode';
import { isValidAddress, toggleCase } from '../../util/ethAddressUtil';
import { getSelectedText, replaceSelection } from '../../util/insertUtil';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.eth.toggleCase', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const selected = getSelectedText(editor);
      if (!selected) {
        vscode.window.showWarningMessage('Select an Ethereum address first');
        return;
      }
      if (!isValidAddress(selected)) {
        vscode.window.showErrorMessage('Not a valid Ethereum address');
        return;
      }
      replaceSelection(editor, toggleCase(selected));
    })
  );
}
```

#### `crypto-blockchain-tools.eth.generateTxHash`

```typescript
// src/commands/eth/generateTxHash.ts
import * as vscode from 'vscode';
import { generateTxHash } from '../../util/ethTxHashUtil';
import { getSettings, applySettings, insertAtCursor } from '../../util/insertUtil';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.eth.generateTxHash', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const text = applySettings(generateTxHash(), getSettings());
      insertAtCursor(editor, text);
    })
  );
}
```

#### `crypto-blockchain-tools.eth.validateTxHash`

```typescript
// src/commands/eth/validateTxHash.ts
import * as vscode from 'vscode';
import { isValidTxHash } from '../../util/ethTxHashUtil';
import { getSelectedText } from '../../util/insertUtil';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.eth.validateTxHash', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const selected = getSelectedText(editor);
      if (!selected) {
        vscode.window.showWarningMessage('Select an Ethereum transaction hash first');
        return;
      }
      if (isValidTxHash(selected)) {
        vscode.window.showInformationMessage('✓ Valid ETH transaction hash');
      } else {
        vscode.window.showErrorMessage('✗ Not a valid ETH transaction hash');
      }
    })
  );
}
```

**Commit per command or all together:**

```bash
git add src/commands/eth/
git commit -m "feat: implement all ETH commands"
```

---

### Task 1.7: Wire commands in `extension.ts`

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { register as registerGenerateAddress } from './commands/eth/generateAddress';
import { register as registerChecksumAddress } from './commands/eth/checksumAddress';
import { register as registerToggleCase } from './commands/eth/toggleCase';
import { register as registerGenerateTxHash } from './commands/eth/generateTxHash';
import { register as registerValidateTxHash } from './commands/eth/validateTxHash';

export function activate(context: vscode.ExtensionContext) {
  registerGenerateAddress(context);
  registerChecksumAddress(context);
  registerToggleCase(context);
  registerGenerateTxHash(context);
  registerValidateTxHash(context);
}

export function deactivate() {}
```

**Commit:**

```bash
git add src/extension.ts
git commit -m "feat: wire ETH commands in extension.ts"
```

---

## Phase 2: Menu (Quick Pick)

### Task 2.1: Implement `openMenu` command

**File:** `src/commands/menu.ts`

The menu uses `vscode.QuickPickItem` with `kind: vscode.QuickPickItemKind.Separator` for section headers.

```typescript
// src/commands/menu.ts
import * as vscode from 'vscode';

interface ActionItem extends vscode.QuickPickItem {
  command?: string;
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('crypto-blockchain-tools.openMenu', async () => {
      const cfg = vscode.workspace.getConfiguration('blockchainTools');
      const enabled = cfg.get<{ eth: boolean; btc: boolean; sol: boolean }>(
        'enabledBlockchains', { eth: true, btc: true, sol: true }
      );

      const items: ActionItem[] = [];
      let n = 1;

      if (enabled.eth) {
        items.push({ label: 'Ethereum', kind: vscode.QuickPickItemKind.Separator });
        items.push({ label: `${n++}. Generate ETH Address`,   command: 'crypto-blockchain-tools.eth.generateAddress' });
        items.push({ label: `${n++}. Checksum ETH Address`,   command: 'crypto-blockchain-tools.eth.checksumAddress' });
        items.push({ label: `${n++}. Toggle ETH Address Case`, command: 'crypto-blockchain-tools.eth.toggleCase' });
        items.push({ label: `${n++}. Generate ETH TxHash`,    command: 'crypto-blockchain-tools.eth.generateTxHash' });
        items.push({ label: `${n++}. Validate ETH TxHash`,    command: 'crypto-blockchain-tools.eth.validateTxHash' });
      }

      if (enabled.btc) {
        items.push({ label: 'Bitcoin', kind: vscode.QuickPickItemKind.Separator });
        items.push({ label: `${n++}. Generate BTC Address`,  command: 'crypto-blockchain-tools.btc.generateAddress' });
        items.push({ label: `${n++}. Validate BTC Address`,  command: 'crypto-blockchain-tools.btc.validateAddress' });
        items.push({ label: `${n++}. Generate BTC TxHash`,   command: 'crypto-blockchain-tools.btc.generateTxHash' });
        items.push({ label: `${n++}. Validate BTC TxHash`,   command: 'crypto-blockchain-tools.btc.validateTxHash' });
      }

      if (enabled.sol) {
        items.push({ label: 'Solana', kind: vscode.QuickPickItemKind.Separator });
        items.push({ label: `${n++}. Generate SOL Address`,   command: 'crypto-blockchain-tools.sol.generateAddress' });
        items.push({ label: `${n++}. Validate SOL Address`,   command: 'crypto-blockchain-tools.sol.validateAddress' });
        items.push({ label: `${n++}. Generate SOL Signature`, command: 'crypto-blockchain-tools.sol.generateSignature' });
        items.push({ label: `${n++}. Validate SOL Signature`, command: 'crypto-blockchain-tools.sol.validateSignature' });
      }

      const selected = await vscode.window.showQuickPick(items, {
        title: 'Blockchain Tools',
        placeHolder: 'Select an action',
      });

      if (selected?.command) {
        vscode.commands.executeCommand(selected.command);
      }
    })
  );
}
```

Register in `extension.ts` and add `crypto-blockchain-tools.openMenu` to `package.json` commands + keybinding.

**Commit:**

```bash
git add src/commands/menu.ts src/extension.ts package.json
git commit -m "feat: add openMenu Quick Pick with Ctrl+Alt+Shift+B keybinding"
```

---

## Phase 3: Bitcoin Support

### Task 3.1: Create `BtcAddressUtil` (TDD)

**File:** `src/util/btcAddressUtil.ts`

Core functions:

```typescript
generateAddress(type: 'P2PKH' | 'P2SH' | 'Bech32'): string
isValidAddress(address: string): boolean
generateTxHash(): string      // 64 hex chars, no 0x
isValidTxHash(hash: string): boolean  // /^[0-9a-fA-F]{64}$/
```

Implementation notes:
- **P2PKH** (`1...`): version byte `0x00` + 20 random bytes → `sha256d` → first 4 bytes as checksum → Base58 encode
- **P2SH** (`3...`): version byte `0x05` + 20 random bytes → same Base58Check
- **Bech32** (`bc1...`): 20 random bytes → bech32 encode with witness version 0 and hrp `bc`
- Use `@scure/base` for `base58check` and `bech32`; `@noble/hashes` for `sha256`

**Commit:**

```bash
git add src/util/btcAddressUtil.ts src/test/util/btcAddressUtil.test.ts
git commit -m "feat: add BtcAddressUtil with P2PKH, P2SH, Bech32 generation and validation"
```

### Task 3.2: Implement BTC commands

Same pattern as ETH commands. Files: `src/commands/btc/generateAddress.ts`, `validateAddress.ts`, `generateTxHash.ts`, `validateTxHash.ts`.

Wire into `extension.ts` and register in `package.json`.

**Commit:**

```bash
git add src/commands/btc/
git commit -m "feat: implement all BTC commands"
```

---

## Phase 4: Solana Support

### Task 4.1: Create `SolAddressUtil` (TDD)

**File:** `src/util/solAddressUtil.ts`

Core functions:

```typescript
generateAddress(): string         // Base58 of 32 random bytes
isValidAddress(address: string): boolean  // Base58 decode → 32 bytes
generateSignature(): string       // Base58 of 64 random bytes
isValidSignature(sig: string): boolean    // Base58 decode → 64 bytes
```

Use `@scure/base` (`base58`).

**Commit:**

```bash
git add src/util/solAddressUtil.ts src/test/util/solAddressUtil.test.ts
git commit -m "feat: add SolAddressUtil with address and signature generation/validation"
```

### Task 4.2: Implement Solana commands

Files: `src/commands/sol/generateAddress.ts`, `validateAddress.ts`, `generateSignature.ts`, `validateSignature.ts`.

Wire into `extension.ts` and register in `package.json`.

**Commit:**

```bash
git add src/commands/sol/
git commit -m "feat: implement all Solana commands"
```

---

## Phase 5: Final Wiring and README

### Task 5.1: Final `extension.ts`

Register all commands (ETH + BTC + SOL + menu) and ensure all subscriptions are added to `context.subscriptions`.

### Task 5.2: Update `README.md`

Replace the placeholder README with a user-facing description matching the IntelliJ plugin's README style:

- Feature list per blockchain
- Usage (keyboard shortcut, command palette)
- Settings table
- Installation instructions

### Task 5.3: Update `CHANGELOG.md`

Document the initial release with all features.

### Task 5.4: Full test run

```bash
pnpm run compile && pnpm test
```

Expected: all tests pass.

**Commit:**

```bash
git add README.md CHANGELOG.md src/extension.ts
git commit -m "feat: wire all commands, update README and CHANGELOG for 0.0.1"
```

---

## Summary

| Phase | Deliverable | Commands |
|-------|-------------|----------|
| 1 | Ethereum core | 5 ETH commands |
| 2 | Menu | `openMenu` + `Ctrl+Alt+Shift+B` |
| 3 | Bitcoin | 4 BTC commands |
| 4 | Solana | 4 SOL commands |
| 5 | Polish | README, CHANGELOG, full test pass |

Total: 14 commands + 1 menu command = 15 registered commands.
