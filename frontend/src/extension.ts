import * as vscode from 'vscode';
import axios from 'axios';


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "ai-commenter" is now active!');

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
			// Show progress notification while calling the API
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification, // Bottom-right corner
					title: "Generating AI-powered comment...",
					cancellable: false // Cannot be canceled
				},
				async (progress) => {
					progress.report({ message: "Processing request..." });

					// Call the backend
					const response = await axios.post("http://localhost:8080/api/comment", { // CHANGE TO SERVER URL
						code: selectedText,
						description: "",
						codeLanguage: languageId,
						userLanguage: defaultLanguage
					});

					// Receive the comment from the backend
					const comment = response.data.commentedCode;
					console.log("Response: ", response.data);

					if (!comment) {
						vscode.window.showErrorMessage("No valid comment received from the API.");
						return;
					}

					// Apply the comment in the selected code
					editor.edit(editBuilder => {
						editBuilder.insert(selection.start, comment + "\n");
					});

					vscode.window.showInformationMessage("Comment successfully added.");
				}
			);
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