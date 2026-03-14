import { app, BrowserWindow, dialog, ipcMain, Tray, Menu, nativeImage } from 'electron'
import fs from 'fs'
import crypto from 'crypto'
import argon2 from 'argon2'
import { join } from 'path'

// Caminhos dos arquivos de dados do usuário
const DATA_FILE = join(app.getPath('userData'), 'data.vault')
const MASTER_HASH_FILE = join(app.getPath('userData'), 'master.hash')

let mainWindow
let tray

// Configurações de Criptografia
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 16

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256')
}

function encrypt(data, password) {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(password, salt)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return Buffer.concat([salt, iv, tag, encrypted])
}

function decryptFromBinary(buffer, password) {
  try {
    const salt = buffer.subarray(0, 16)
    const iv = buffer.subarray(16, 32)
    const tag = buffer.subarray(32, 48)
    const encrypted = buffer.subarray(48)

    const key = deriveKey(password, salt)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return JSON.parse(decrypted.toString('utf8'))
  } catch (error) {
    console.error('Erro na descriptografia:', error)
    throw new Error('Senha incorreta ou dados corrompidos')
  }
}

ipcMain.handle('check-master-password', async () => {
  return fs.existsSync(MASTER_HASH_FILE)
})

ipcMain.handle('setup-master-password', async (event, password) => {
  const hash = await argon2.hash(password, { type: argon2.argon2id })
  fs.writeFileSync(MASTER_HASH_FILE, hash, 'utf-8')
  const initialData = encrypt([], password)
  fs.writeFileSync(DATA_FILE, initialData)
  return true
})

ipcMain.handle('verify-master-password', async (event, password) => {
  if (!fs.existsSync(MASTER_HASH_FILE)) return false
  const hash = fs.readFileSync(MASTER_HASH_FILE, 'utf-8')
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    return false
  }
})

function createTray() {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(__dirname, '../../resources/PassVault.png')

  const icon = nativeImage.createFromPath(iconPath).resize({})
  tray = new Tray(icon)
  tray.setToolTip('PassVault')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Clique simples no ícone também abre a janela
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

function createWindow() {
  const windowIconPath = process.platform === 'win32'
    ? join(__dirname, '../../resources/PassVault.ico')
    : join(__dirname, '../../resources/PassVault.png')

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    show: false,
    icon: windowIconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('get-passwords', async (event, masterPassword) => {
  if (!fs.existsSync(DATA_FILE)) return []
  try {
    const encryptedData = fs.readFileSync(DATA_FILE)
    return decryptFromBinary(encryptedData, masterPassword)
  } catch (e) {
    return null
  }
})

ipcMain.handle('save-passwords', async (event, { passwords, masterPassword }) => {
  const encrypted = encrypt(passwords, masterPassword)
  fs.writeFileSync(DATA_FILE, encrypted)
  return true
})

ipcMain.handle('export-data', async (event, { data, masterPassword }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar Backup Criptografado',
    defaultPath: join(app.getPath('downloads'), 'vault-backup.enc'),
    filters: [{ name: 'Arquivo Enc', extensions: ['enc'] }]
  })

  if (filePath) {
    const encrypted = encrypt(data, masterPassword)
    fs.writeFileSync(filePath, encrypted)
    return true
  }
  return false
})

ipcMain.handle('import-data', async (event, { fileBase64, oldPassword, currentPassword }) => {
  try {
    const fileBuffer = Buffer.from(fileBase64, 'base64')

    const imported = decryptFromBinary(fileBuffer, oldPassword)

    if (!Array.isArray(imported)) {
      throw new Error('Formato de arquivo inválido')
    }

    let existing = []
    if (fs.existsSync(DATA_FILE)) {
      const existingBuffer = fs.readFileSync(DATA_FILE)
      existing = decryptFromBinary(existingBuffer, currentPassword)
    }

    const merged = [...existing, ...imported]
    const encrypted = encrypt(merged, currentPassword)
    fs.writeFileSync(DATA_FILE, encrypted)

    return merged.length
  } catch (erro) {
    console.error('erro na importação', erro)
    throw new Error(erro.message || 'Arquivo inválido ou senha incorreta')
  }
})

ipcMain.handle('reset-system', async () => {
  try {
    if (fs.existsSync(MASTER_HASH_FILE)) fs.unlinkSync(MASTER_HASH_FILE)
    if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
    return true
  } catch (error) {
    console.error('Erro ao resetar sistema:', error)
    return false
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})