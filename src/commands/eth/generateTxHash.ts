import * as vscode from 'vscode';
import { generateTxHash } from '../../util/ethTxHashUtil.js';
import { getSettings, applySettings, insertAtCursor } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('blockchain-tools.eth.generateTxHash', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }
            insertAtCursor(editor, applySettings(generateTxHash(), getSettings()));
        })
    );
}
