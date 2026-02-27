import * as vscode from 'vscode';

interface ActionItem extends vscode.QuickPickItem {
    command?: string;
}

export function register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('blockchain-tools.openMenu', async () => {
            const cfg = vscode.workspace.getConfiguration('blockchainTools');
            const enabled = cfg.get<{ eth: boolean; btc: boolean; sol: boolean }>(
                'enabledBlockchains',
                { eth: true, btc: true, sol: true }
            );

            const items: ActionItem[] = [];
            let n = 1;

            if (enabled.eth !== false) {
                items.push({ label: 'Ethereum', kind: vscode.QuickPickItemKind.Separator });
                items.push({ label: `${n++}. Generate ETH Address`,    command: 'blockchain-tools.eth.generateAddress' });
                items.push({ label: `${n++}. Checksum ETH Address`,    command: 'blockchain-tools.eth.checksumAddress' });
                items.push({ label: `${n++}. Toggle ETH Address Case`, command: 'blockchain-tools.eth.toggleCase' });
                items.push({ label: `${n++}. Generate ETH TxHash`,     command: 'blockchain-tools.eth.generateTxHash' });
                items.push({ label: `${n++}. Validate ETH TxHash`,     command: 'blockchain-tools.eth.validateTxHash' });
            }

            if (enabled.btc !== false) {
                items.push({ label: 'Bitcoin', kind: vscode.QuickPickItemKind.Separator });
                items.push({ label: `${n++}. Generate BTC Address`,  command: 'blockchain-tools.btc.generateAddress' });
                items.push({ label: `${n++}. Validate BTC Address`,  command: 'blockchain-tools.btc.validateAddress' });
                items.push({ label: `${n++}. Generate BTC TxHash`,   command: 'blockchain-tools.btc.generateTxHash' });
                items.push({ label: `${n++}. Validate BTC TxHash`,   command: 'blockchain-tools.btc.validateTxHash' });
            }

            if (enabled.sol !== false) {
                items.push({ label: 'Solana', kind: vscode.QuickPickItemKind.Separator });
                items.push({ label: `${n++}. Generate SOL Address`,   command: 'blockchain-tools.sol.generateAddress' });
                items.push({ label: `${n++}. Validate SOL Address`,   command: 'blockchain-tools.sol.validateAddress' });
                items.push({ label: `${n++}. Generate SOL Signature`, command: 'blockchain-tools.sol.generateSignature' });
                items.push({ label: `${n++}. Validate SOL Signature`, command: 'blockchain-tools.sol.validateSignature' });
            }

            const selected = await vscode.window.showQuickPick(items, {
                title: 'Blockchain Tools',
                placeHolder: 'Select an action…',
            });

            if (selected?.command) {
                vscode.commands.executeCommand(selected.command);
            }
        })
    );
}
