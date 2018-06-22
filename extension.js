// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const recc = {
	'eslint.enable': true,
	'stylelint.enable': true,
	'css.validate': false,
	'scss.validate': false,
	'prettier.useTabs': true,
	'prettier.semi': true,
	'prettier.singleQuote': true,
	'prettier.eslintIntegration': true,
	'prettier.stylelintIntegration': true,
	'npm-intellisense.importES6': true,
	'npm-intellisense.importQuotes': "'",
	'npm-intellisense.importLinebreak': ';\r\n',
	'npm-intellisense.importDeclarationType': 'const',
	'npm-intellisense.scanDevDependencies': true
};

const SETTING_GLOBAL = 1;
const SETTING_WORKSPACE = 2;
const SETTING_FOLDER = 3;

async function showYesNo(label) {
	let response = await vscode.window.showQuickPick(['Yes', 'No'], {
		placeHolder: label
	});
	return response === 'Yes' ? true : false;
}

async function confirmSetting(editorConfig, { key, value, setting }) {
	let labelPrefix = '';
	let resouce = true;

	switch (setting) {
		case SETTING_FOLDER:
			labelPrefix = 'Update Setting in workspace folder?';
			resouce = null;
			break;
		case SETTING_WORKSPACE:
			labelPrefix = 'Update Workspace Setting?';
			resouce = false;
			break;
		case SETTING_GLOBAL:
		default:
			labelPrefix = 'Update Global Setting?';
			resouce = true;
			break;
	}

	let label = `${labelPrefix}: "${key}"=${JSON.stringify(value)}`;

	let response = await showYesNo(label);
	if (response) {
		await editorConfig.update(key, value, resouce);
	}
}

function getConfiguration() {
	const activeTextEditor = vscode.window.activeTextEditor;
	const resourceUri = activeTextEditor ? activeTextEditor.document.uri : null;
	const resource = resourceUri
		? vscode.workspace.getWorkspaceFolder(resourceUri).uri
		: null;
	const editorConfig = vscode.workspace.getConfiguration('', resource);
	return editorConfig;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log(
	// 	'Congratulations, your extension "ao-vscode-extensionpack" is now active!'
	// );

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		'extension.aoSuggests',
		async function() {
			// The code you place here will be executed every time your command is executed

			// retrieve values
			const editorConfig = getConfiguration();

			let suggestions = [];
			for (const key in recc) {
				if (recc.hasOwnProperty(key)) {
					const value = recc[key];
					const currentValue = editorConfig.get(key);
					if (currentValue !== value) {
						const info = editorConfig.inspect(key);
						
						if (
							typeof info.workspaceFolderValue !== 'undefined' &&
							info.workspaceFolderValue !== value
						) {
							suggestions.push({
								key,
								value,
								setting: SETTING_FOLDER
							});
						} else if (
							typeof info.workspaceValue !== 'undefined' &&
							info.workspaceValue !== value
						) {
							suggestions.push({
								key,
								value,
								setting: SETTING_WORKSPACE
							});
						} else if (info.globalValue !== value) {
							suggestions.push({
								key,
								value,
								setting: SETTING_GLOBAL
							});
						}
					}
				}
			}
			if (suggestions.length) {
				await vscode.window.showInformationMessage('AO Suggests...');
				for (let suggestion of suggestions) {
					await confirmSetting(editorConfig, suggestion);
				}
				await vscode.window.showInformationMessage(
					'... All done. Lets Go!'
				);
			} else {
				await vscode.window.showInformationMessage(
					'AO Suggests... Nothing! Lets Go!'
				);
			}
		}
	);

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
