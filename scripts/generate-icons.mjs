import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import pngToIco from 'png-to-ico'

const resourcesDir = path.join(process.cwd(), 'resources')
const pngPath = path.join(resourcesDir, 'PassVault.png')
const icoPath = path.join(resourcesDir, 'PassVault.ico')

const icoBuffer = await pngToIco(pngPath)
await writeFile(icoPath, icoBuffer)

console.log(`Generated ${path.relative(process.cwd(), icoPath)}`)