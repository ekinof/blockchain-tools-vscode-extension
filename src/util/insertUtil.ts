import * as vscode from 'vscode';

export type QuoteStyle = 'none' | 'single' | 'double';

export interface InsertSettings {
    quoteStyle: QuoteStyle;
    include0xPrefix: boolean;
}

export function getSettings(): InsertSettings {
    const cfg = vscode.workspace.getConfiguration('blockchainTools');
    return {
        quoteStyle: cfg.get<QuoteStyle>('quoteStyle', 'none'),
        include0xPrefix: cfg.get<boolean>('include0xPrefix', true),
    };
}

export function applySettings(raw: string, settings: InsertSettings): string {
    let value = raw;
    if (!settings.include0xPrefix && value.startsWith('0x')) {
        value = value.slice(2);
    }
    switch (settings.quoteStyle) {
        case 'single': return `'${value}'`;
        case 'double': return `"${value}"`;
        default: return value;
    }
}

export function insertAtCursor(editor: vscode.TextEditor, text: string): Thenable<boolean> {
    return editor.edit(b => b.insert(editor.selection.active, text));
}

export function replaceSelection(editor: vscode.TextEditor, text: string): Thenable<boolean> {
    return editor.edit(b => b.replace(editor.selection, text));
}

export function getSelectedText(editor: vscode.TextEditor): string | undefined {
    if (editor.selection.isEmpty) { return undefined; }
    return editor.document.getText(editor.selection);
}

/**
 * Creates a validate command: reads the active selection, warns if empty,
 * shows an info or error notification based on the validate function result.
 */
export function createValidateCommand(
    commandId: string,
    noSelectionMsg: string,
    validateFn: (s: string) => boolean,
    validMsg: string,
    invalidMsg: string
): vscode.Disposable {
    return vscode.commands.registerCommand(commandId, () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        const selected = getSelectedText(editor);
        if (!selected) {
            vscode.window.showWarningMessage(noSelectionMsg);
            return;
        }
        if (validateFn(selected)) {
            vscode.window.showInformationMessage(validMsg);
        } else {
            vscode.window.showErrorMessage(invalidMsg);
        }
    });
}
