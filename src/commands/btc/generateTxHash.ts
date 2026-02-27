import * as vscode from 'vscode';
import { generateTxHash } from '../../util/btcAddressUtil.js';
import { insertAtCursor } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('blockchain-tools.btc.generateTxHash', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }
            insertAtCursor(editor, generateTxHash());
        })
    );
}
