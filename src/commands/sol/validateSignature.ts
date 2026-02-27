import * as vscode from 'vscode';
import { isValidSignature } from '../../util/solAddressUtil.js';
import { createValidateCommand } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(createValidateCommand(
        'crypto-blockchain-tools.sol.validateSignature',
        'Select a Solana signature first',
        isValidSignature,
        '✓ Valid Solana signature',
        '✗ Not a valid Solana signature'
    ));
}
