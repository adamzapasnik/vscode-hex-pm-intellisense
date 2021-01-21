import * as vscode from "vscode";
import {
  shouldProvidePackageVersion,
  shouldProvidePackageName,
} from "./shouldProvide";
import { providePackageName, providePackageVersion } from "./provide";

export class HexCompletion implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[] | vscode.CompletionList | undefined> {
    console.warn("start")
    if (shouldProvidePackageName(document, position)) {
      return providePackageName(document, position);
    } else if (shouldProvidePackageVersion(document, position)) {
      return providePackageVersion(document, position);
    }
    return Promise.resolve([]);
  }
}