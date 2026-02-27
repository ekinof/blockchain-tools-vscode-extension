import * as vscode from 'vscode';
import { isValidAddress } from '../../util/solAddressUtil.js';
import { createValidateCommand } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(createValidateCommand(
        'blockchain-tools.sol.validateAddress',
        'Select a Solana address first',
        isValidAddress,
        '✓ Valid Solana address',
        '✗ Not a valid Solana address'
    ));
}
