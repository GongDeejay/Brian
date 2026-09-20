#!/usr/bin/env node
/**
 * 打包源码为 public/working-memory-training.zip（供站内「下载源码」入口使用）。
 *
 * 与旧的内联 python 命令相比，这里显式排除所有 .env* 文件（仅保留 .env.example），
 * 避免把真实密钥打进一个公网可下载的压缩包。
 *
 * 用法： npm run package:zip
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRel = 'public/working-memory-training.zip';
const outputAbs = path.join(projectRoot, outputRel);

const PYTHON_SCRIPT = String.raw`
import os, sys, zipfile

root, output = sys.argv[1], sys.argv[2]
output_name = os.path.basename(output)

EXCLUDED_DIRS = {'node_modules', 'dist', 'build', '.git', '.github', '.vite',
                 '.turbo', '.cache', '__pycache__'}
EXCLUDED_SUFFIXES = ('.log', '.pyc', '.swp', '.orig', '.rej')

def skip_file(name):
    if name in ('.DS_Store', 'Thumbs.db') or name == output_name:
        return True
    # Never ship real secrets: exclude every .env* file except the example.
    if name.startswith('.env') and name != '.env.example':
        return True
    return name.endswith(EXCLUDED_SUFFIXES)

count = 0
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for filename in filenames:
            if skip_file(filename):
                continue
            full = os.path.join(dirpath, filename)
            zf.write(full, os.path.relpath(full, root))
            count += 1

size_kb = os.path.getsize(output) / 1024
print('已生成 ' + os.path.relpath(output, root))
print('  文件数：%d' % count)
print('  体积：%.1f KB' % size_kb)
print('  已排除：node_modules / dist / .git / 所有 .env*（保留 .env.example）/ 日志与临时文件')
`;

function findPython() {
  for (const candidate of ['python3', 'python']) {
    const probe = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (probe.status === 0) return candidate;
  }
  return null;
}

const python = findPython();
if (!python) {
  console.error('未找到 python3 / python，无法打包。请安装 Python 3 后重试。');
  process.exit(1);
}

const result = spawnSync(python, ['-c', PYTHON_SCRIPT, projectRoot, outputAbs], {
  stdio: 'inherit',
});

if (result.status !== 0) {
  console.error('打包失败。');
  process.exit(result.status ?? 1);
}

if (!existsSync(outputAbs)) {
  console.error(`打包结束但未找到产物：${outputAbs}`);
  process.exit(1);
}
