// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('WebOnDemand extension is now active!');

	// Register URI handler
	const uriHandler = vscode.window.registerUriHandler({
		handleUri(uri: vscode.Uri) {
			console.log('Received URI:', uri.toString());
			vscode.window.showInformationMessage(`Received URI: ${uri.toString()}`);
			try {
				const params = new URLSearchParams(uri.query);
				const apiKey = params.get('apiKey');
				const htmlCode = decodeURIComponent(params.get('html') || '');
				const cssCode = decodeURIComponent(params.get('css') || '');
				const jsCode = decodeURIComponent(params.get('js') || '');

				createAndOpenFiles(apiKey, htmlCode, cssCode, jsCode);
			} catch (error) {
				console.error('Error handling the URI:', error);
				vscode.window.showErrorMessage('Error processing the incoming URI');
			}
		}
	});

	context.subscriptions.push(uriHandler);

	// Register commands
	const sendCodeCommand = vscode.commands.registerCommand('extension.sendCode', sendToServer);
	const testUriCommand = vscode.commands.registerCommand('extension.testUri', testUri);

	context.subscriptions.push(sendCodeCommand, testUriCommand);
}

function createAndOpenFiles(apiKey: string | null, htmlCode: string, cssCode: string, jsCode: string) {
	vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'webondemand')).then(() => {
		const folderUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'webondemand');
		openFileWithCode(folderUri, "index.html", htmlCode);
		openFileWithCode(folderUri, "styles.css", cssCode);
		openFileWithCode(folderUri, "script.js", jsCode);
	}, (error: Error) => {
		console.error('Error creating folder:', error);
		vscode.window.showErrorMessage('Error creating folder: ' + error.message);
	});
}

function openFileWithCode(folderUri: vscode.Uri, fileName: string, content: string) {
	const filePath = vscode.Uri.joinPath(folderUri, fileName);
	vscode.workspace.fs.writeFile(filePath, Buffer.from(content)).then(() => {
		vscode.window.showTextDocument(filePath);
	});
}

function sendToServer() {
	const htmlDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.endsWith('index.html'));
	const cssDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.endsWith('styles.css'));
	const jsDoc = vscode.workspace.textDocuments.find(doc => doc.fileName.endsWith('script.js'));

	if (htmlDoc && cssDoc && jsDoc) {
		const apiKey = 'your-api-key'; // You might want to store this securely or prompt the user
		sendCodeToServer(apiKey, htmlDoc.getText(), cssDoc.getText(), jsDoc.getText());
	} else {
		vscode.window.showErrorMessage('Cannot find the required documents.');
	}
}

function sendCodeToServer(apiKey: string, html: string, css: string, js: string) {
	const data = { apiKey, html, css, js };
	fetch('https://your-server.com/api/upload', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(result => vscode.window.showInformationMessage('Upload successful!'))
	.catch(error => vscode.window.showErrorMessage('Error uploading code: ' + error.message));
}

function testUri() {
	const testUri = vscode.Uri.parse('vscode://webondemand.webondemand?apiKey=testKey&html=TestHtml&css=TestCss&js=TestJs');
	vscode.window.showInformationMessage('Test URI command executed. Check if your browser opened.');
	vscode.env.openExternal(testUri);
}

// This method is called when your extension is deactivated
export function deactivate() {}
