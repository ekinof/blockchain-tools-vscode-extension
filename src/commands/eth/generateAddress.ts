import * as vscode from 'vscode';
import { generateAddress } from '../../util/ethAddressUtil.js';
import { getSettings, applySettings, insertAtCursor } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('crypto-blockchain-tools.eth.generateAddress', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }
            insertAtCursor(editor, applySettings(generateAddress(), getSettings()));
        })
    );
}
