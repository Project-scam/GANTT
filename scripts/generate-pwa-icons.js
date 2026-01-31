/**
 * Genera icone PNG 192x192 e 512x512 da public/vite.svg per il manifest PWA.
 * Eseguito automaticamente prima del build (prebuild).
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const svgPath = path.join(root, 'public', 'vite.svg')
const out192 = path.join(root, 'public', 'icon-192.png')
const out512 = path.join(root, 'public', 'icon-512.png')

async function generate() {
  try {
    await sharp(svgPath, { density: 300 })
      .resize(192, 192)
      .png()
      .toFile(out192)
    console.log('✓ icon-192.png')

    await sharp(svgPath, { density: 300 })
      .resize(512, 512)
      .png()
      .toFile(out512)
    console.log('✓ icon-512.png')
  } catch (err) {
    console.error('Errore generazione icone PWA:', err.message)
    process.exit(1)
  }
}

generate()
