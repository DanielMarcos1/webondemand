// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "webondemand" is now active!');

	// Register URI handler
	vscode.window.registerUriHandler({
		handleUri(uri: vscode.Uri) {
			const apiKey = uri.query.split('&')[0].split('=')[1]; // Parse API key
			const htmlCode = decodeURIComponent(uri.query.split('&')[1].split('=')[1]);
			const cssCode = decodeURIComponent(uri.query.split('&')[2].split('=')[1]);
			const jsCode = decodeURIComponent(uri.query.split('&')[3].split('=')[1]);

			// Open each code type in a new editor tab
			const openFileWithCode = (fileName: string, content: string) => {
				const tempUri = vscode.Uri.parse(`untitled:${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath}/${fileName}`);
				vscode.workspace.fs.writeFile(tempUri, Buffer.from(content)).then(() => {
					vscode.workspace.openTextDocument(tempUri).then(doc => {
						vscode.window.showTextDocument(doc);
					});
				});
			};
			openFileWithCode("file.html", htmlCode);
			openFileWithCode("file.css", cssCode);
			openFileWithCode("file.js", jsCode);
		}
	});

	// Function to send the edited code back to the Web On Demand server
    const sendToServer = (apiKey: string, html: string, css: string, js: string) => {
        const data = { apiKey, html, css, js };
        fetch('https://your-server.com/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => vscode.window.showInformationMessage('Upload successful!'))
        .catch(error => vscode.window.showErrorMessage('Error uploading code: ' + error.message));
    };

	const sendCodeCommand = vscode.commands.registerCommand('extension.sendCode', () => {
		const htmlDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.includes('file.html'));
		const cssDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.includes('file.css'));
		const jsDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.includes('file.js'));
	
		if (htmlDoc && cssDoc && jsDoc) {
			sendToServer('your-api-key', htmlDoc.getText(), cssDoc.getText(), jsDoc.getText());
		} else {
			vscode.window.showErrorMessage('Cannot find the required documents.');
		}
	});
	
	context.subscriptions.push(sendCodeCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
