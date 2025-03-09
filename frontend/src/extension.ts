import * as vscode from "vscode";
import axios from "axios";

// Function to get all methods in the file using VS Code's built-in symbol provider
async function getAllMethodsInFile(document: vscode.TextDocument): Promise<vscode.SymbolInformation[] | undefined> {
	return await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
		"vscode.executeDocumentSymbolProvider",
		document.uri
	);
}

// Function to get the current method where the cursor is
async function getCurrentMethod(): Promise<vscode.DocumentSymbol | undefined> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}

	const document = editor.document;
	const position = editor.selection.active;

	// Use `executeDocumentSymbolProvider` to get the document structure
	const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
		"vscode.executeDocumentSymbolProvider",
		document.uri
	);

	if (!symbols) {
		console.error("❌ No symbols found in the file.");
		return undefined;
	}

	// Filter only methods (ignore classes, variables, etc.)
	const methods = symbols.flatMap(symbol =>
		symbol.kind === vscode.SymbolKind.Method ? [symbol] : symbol.children.filter(child => child.kind === vscode.SymbolKind.Method)
	);

	// Find the method where the cursor is
	const currentMethod = methods.find(method => method.range.contains(position));

	return currentMethod;
}


// Dynamic CodeLens Provider that updates when the cursor moves
class DynamicCodeLensProvider implements vscode.CodeLensProvider {
	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		vscode.window.onDidChangeTextEditorSelection(() => this.updateCodeLens(), this);
		vscode.window.onDidChangeActiveTextEditor(() => this.updateCodeLens(), this);
	}

	async updateCodeLens() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			this.codeLenses = [];
			this._onDidChangeCodeLenses.fire();
			return;
		}

		const document = editor.document;
		const currentMethod = await getCurrentMethod();

		if (!currentMethod) {
			this.codeLenses = [];
		} else {
			// Place CodeLens exactly one line above the method start position
			const methodStartLine = currentMethod.range.start.line;
			const codeLensPosition = new vscode.Position(Math.max(0, methodStartLine - 0), 0);

			this.codeLenses = [
				new vscode.CodeLens(new vscode.Range(codeLensPosition, codeLensPosition), {
					title: "💭",
					command: "ai-commenter.commentMethod",
					arguments: [document, currentMethod.range]
				})
			];
		}

		this._onDidChangeCodeLenses.fire(); // 🔹 Force UI refresh
	}

	provideCodeLenses(): vscode.CodeLens[] {
		return this.codeLenses;
	}
}

// 🚀 Activating the Extension
export function activate(context: vscode.ExtensionContext) {
	console.log("AI Commenter Extension activated.");

	const codeLensProvider = new DynamicCodeLensProvider();
	context.subscriptions.push(vscode.languages.registerCodeLensProvider("*", codeLensProvider));

	let disposable = vscode.commands.registerCommand(
		"ai-commenter.commentMethod",
		async (document?: vscode.TextDocument, range?: vscode.Range) => {
			if (!document || !range) {
				return;
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active file open.");
				return;
			}

			const selectedText = document.getText(range);
			if (!selectedText) {
				vscode.window.showErrorMessage("No method detected.");
				return;
			}

			const languageId = document.languageId;
			const config = vscode.workspace.getConfiguration("ai-commenter");
			const defaultLanguage = config.get<string>("defaultLanguage", "en");

			try {
				await vscode.window.withProgress(
					{
						location: vscode.ProgressLocation.Notification,
						title: "Generating AI-powered comment...",
						cancellable: false
					},
					async () => {
						const response = await axios.post("http://localhost:8080/api/comment", {
							code: selectedText,
							description: "",
							codeLanguage: languageId,
							userLanguage: defaultLanguage
						});

						const comment = response.data.commentedCode;
						if (!comment) {
							vscode.window.showErrorMessage("No valid comment received from the API.");
							return;
						}

						await editor.edit(editBuilder => {
							editBuilder.insert(range.start, comment + "\n");
						});

						vscode.window.showInformationMessage("Comment successfully added.");
					}
				);
			} catch (error) {
				vscode.window.showErrorMessage("Error connecting to the API.");
				console.error(error);
			}
		}
	);

	context.subscriptions.push(disposable);
}

// 🛑 Deactivating the Extension
export function deactivate() {
	console.log("AI Commenter Extension deactivated.");
}
