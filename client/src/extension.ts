'use strict';

import * as vscode from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind} from "vscode-languageclient";
import * as path from "path";
import {workspace} from "vscode";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    let serverModule = context.asAbsolutePath(
        path.join('server', 'dist', 'server.js')
    );

    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'tua' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/tuaconfig.json')
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'tuaLanguageServer',
        'Tua Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (!client) {
        return undefined;
    }

    return client.stop();
}