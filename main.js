// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const { dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const xml2js = require('xml2js')
const homedir = require('os').homedir();


// const remote = require('remote'); // Load remote compnent that contains the dialog dependency
// const dialog = remote.require('dialog'); // Load the dialogs component of the OS
// const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

function isXmlFile(filePath) {
  return path.extname(filePath).toLowerCase() == ".xml";
}

function isUserProfile(xmlObject) {

}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Load hotkeyfile
  const DEFAULT_AOE3_USER_DIR = path.join(homedir, "Documents/My Games/Age of Empires 3/Users3")
  console.log(DEFAULT_AOE3_USER_DIR)
  let aoe3UserDir = DEFAULT_AOE3_USER_DIR

  try {
    if (fs.existsSync(DEFAULT_AOE3_USER_DIR)) {
      console.log("Age of Empires 3 user directory exists.")
    } else {
      console.log("Directory does not exist.")
      // TODO prompt user
    }
  } catch(e) {
    console.log("An error occurred.")
    // TODO prompt user
  }

  let userFiles = fs.readdirSync(aoe3UserDir)
  let xmlFiles = []
  for (let filePath of userFiles) {
    if (isXmlFile(filePath)) {
      xmlFiles.push(path.join(aoe3UserDir, filePath))
      console.log("XML file found: " + filePath)
    }
  }

  // TODO allow user to select if it's ambiguous which file to pick
  if (xmlFiles.length == 0) {
    console.log("Error, not user files. Please play Age of Empires 3 at least once.")
    return;
  }

  // Parse the XML
  let userFilePath = xmlFiles[0];
  let parser = new xml2js.Parser();
  console.log(userFilePath)

  // The user profile XML file is UTf-16 encoded
  let userProfileData = fs.readFileSync(userFilePath, "UCS-2")
  console.log(userProfileData)
  parser.parseString(userProfileData, function (err, result) {
      if (err) {
        console.error('XML parse error', err)
      } else {
        console.dir(result);
      }
      // Send raw XML text and parsed JSON to renderer for display
      try {
        mainWindow.webContents.send('xml-data', { xml: userProfileData, json: result })
      } catch (sendErr) {
        console.error('Failed to send xml-data to renderer', sendErr)
      }
      console.log('Done');
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

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