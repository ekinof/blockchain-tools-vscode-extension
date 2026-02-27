# Blockchain Tools VSCode Extension — Design

**Date:** 2026-02-27
**Status:** Draft
**Source:** Ported from `blockchain-tools-intellij-platform-plugin`

---

## Summary

A VSCode extension that mirrors the IntelliJ plugin's blockchain utilities:
quick generation and validation of Ethereum, Bitcoin, and Solana addresses,
transaction hashes, and signatures — accessible via a Quick Pick menu and
individual commands.

---

## Feature Set

### Ethereum (ERC20)

| # | Command ID | Action |
|---|------------|--------|
| 1 | `blockchain-tools.eth.generateAddress` | Insert a random EIP-55 checksummed Ethereum address at cursor |
| 2 | `blockchain-tools.eth.checksumAddress` | Verify EIP-55 checksum of selected text → status bar / notification |
| 3 | `blockchain-tools.eth.toggleCase` | Toggle selected address between lowercase and EIP-55 checksummed form |
| 4 | `blockchain-tools.eth.generateTxHash` | Insert a random ETH transaction hash (`0x` + 64 hex chars) at cursor |
| 5 | `blockchain-tools.eth.validateTxHash` | Verify selected text is a valid ETH transaction hash → notification |

### Bitcoin

| # | Command ID | Action |
|---|------------|--------|
| 6 | `blockchain-tools.btc.generateAddress` | Insert a random Bitcoin address (P2PKH, P2SH, or Bech32 — configurable) |
| 7 | `blockchain-tools.btc.validateAddress` | Verify selected text is a valid Bitcoin address → notification |
| 8 | `blockchain-tools.btc.generateTxHash` | Insert a random Bitcoin transaction hash (64 hex chars) at cursor |
| 9 | `blockchain-tools.btc.validateTxHash` | Verify selected text is a valid Bitcoin transaction hash → notification |

### Solana

| # | Command ID | Action |
|---|------------|--------|
| 10 | `blockchain-tools.sol.generateAddress` | Insert a random Solana address (Base58-encoded 32 bytes) at cursor |
| 11 | `blockchain-tools.sol.validateAddress` | Verify selected text is a valid Solana address → notification |
| 12 | `blockchain-tools.sol.generateSignature` | Insert a random Solana transaction signature (Base58-encoded 64 bytes) |
| 13 | `blockchain-tools.sol.validateSignature` | Verify selected text is a valid Solana signature → notification |

### Menu

| Command ID | Action |
|------------|--------|
| `blockchain-tools.openMenu` | Open Quick Pick with all actions grouped by blockchain |

---

## VSCode API Mappings (IntelliJ → VSCode)

| IntelliJ concept | VSCode equivalent |
|-----------------|-------------------|
| `AnAction` | `vscode.commands.registerCommand` |
| `ActionGroup` popup | `vscode.window.showQuickPick` with separators |
| Balloon notification | `vscode.window.showInformationMessage` / `showWarningMessage` / `showErrorMessage` |
| `WriteCommandAction` | `editor.edit(editBuilder => ...)` |
| `editor.document.insertString` | `editBuilder.insert(position, text)` |
| `editor.document.replaceString` | `editBuilder.replace(selection, text)` |
| `editor.selectionModel.selectedText` | `editor.document.getText(editor.selection)` |
| `PersistentStateComponent` | `vscode.workspace.getConfiguration('blockchainTools')` |
| `Configurable` settings page | `contributes.configuration` in `package.json` |
| Keyboard shortcut in `plugin.xml` | `contributes.keybindings` in `package.json` |

---

## Project Structure

```
src/
  extension.ts                    ← activate(): register all commands + keybinding
  commands/
    menu.ts                       ← openMenu — Quick Pick with all actions
    eth/
      generateAddress.ts          ← inserts random EIP-55 address
      checksumAddress.ts          ← validates checksum of selection
      toggleCase.ts               ← toggles selection between lower ↔ EIP-55
      generateTxHash.ts           ← inserts random 0x + 64 hex chars
      validateTxHash.ts           ← validates selection as ETH tx hash
    btc/
      generateAddress.ts
      validateAddress.ts
      generateTxHash.ts
      validateTxHash.ts
    sol/
      generateAddress.ts
      validateAddress.ts
      generateSignature.ts
      validateSignature.ts
  util/
    ethAddressUtil.ts             ← EIP-55: generate, checksum, toggleCase, validate
    ethTxHashUtil.ts              ← generate + validate ETH tx hash
    btcAddressUtil.ts             ← generate (P2PKH/P2SH/Bech32) + validate
    solAddressUtil.ts             ← generate + validate addresses and signatures
    insertUtil.ts                 ← shared helper: apply quote style + 0x prefix, insert at cursor
  test/
    util/
      ethAddressUtil.test.ts
      ethTxHashUtil.test.ts
      btcAddressUtil.test.ts
      solAddressUtil.test.ts
    commands/
      eth.test.ts
      btc.test.ts
      sol.test.ts
```

---

## Core Logic

### EthAddressUtil (EIP-55)

```
generateAddress(): string
  → crypto.randomBytes(20) → hex → toChecksumAddress

toChecksumAddress(address: string): string
  1. Strip "0x", lowercase 40 hex chars
  2. keccak256 of ASCII bytes
  3. For each char: if letter AND hash nibble ≥ 8 → uppercase, else lowercase
  4. Re-attach "0x"

isValidChecksum(address: string): boolean
  → address === toChecksumAddress(address)

isValidAddress(address: string): boolean
  → /^0x[0-9a-fA-F]{40}$/.test(address)

toggleCase(address: string): string
  → if already checksummed → lowercase; else → toChecksumAddress
```

**keccak256 implementation:** via `@noble/hashes/sha3` (`keccak_256`).
This package is zero-dependency, tree-shakeable, and well-audited.

### EthTxHashUtil

```
generateTxHash(): string
  → crypto.randomBytes(32) → "0x" + lowercase hex (66 chars total)

isValidTxHash(hash: string): boolean
  → /^0x[0-9a-fA-F]{64}$/.test(hash)
```

### BtcAddressUtil

```
generateAddress(type: 'P2PKH' | 'P2SH' | 'Bech32'): string
  P2PKH: version 0x00 + random 20 bytes → Base58Check
  P2SH:  version 0x05 + random 20 bytes → Base58Check
  Bech32: random 20 bytes → bech32 encode (witness version 0, mainnet "bc")

isValidAddress(address: string): boolean
  → attempt decode as P2PKH/P2SH (Base58Check) or Bech32

generateTxHash(): string
  → crypto.randomBytes(32) → lowercase hex (64 chars, no 0x prefix)

isValidTxHash(hash: string): boolean
  → /^[0-9a-fA-F]{64}$/.test(hash)
```

**Dependencies:** `@noble/hashes` (sha256, ripemd160 for Base58Check), `@scure/base` (base58check, bech32).

### SolAddressUtil

```
generateAddress(): string
  → crypto.randomBytes(32) → Base58 encode

isValidAddress(address: string): boolean
  → Base58 decode → 32 bytes

generateSignature(): string
  → crypto.randomBytes(64) → Base58 encode

isValidSignature(sig: string): boolean
  → Base58 decode → 64 bytes
```

**Dependency:** `@scure/base` (base58).

### InsertUtil (shared)

```
applySettings(raw: string, settings): string
  1. Optionally strip "0x" prefix (if include0xPrefix = false)
  2. Wrap in quotes (quoteStyle: none | single | double)

insertAtCursor(editor, text): void
  → editor.edit(b => b.insert(editor.selection.active, text))

replaceSelection(editor, text): void
  → editor.edit(b => b.replace(editor.selection, text))
```

---

## Menu (Quick Pick)

`blockchain-tools.openMenu` opens a `vscode.window.showQuickPick` with items:

```
─── Ethereum ───────────────────────
  1. Generate ETH Address
  2. Checksum ETH Address
  3. Toggle ETH Address Case
  4. Generate ETH TxHash
  5. Validate ETH TxHash
─── Bitcoin ────────────────────────
  6. Generate BTC Address
  7. Validate BTC Address
  8. Generate BTC TxHash
  9. Validate BTC TxHash
─── Solana ─────────────────────────
 10. Generate SOL Address
 11. Validate SOL Address
 12. Generate SOL Signature
 13. Validate SOL Signature
```

VSCode `QuickPickItem` with `kind: vscode.QuickPickItemKind.Separator` provides the section headers.

Disabled blockchains (from settings) are omitted from the menu.

---

## Command Registration (package.json)

```json
"contributes": {
  "commands": [
    { "command": "blockchain-tools.openMenu",              "title": "Blockchain Tools: Open Menu" },
    { "command": "blockchain-tools.eth.generateAddress",   "title": "Blockchain Tools: Generate ETH Address" },
    { "command": "blockchain-tools.eth.checksumAddress",   "title": "Blockchain Tools: Checksum ETH Address" },
    { "command": "blockchain-tools.eth.toggleCase",        "title": "Blockchain Tools: Toggle ETH Address Case" },
    { "command": "blockchain-tools.eth.generateTxHash",    "title": "Blockchain Tools: Generate ETH TxHash" },
    { "command": "blockchain-tools.eth.validateTxHash",    "title": "Blockchain Tools: Validate ETH TxHash" },
    { "command": "blockchain-tools.btc.generateAddress",   "title": "Blockchain Tools: Generate BTC Address" },
    { "command": "blockchain-tools.btc.validateAddress",   "title": "Blockchain Tools: Validate BTC Address" },
    { "command": "blockchain-tools.btc.generateTxHash",    "title": "Blockchain Tools: Generate BTC TxHash" },
    { "command": "blockchain-tools.btc.validateTxHash",    "title": "Blockchain Tools: Validate BTC TxHash" },
    { "command": "blockchain-tools.sol.generateAddress",   "title": "Blockchain Tools: Generate SOL Address" },
    { "command": "blockchain-tools.sol.validateAddress",   "title": "Blockchain Tools: Validate SOL Address" },
    { "command": "blockchain-tools.sol.generateSignature", "title": "Blockchain Tools: Generate SOL Signature" },
    { "command": "blockchain-tools.sol.validateSignature", "title": "Blockchain Tools: Validate SOL Signature" }
  ],
  "keybindings": [
    {
      "command": "blockchain-tools.openMenu",
      "key": "ctrl+alt+shift+b",
      "mac": "cmd+alt+shift+b",
      "when": "editorTextFocus"
    }
  ]
}
```

---

## Settings (package.json `contributes.configuration`)

```json
"blockchainTools.quoteStyle": {
  "type": "string",
  "enum": ["none", "single", "double"],
  "default": "none",
  "description": "Wrap generated values in quotes"
},
"blockchainTools.include0xPrefix": {
  "type": "boolean",
  "default": true,
  "description": "Include 0x prefix in generated ETH addresses and hashes"
},
"blockchainTools.btcAddressType": {
  "type": "string",
  "enum": ["P2PKH", "P2SH", "Bech32"],
  "default": "P2PKH",
  "description": "Bitcoin address format to generate"
},
"blockchainTools.enabledBlockchains": {
  "type": "object",
  "default": { "eth": true, "btc": true, "sol": true },
  "description": "Enable or disable blockchains in the menu"
}
```

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| No active editor | Command does nothing (guard: `vscode.window.activeTextEditor`) |
| No selection for validate/checksum/toggle commands | `showWarningMessage("Select a ... first")` |
| Selected text does not match expected format | `showErrorMessage("Not a valid ...")` |
| Valid checksum / format | `showInformationMessage("✓ ...")` |
| Invalid checksum / format | `showWarningMessage("✗ ...")` |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@noble/hashes` | keccak256 (EIP-55), sha256 + ripemd160 (Bitcoin Base58Check) |
| `@scure/base` | Base58Check (Bitcoin), Base58 (Solana), Bech32 (Bitcoin Bech32) |

Both packages are from the `@noble`/`@scure` family: zero-dependency, audited, browser-compatible.

---

## Testing Strategy

- **Unit tests** for all `util/` modules (pure functions, no VSCode dependency)
- **Integration tests** using `@vscode/test-electron` for command registration and editor interaction
- Test vectors from the IntelliJ plugin are reused where applicable (EIP-55 vectors, etc.)
