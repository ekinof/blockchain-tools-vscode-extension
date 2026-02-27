import * as vscode from 'vscode';
import { generateAddress } from '../../util/btcAddressUtil.js';
import { insertAtCursor } from '../../util/insertUtil.js';

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('crypto-blockchain-tools.btc.generateAddress', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }
            const cfg = vscode.workspace.getConfiguration('blockchainTools');
            const type = cfg.get<'P2PKH' | 'P2SH' | 'Bech32'>('btcAddressType', 'P2PKH');
            insertAtCursor(editor, generateAddress(type));
        })
    );
}
