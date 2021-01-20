import * as vscode from 'vscode';
import * as hexpm from './hexpm';

const semver = require('semver');

export function provide(
  document: vscode.TextDocument,
  position: vscode.Position
): Thenable<vscode.CompletionItem[] | vscode.CompletionList> {
  const line = document.lineAt(position.line);
  console.warn('imhere');
  console.warn(line.text);
  const packageName = getPackageName(line, position);

  // .then(console.warn);
  if (!packageName) {
    return Promise.resolve([]);
  }

  console.warn(packageName);
  if (packageName.length >= 3) {
    return hexpm
      .getPackages(packageName)
      .then((res) => completionItemsForPackages(res));
  }

  return Promise.resolve(<vscode.CompletionList>{
    isIncomplete: true,
    items: [],
  });
  return getVersionsForPackage(packageName);
}

function getVersionsForPackage(
  packageName: String
): Promise<vscode.CompletionItem[]> {
  return hexpm
    .getPackage(packageName)
    .then((res) => completionItemsForReleases(res.releases))
    .then(sortCompletionItems)
    .catch((error) => {
      if (error.response.status === 404) {
        return [];
      }

      throw error;
    });
}

function getPackageName(
  line: vscode.TextLine,
  position: vscode.Position
): String {
  const tupleIndex = tupleBeginIndex(line, position);
  const text = line.text.trim().substr(tupleIndex);
  const regex = /:[a-zA-Z_]+/;
  const atoms = text.match(regex) || [''];
  const lastAtom = atoms[atoms.length - 1];
  const packageName = lastAtom.replace(/^:/, '');

  return packageName;
}

function tupleBeginIndex(
  line: vscode.TextLine,
  position: vscode.Position
): number {
  const text = line.text.trim();
  const left = text.substr(0, position.character);
  const tupleBeginIndex = left.lastIndexOf('{');

  return tupleBeginIndex;
}

function sortCompletionItems(
  completionItems: vscode.CompletionItem[]
): vscode.CompletionItem[] {
  // descending sort using semver: most recent version first
  const sorted = completionItems.sort((a, b) =>
    semver.rcompare(a.label, b.label)
  );
  // comply with js lexicographic sorting as vscode does not allow alternative sorting
  // maintain sort using 0-9 prefixed with z for each place value
  sorted.forEach(
    (item, idx) =>
      (item.sortText = `${'z'.repeat(Math.trunc(idx / 10))}${idx % 10}`)
  );

  return sorted;
}

function completionItemsForReleases(releases: any[]): vscode.CompletionItem[] {
  return releases.map((rel, index, arr) => {
    const completionItem = new vscode.CompletionItem(
      rel.version,
      vscode.CompletionItemKind.Property
    );
    return completionItem;
  });
}

// TODO: isIncomplete
// TODO: pewnie powinny byc dwa osobne providery czy cos
function completionItemsForPackages(packages: any[]): vscode.CompletionList {
  return {
    isIncomplete: packages.length === 100,
    items: packages.map((rel, index, arr) => {
      const completionItem = new vscode.CompletionItem(
        rel.name,
        vscode.CompletionItemKind.Property
      );
      return completionItem;
    }),
  };
}
