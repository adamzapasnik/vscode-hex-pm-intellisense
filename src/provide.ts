import * as vscode from 'vscode';
import * as hexpm from './hexpm';

const semver = require('semver');

export function providePackageName(
  document: vscode.TextDocument,
  position: vscode.Position
): Thenable<vscode.CompletionItem[] | vscode.CompletionList | undefined> {
  const line = document.lineAt(position.line);
  const packageName = getPackageName(line, position);
  console.warn('pname', packageName)
  // if (!packageName) {
  //   return Promise.resolve([]);
  // }
  // API will return only exact matches if packageName length is < 3
  // https://github.com/hexpm/hexpm/blob/f2e7e946ccf4a402aa26594a6fa412332a7f7c5f/lib/hexpm/repository/package.ex#L335
  if (packageName && packageName.length >= 3) {
    return hexpm
      .getPackages(packageName)
      .then((packages) => {
        console.warn('pck', completionItemsForPackages(packages, position, line))
        return completionItemsForPackages(packages, position, line)
      });
  }

  // return Promise.resolve(undefined)
  return Promise.resolve({
    isIncomplete: true,
    items: [new vscode.CompletionItem(':a', vscode.CompletionItemKind.Module)]
  });
}

export function providePackageVersion(
  document: vscode.TextDocument,
  position: vscode.Position
): Thenable<vscode.CompletionItem[] | vscode.CompletionList> {
  const line = document.lineAt(position.line);
  const packageName = getPackageName(line, position);

  if (!packageName) {
    return Promise.resolve([]);
  }

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
  const regex = /:?[a-zA-Z_]+/;
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
function completionItemsForPackages(packages: any[], position: vscode.Position, line: vscode.TextLine): vscode.CompletionList {
  return {
    isIncomplete: packages.length === 100,
    items: packages.map((pack, index, arr) => {
      const completionItem = new vscode.CompletionItem(
        ":" + pack.name,
        vscode.CompletionItemKind.Module
      )
      // Inspired by https://github.com/szTheory/vsc-hex-lens/blob/6f5caf29a2576952b8b0476d69c4b84d20d21e0a/src/providers/abstractProvider.ts#L49
      completionItem.documentation = new vscode.MarkdownString(
        `${pack.name} (latest: ${pack.latest_stable_version})\n\n${pack.meta.description}\n\n${pack.html_url}`
      )
      completionItem.insertText = pack.name
      completionItem.filterText = pack.name

      return completionItem
  }
    ),
  };
}
//https://github.com/microsoft/vscode/issues/105899
//https://github.com/microsoft/vscode/issues/99504