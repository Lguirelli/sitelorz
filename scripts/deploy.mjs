// Publica o site: gera docs/, verifica e envia o conteúdo de docs/ para a raiz da branch main
// do repositório remoto (GitHub Pages servindo "/ (root)"). O código-fonte não vai para a main.
// Uso: npm run deploy   (remoto "origin" = https://github.com/Lguirelli/sitelorz)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REMOTE = 'origin', BRANCH = 'main';
const run = (cmd, args, env) => execFileSync(cmd, args, { encoding: 'utf8', env: { ...process.env, ...env } }).trim();
const step = (file) => { const r = spawnSync(process.execPath, [file], { stdio: 'inherit' }); if (r.status) process.exit(r.status); };

step('build.mjs');
step('scripts/check.mjs');

// Árvore do site a partir de docs/, montada num índice temporário (não mexe no seu staging).
const dir = mkdtempSync(join(tmpdir(), 'lorz-deploy-'));
const env = { GIT_INDEX_FILE: join(dir, 'index') };
let tree;
try {
  run('git', ['add', '-A', '-f', 'docs'], env);
  tree = run('git', ['write-tree', '--prefix=docs/'], env);
} finally { rmSync(dir, { recursive: true, force: true }); }

run('git', ['fetch', '--quiet', REMOTE, BRANCH]);
const parent = run('git', ['rev-parse', `${REMOTE}/${BRANCH}`]);
if (run('git', ['rev-parse', `${parent}^{tree}`]) === tree) { console.log('✓ Nada novo para publicar: o site no ar já é igual ao build atual.'); process.exit(0); }

const source = run('git', ['rev-parse', '--short', 'HEAD']);
const dirty = run('git', ['status', '--porcelain', '--', '.', ':!docs']) ? ' (com alterações não commitadas)' : '';
const commit = run('git', ['commit-tree', tree, '-p', parent, '-m', `Publica o site a partir do código ${source}${dirty}`]);
run('git', ['push', REMOTE, `${commit}:refs/heads/${BRANCH}`]);
console.log(`✓ Publicado em ${REMOTE}/${BRANCH} (${commit.slice(0, 7)}). O GitHub Pages atualiza em um ou dois minutos.`);
