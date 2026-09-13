import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Commands are intentionally run from the repository root (npm guarantees this
// for package scripts). This remains correct for both src/ and compiled dist/.
export const projectRoot = path.resolve(process.cwd());

export async function readRequirement(id: string): Promise<string> {
  return readFile(path.join(projectRoot, 'requirements', `${id}.md`), 'utf8');
}

export async function writeJson(relativePath: string, value: unknown): Promise<void> {
  const target = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function writeText(relativePath: string, value: string): Promise<void> {
  const target = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, value, 'utf8');
}
