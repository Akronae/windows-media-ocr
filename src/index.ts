import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

export const bin = join('assets', 'windows_media_ocr_cli.exe');

export type OcrResultMode = 'json' | 'text';
export type OcrResult = {
  Lines: {
    Text: string;
    Words: {
      BoundingRect: {
        X: number;
        Y: number;
        Width: number;
        Height: number;
        Left: number;
        Top: number;
        Right: number;
        Bottom: number;
        IsEmpty: boolean;
      };
      Text: string;
    }[];
  }[];
  Text: string;
  TextAngle: number | null;
};

export async function ocr(
  file: string,
  {
    language,
    mode,
  }: {
    language?: string;
    mode?: OcrResultMode;
  } = {}
): Promise<OcrResult> {
  const res = await cmd(
    resolve(import.meta.dirname, '..', bin),
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

function cmd(...command: string[]) {
  const p = spawn(command[0], command.slice(1));
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
