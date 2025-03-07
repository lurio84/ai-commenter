// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ai-commenter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('ai-commenter.commentMethod', async () => {
		// Obtain file editor
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("There is no file open.");
			return;
		}

		// Obtain selected code
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

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
				editBuilder.insert(selection.start, comment + "\n");
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
