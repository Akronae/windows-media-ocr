import { bin } from '@/src';
import * as esbuild from 'esbuild';
import { cp, rm } from 'fs/promises';
import { join, relative } from 'path';
import { replaceTscAliasPaths } from 'tsc-alias';
import * as ts from 'typescript';

if (import.meta.url.startsWith('file:')) {
  build(process.argv);
}

export async function build(args: string[]): Promise<void> {
  const onlytypes = args.includes('--only-types');
  console.time('Build time');
  const config = parseTsconfig('tsconfig.json');
  const { fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    process.cwd()
  );
  if (!config.compilerOptions?.rootDir) {
    throw new Error(
      'In order to have consistent builds, please define `tsconfig.json#compilerOptions.rootDir`'
    );
  }
  const outdir = config.compilerOptions?.outDir ?? '';
  console.log({ outdir });
  await rm(outdir, { recursive: true, force: true });
  if (!onlytypes) {
    const entrypoints = Object.fromEntries(
      fileNames
        .map((x) => relative(process.cwd(), x).replace(/\.ts$/, ''))
        .map((x) => [x, x])
    );
    await esbuild.build({
      entryPoints: entrypoints,
      outdir,
      format: 'esm',
      platform: 'neutral',
      outExtension: { '.js': '.mjs' },
      bundle: false,
      minify: false,
      treeShaking: true,
      loader: { '.node': 'binary' },
      packages: 'external',
    });
    await esbuild.build({
      entryPoints: entrypoints,
      outdir,
      format: 'cjs',
      platform: 'node',
      outExtension: { '.js': '.cjs' },
      bundle: false,
      minify: false,
      treeShaking: true,
      loader: { '.node': 'binary' },
      packages: 'external',
      banner: {
        js: "globalThis.__url ??= require('url').pathToFileURL(__filename).toString()",
      },
      define: {
        'import.meta.filename': '__filename',
        'import.meta.dirname': '__dirname',
        'import.meta.url': '__url',
      },
    });
  }
  compile(fileNames, {
    ...(config.compilerOptions ?? {}),
    declaration: true,
    emitDeclarationOnly: true,
  });
  await replaceTscAliasPaths({
    resolveFullPaths: true,
    resolveFullExtension: '.mjs',
    fileExtensions: { inputGlob: '{js,mjs}', outputCheck: ['mjs', 'json'] },
  });
  await replaceTscAliasPaths({
    resolveFullPaths: true,
    resolveFullExtension: '.cjs',
    fileExtensions: { inputGlob: '{js,cjs}', outputCheck: ['cjs', 'json'] },
  });
  await replaceTscAliasPaths({ resolveFullPaths: true });
  await cp(bin, join(outdir, bin), {
    recursive: true,
  });
  console.timeEnd('Build time');
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    }
  });
}

export function parseTsconfig(filepath: string): {
  compilerOptions?: ts.CompilerOptions;
  include?: string[];
  exclude?: string[];
  [key: string]: any;
} {
  let compopts = {};
  const config = ts.readConfigFile(filepath, ts.sys.readFile).config;
  if (config.extends) {
    const rqrpath = require.resolve(config.extends);
    compopts = parseTsconfig(rqrpath);
  }

  return {
    ...config,
    compilerOptions: ts.convertCompilerOptionsFromJson(
      { ...compopts, ...config.compilerOptions },
      process.cwd()
    ).options,
  };
}
