# Blockchain Tools

**Blockchain Tools** is a VS Code extension that helps developers working with blockchain applications by providing quick generation and validation of blockchain-related data — directly from the editor.

## Features

### Ethereum (ERC20)
- **Generate Address** — Insert a random checksummed Ethereum address (EIP-55)
- **Checksum Address** — Verify EIP-55 checksum of selected address
- **Toggle Address Case** — Convert between lowercase and EIP-55 checksummed form
- **Generate TxHash** — Insert a random Ethereum transaction hash (`0x` + 64 hex chars)
- **Validate TxHash** — Verify transaction hash format

### Bitcoin
- **Generate Address** — Create random Bitcoin addresses (P2PKH, P2SH, or Bech32 — configurable)
- **Validate Address** — Check Bitcoin address validity
- **Generate TxHash** — Insert a random Bitcoin transaction hash (64 hex chars)
- **Validate TxHash** — Verify Bitcoin transaction hash format

### Solana
- **Generate Address** — Create random Solana addresses (Base58-encoded 32 bytes)
- **Validate Address** — Verify Solana address format
- **Generate Signature** — Insert random Solana transaction signatures (Base58-encoded 64 bytes)
- **Validate Signature** — Check Solana signature validity

## Usage

Access all tools via:
- **Keyboard**: `Ctrl+Alt+Shift+B` (`Cmd+Alt+Shift+B` on macOS) — opens the action menu
- **Command Palette**: Search for `Blockchain Tools` to see all individual commands

All generated data is cryptographically random and suitable for testing purposes.

## Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `blockchainTools.quoteStyle` | `"none"` \| `"single"` \| `"double"` | `"none"` | Wrap generated values in quotes |
| `blockchainTools.include0xPrefix` | boolean | `true` | Include `0x` prefix in ETH addresses and hashes |
| `blockchainTools.btcAddressType` | `"P2PKH"` \| `"P2SH"` \| `"Bech32"` | `"P2PKH"` | Bitcoin address format to generate |
| `blockchainTools.enabledBlockchains` | object | `{eth,btc,sol: true}` | Enable/disable blockchains in the menu |

## Installation

Install via the VS Code Marketplace — search for **Blockchain Tools**.
