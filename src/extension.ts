import * as vscode from 'vscode';

import { register as registerMenu } from './commands/menu.js';
import { register as registerEthGenerateAddress } from './commands/eth/generateAddress.js';
import { register as registerEthChecksumAddress } from './commands/eth/checksumAddress.js';
import { register as registerEthToggleCase } from './commands/eth/toggleCase.js';
import { register as registerEthGenerateTxHash } from './commands/eth/generateTxHash.js';
import { register as registerEthValidateTxHash } from './commands/eth/validateTxHash.js';
import { register as registerBtcGenerateAddress } from './commands/btc/generateAddress.js';
import { register as registerBtcValidateAddress } from './commands/btc/validateAddress.js';
import { register as registerBtcGenerateTxHash } from './commands/btc/generateTxHash.js';
import { register as registerBtcValidateTxHash } from './commands/btc/validateTxHash.js';
import { register as registerSolGenerateAddress } from './commands/sol/generateAddress.js';
import { register as registerSolValidateAddress } from './commands/sol/validateAddress.js';
import { register as registerSolGenerateSignature } from './commands/sol/generateSignature.js';
import { register as registerSolValidateSignature } from './commands/sol/validateSignature.js';

export function activate(context: vscode.ExtensionContext): void {
    registerMenu(context);

    registerEthGenerateAddress(context);
    registerEthChecksumAddress(context);
    registerEthToggleCase(context);
    registerEthGenerateTxHash(context);
    registerEthValidateTxHash(context);

    registerBtcGenerateAddress(context);
    registerBtcValidateAddress(context);
    registerBtcGenerateTxHash(context);
    registerBtcValidateTxHash(context);

    registerSolGenerateAddress(context);
    registerSolValidateAddress(context);
    registerSolGenerateSignature(context);
    registerSolValidateSignature(context);
}

export function deactivate(): void {}
