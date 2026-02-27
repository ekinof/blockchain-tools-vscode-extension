import * as vscode from 'vscode';
import { isValidAddress, isValidChecksum } from '../../util/ethAddressUtil.js';
import { getSelectedText } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
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
