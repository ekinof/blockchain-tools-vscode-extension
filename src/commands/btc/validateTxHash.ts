import * as vscode from 'vscode';
import { isValidTxHash } from '../../util/btcAddressUtil.js';
import { createValidateCommand } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(createValidateCommand(
        'blockchain-tools.btc.validateTxHash',
        'Select a Bitcoin transaction hash first',
        isValidTxHash,
        '✓ Valid Bitcoin transaction hash',
        '✗ Not a valid Bitcoin transaction hash'
    ));
}
