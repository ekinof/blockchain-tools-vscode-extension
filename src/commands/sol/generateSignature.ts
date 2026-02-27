import * as vscode from 'vscode';
import { generateSignature } from '../../util/solAddressUtil.js';
import { insertAtCursor } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('blockchain-tools.sol.generateSignature', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }
            insertAtCursor(editor, generateSignature());
        })
    );
}
