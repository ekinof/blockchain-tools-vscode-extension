import * as vscode from 'vscode';
import { isValidTxHash } from '../../util/ethTxHashUtil.js';
import { createValidateCommand } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(createValidateCommand(
        'blockchain-tools.eth.validateTxHash',
        'Select an Ethereum transaction hash first',
        isValidTxHash,
        '✓ Valid ETH transaction hash',
        '✗ Not a valid ETH transaction hash'
    ));
}
