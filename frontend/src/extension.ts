import * as vscode from "vscode";
import axios from "axios";

// 🛠 Function to get all methods in the file using VS Code's built-in symbol provider
async function getAllMethodsInFile(document: vscode.TextDocument): Promise<vscode.SymbolInformation[] | undefined> {
	return await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
		"vscode.executeDocumentSymbolProvider",
		document.uri
	);
}

// 🎯 Function to get the current method where the cursor is
async function getCurrentMethod(): Promise<vscode.SymbolInformation | undefined> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}

	const document = editor.document;
	const position = editor.selection.active;
	const symbols = await getAllMethodsInFile(document);

	if (!symbols) {
		return undefined;
	}

	return symbols.find(symbol => symbol.location.range.contains(position));
}

// 🏗 Dynamic CodeLens Provider that updates when the cursor moves
class DynamicCodeLensProvider implements vscode.CodeLensProvider {
	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		vscode.window.onDidChangeTextEditorSelection(this.updateCodeLens, this);
		vscode.window.onDidChangeActiveTextEditor(this.updateCodeLens, this);
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
			this.codeLenses = []; // No method found → Remove CodeLens
		} else {
			this.codeLenses = [
				new vscode.CodeLens(currentMethod.location.range, {
					title: "💬",
					command: "ai-commenter.commentMethod",
					arguments: [document, currentMethod.location.range]
				})
			];
		}

		this._onDidChangeCodeLenses.fire();
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
