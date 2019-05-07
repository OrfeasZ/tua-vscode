import {
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    InitializeParams,
    ProposedFeatures,
    TextDocuments,
} from "vscode-languageserver";

import {Analyzer} from "tua/dist/parser/analyzer";

import {ErrorSeverity} from 'tua/dist/util/analysisError';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

connection.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
        }
    };
});

connection.onInitialized(() => {
});

const mapSeverity = (severity: ErrorSeverity): DiagnosticSeverity => {
    switch (severity) {
        case ErrorSeverity.INFO:
            return DiagnosticSeverity.Information;

        case ErrorSeverity.WARNING:
            return DiagnosticSeverity.Warning;

        case ErrorSeverity.ERROR:
        case ErrorSeverity.FATAL:
        default:
            return DiagnosticSeverity.Error;
    }
};


// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    const code = change.document.getText();
    const errors = Analyzer.analyze(code);

    const diagnostics: Diagnostic[] = [];

    for (const error of errors) {
        const diagnostic: Diagnostic = {
            severity: mapSeverity(error.error.severity),
            range: {
                start: change.document.positionAt(error.indexStart),
                end: change.document.positionAt(error.indexEnd)
            },
            message: error.error.message,
            code: error.error.code,
            source: 'tua'
        };

        diagnostics.push(diagnostic);
    }

    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
