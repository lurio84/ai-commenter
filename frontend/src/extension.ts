// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// Regulars expresions to detect methods according to programming language
const methodPatterns: Record<string, RegExp> = {
	"javascript": /(?:function|const|let|var|async)?\s*\w+\s*\(.*\)\s*{/g,
	"typescript": /(?:public|private|protected|static)?\s*\w+\s*\(.*\)\s*{/g,
	"java": /(public|private|protected|static)?\s*\w+\s*\(.*\)\s*{/g,
	"python": /def\s+\w+\(.*\):/g
};

const decorationType = vscode.window.createTextEditorDecorationType({
	gutterIconPath: vscode.Uri.file(__dirname + '/icon.png'),
	gutterIconSize: 'auto'
});

// Function to detect methods
function detectMethods(editor: vscode.TextEditor) {
	const languageId = editor.document.languageId;
	const pattern = methodPatterns[languageId];

	if (!pattern) return [];

	const text = editor.document.getText();
	const matches = [];

	let match;
	while ((match = pattern.exec(text)) !== null) {
		const startPos = editor.document.positionAt(match.index);
		matches.push(new vscode.Range(startPos, startPos));
	}

	return matches;
}

// Function to update the decorations (icon)
function updateDecorations(editor: vscode.TextEditor) {
	const methodRanges = detectMethods(editor);
	editor.setDecorations(decorationType, methodRanges);
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Logic to change icon decoration
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) updateDecorations(editor);
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			updateDecorations(editor);
		}
	}, null, context.subscriptions);

	// Add funcionality when user click on icon
	vscode.languages.registerCodeLensProvider("*", {
		provideCodeLenses(document, token) {
			const methodRanges = detectMethods(vscode.window.activeTextEditor!);
			return methodRanges.map(range => new vscode.CodeLens(range, {
				title: "💬 Comentar",
				command: "ai-commenter.commentMethod",
				arguments: [document, range]
			}));
		}
	});

	let disposable = vscode.commands.registerCommand('ai-commenter.commentMethod', async (document: vscode.TextDocument, range: vscode.Range) => {
		// Obtain file editor
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("There is no file open.");
			return;
		}

		if (!range) {
			vscode.window.showErrorMessage("No se pudo determinar el rango del método.");
			return;
		}

		// Obtain selected code
		const selectedText = editor.document.getText(range);
		if (!selectedText) {
			vscode.window.showErrorMessage("Please select a method to comment");
			return;
		}

		// Obtain programming language from the file
		const languageId = editor.document.languageId; // ej: "javascript", "java", "python"

		// Define the default language (you can change it anytime)
		const config = vscode.workspace.getConfiguration("ai-commenter");
		const defaultLanguage = config.get<string>("defaultLanguage", "en");

		try {
			// Call to the backend
			const response = await axios.post("http://localhost:8080/api/comment", { // CAMBIAR POR URL AL SERVIDOR
				code: selectedText,
				description: "",
				codeLanguage: languageId,
				userLanguage: defaultLanguage
			});

			// Recive the comment from the backend
			const comment = response.data.commentedCode;
			console.log("Response: ", response.data);

			if (!comment) {
				vscode.window.showErrorMessage("No se recibió un comentario válido desde la API.");
			}

			// Apply the comment in the selected code
			editor.edit(editBuilder => {
				editBuilder.insert(range.start, comment + "\n");
			});

			vscode.window.showInformationMessage("Comment successfully added.");
		} catch (error) {
			vscode.window.showErrorMessage("Error connecting to the API.");
			console.error(error);
		}
	});

	let changeLangCommand = vscode.commands.registerCommand('ai-commenter.setCommentLanguage', async () => {
		const languages = ["en", "es", "fr", "de", "it", "pt"];
		const selectedLang = await vscode.window.showQuickPick(languages, {
			placeHolder: "Select the language for comments."
		});

		if (selectedLang) {
			await vscode.workspace.getConfiguration("ai-commenter").update("defaultLanguage", selectedLang, true);
			vscode.window.showInformationMessage("Language changed to ${selectedLang}");
		}
	});
	context.subscriptions.push(changeLangCommand);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
