import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

function cmd(...command: string[]) {
  let p = spawn(command[0], command.slice(1));
  const stdout: string[] = [];
  const stderr: string[] = [];
  return new Promise<{ stdout: string; stderr: string; code: number | null }>(
    (res) => {
      p.stdout.on('data', (x) => {
        stdout.push(x.toString());
      });
      p.stderr.on('data', (x) => {
        stderr.push(x.toString());
      });
      p.on('exit', (code) => {
        res({ stdout: stdout.join(''), stderr: stderr.join(''), code });
      });
    }
  );
}

export async function ocr(
  file: string,
  {
    language,
    mode,
  }: {
    language?: string;
    mode?: OcrResultMode;
  } = {}
) {
  const res = await cmd(
    resolve(import.meta.dirname, '..', 'assets', 'windows_media_ocr_cli.exe'),
    ...(language ? ['--language', language] : []),
    ...(mode ? ['--mode', mode] : []),
    '--file',
    file
  );

  if (res.stderr) {
    throw new Error(res.stderr);
  } else {
    return JSON.parse(res.stdout);
  }
}

export type OcrResultMode = 'json' | 'text';
