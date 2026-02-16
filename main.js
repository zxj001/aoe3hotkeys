// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { loadAoe3Profile, selectAoe3Directory, findXmlFiles, selectXmlFile, parseXmlFile } = require('./aoe3FileLoader')

let mainWindow = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Wait for the window to finish loading before loading XML
  mainWindow.webContents.on('did-finish-load', () => {
    loadAndSendXml(mainWindow);
  });

  // Open the DevTools for debugging
  // mainWindow.webContents.openDevTools()
}

async function loadAndSendXml(mainWindow) {
  try {
    console.log('Loading AOE3 profile...')
    const profileData = await loadAoe3Profile(mainWindow)
    
    // Prepare data to send to renderer
    const props = {
      aoe3UserDir: profileData.aoe3UserDir,
      userFiles: profileData.userFiles,
      xml: profileData.xml,
      json: profileData.json,
      error: profileData.error
    }
    
    // Send to renderer
    console.log('Sending XML data to renderer...')
    mainWindow.webContents.send('xml-data', props)
    console.log('XML data sent successfully')
  } catch (err) {
    console.error('Failed to load AOE3 profile:', err.message)
    // Send error to renderer
    mainWindow.webContents.send('xml-data', {
      error: err.message,
      xml: null,
      json: null
    })
  }
}

// IPC Handler: Select a new AOE3 directory and reload
ipcMain.handle('select-new-directory', async (event) => {
  try {
    console.log('User requested new directory selection')
    if (!mainWindow) {
      throw new Error('Main window not available')
    }
    
    // Prompt for new directory
    const newDir = selectAoe3Directory(mainWindow)
    if (!newDir) {
      throw new Error('No directory selected')
    }
    
    // Find XML files in new directory
    const xmlFiles = findXmlFiles(newDir)
    if (xmlFiles.length === 0) {
      throw new Error('No XML files found in selected directory')
    }
    
    // Select file
    const selectedFile = selectXmlFile(mainWindow, xmlFiles, newDir)
    if (!selectedFile) {
      throw new Error('No file selected')
    }
    
    // Parse and send
    const parseResult = await parseXmlFile(selectedFile)
    const props = {
      aoe3UserDir: newDir,
      userFilePath: selectedFile,
      xml: parseResult.xml,
      json: parseResult.json,
      error: parseResult.error
    }
    
    mainWindow.webContents.send('xml-data', props)
    console.log('New directory loaded successfully')
    return { success: true }
  } catch (err) {
    console.error('Error selecting new directory:', err)
    throw err
  }
})

// IPC Handler: Select a new profile from current directory
ipcMain.handle('select-new-profile', async (event) => {
  try {
    console.log('User requested new profile selection')
    if (!mainWindow) {
      throw new Error('Main window not available')
    }
    
    // Prompt for directory with file selection
    const newDir = selectAoe3Directory(mainWindow)
    if (!newDir) {
      throw new Error('No directory selected')
    }
    
    // Find XML files
    const xmlFiles = findXmlFiles(newDir)
    if (xmlFiles.length === 0) {
      throw new Error('No XML files found')
    }
    
    // Always prompt for file selection
    const selectedFile = selectXmlFile(mainWindow, xmlFiles, newDir)
    if (!selectedFile) {
      throw new Error('No file selected')
    }
    
    // Parse and send
    const parseResult = await parseXmlFile(selectedFile)
    const props = {
      aoe3UserDir: newDir,
      userFilePath: selectedFile,
      xml: parseResult.xml,
      json: parseResult.json,
      error: parseResult.error
    }
    
    mainWindow.webContents.send('xml-data', props)
    console.log('New profile loaded successfully')
    return { success: true }
  } catch (err) {
    console.error('Error selecting new profile:', err)
    throw err
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 1. look for Age of Empires 3 installation
// 2. Load user profile. If not found, warn user to create a new profile
// 3. Let user select profile
// 4. show hotkeys page
// 5. MVP: searchable hot keys
// shows conflicts
// shows changes
// shows unsaved changes