import * as vscode from 'vscode';
import { isValidAddress } from '../../util/btcAddressUtil.js';
import { createValidateCommand } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(createValidateCommand(
        'crypto-blockchain-tools.btc.validateAddress',
        'Select a Bitcoin address first',
        isValidAddress,
        '✓ Valid Bitcoin address',
        '✗ Not a valid Bitcoin address'
    ));
}
