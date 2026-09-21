import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const manimDir = path.join(root, 'docs', 'manim')
const venvManim = path.join(root, '.manim-venv', 'bin', 'manim')

const diagrams = [
  { page: 'example', source: 'example.py', scene: 'Example', output: 'example.png' },
]

const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--page')) {
  console.error('Usage: pnpm docs:manim [--page <page-slug>]')
  process.exit(1)
}

const selected = args.length ? diagrams.filter((diagram) => diagram.page === args[1]) : diagrams
if (!selected.length) {
  console.error(`No diagrams registered for page: ${args[1]}`)
  process.exit(1)
}

if (!fs.existsSync(venvManim)) {
  console.error(`manim not found at ${venvManim}`)
  console.error('Create it with: uv venv .manim-venv && uv pip install --python .manim-venv/bin/python manim')
  process.exit(1)
}

const missing = ['latex', 'dvisvgm'].filter((command) => spawnSync('which', [command]).status !== 0)
if (missing.length > 0) {
  console.error(`missing on PATH: ${missing.join(', ')}`)
  process.exit(1)
}

const mediaDir = fs.mkdtempSync(path.join(os.tmpdir(), 'halo2-manim-'))
let failed = 0

try {
  for (const { source, scene, output } of selected) {
    const result = spawnSync(
      venvManim,
      [
        'render',
        '-s',
        '--tex_template',
        path.join(manimDir, 'template.tex'),
        '--media_dir',
        mediaDir,
        '-r',
        '2400,1350',
        '-q',
        'm',
        path.join('docs', 'manim', source),
        scene,
      ],
      { cwd: root, stdio: 'pipe', encoding: 'utf8' },
    )

    if (result.status !== 0) {
      failed++
      console.error(`FAIL ${source}\n${result.stderr || result.stdout}`)
      continue
    }

    const imagesDir = path.join(mediaDir, 'images', path.basename(source, '.py'))
    const rendered = fs.readdirSync(imagesDir).find(
      (file) => file.startsWith(`${scene}_ManimCE_v`) && file.endsWith('.png'),
    )

    if (!rendered) {
      failed++
      console.error(`FAIL ${source}: no rendered PNG found in ${imagesDir}`)
      continue
    }

    fs.copyFileSync(path.join(imagesDir, rendered), path.join(manimDir, output))
    console.log(`ok   ${source} -> docs/manim/${output}`)
  }
} finally {
  fs.rmSync(mediaDir, { recursive: true, force: true })
}

if (failed > 0) process.exitCode = 1
