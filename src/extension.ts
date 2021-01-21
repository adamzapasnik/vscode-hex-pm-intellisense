'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HexCompletion } from './HexCompletion';
export function activate(context: vscode.ExtensionContext) {
  const provider = new HexCompletion();
  const selector = [
    { language: 'elixir', pattern: '**/mix.exs', schema: 'file' },
    { language: 'Elixir', pattern: '**/mix.exs', schema: 'file' },
  ];
  const elixirLSExtension = vscode.extensions.getExtension('jakebecker.elixir-ls')
  // TODO: probably can stick only to {
  const packageNameTrigger = elixirLSExtension ? '{' : ':'
  const triggers = [packageNameTrigger,  '"', ' '];
  const hexCompletion = vscode.languages.registerCompletionItemProvider(
    selector,
    provider,
    ...triggers
  );

  context.subscriptions.push(hexCompletion);
}

// this method is called when your extension is deactivated
export function deactivate() {}
