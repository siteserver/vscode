import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	let timeout: NodeJS.Timer | undefined = undefined;

	const stlDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: { id: 'stl.background' }
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const regExElements = /<stl:[\w]+[^>]*>([\s\S]*?)<\/stl:[\w]+>/gm;
		const regExEntities = /{stl\.[^{}]*}|{stl:[^{}]*}|{content\.[^{}]*}|{channel\.[^{}]*}|{comment\.[^{}]*}|{request\.[^{}]*}|{sql\.[^{}]*}|{user\.[^{}]*}|{navigation\.[^{}]*}|{photo\.[^{}]*}/ig;
		const text = activeEditor.document.getText();
		const stlOptions: vscode.DecorationOptions[] = [];
		let match;
		while (match = regExElements.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Element **' + match[0] + '**' };
			stlOptions.push(decoration);
		}
		while (match = regExEntities.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Entity **' + match[0] + '**' };
			stlOptions.push(decoration);
		}
		activeEditor.setDecorations(stlDecorationType, stlOptions);
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

}

