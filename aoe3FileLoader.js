// Module for loading Age of Empires 3 user profile XML files
const { dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const xml2js = require('xml2js')
const homedir = require('os').homedir()

/**
 * Check if a file path has an XML extension
 */
function isXmlFile(filePath) {
  return path.extname(filePath).toLowerCase() === ".xml"
}

/**
 * Find or prompt user to select the AOE3 Users3 directory
 * @param {BrowserWindow} parentWindow - The parent window for dialogs
 * @returns {string|null} The selected directory path or null if cancelled
 */
function selectAoe3Directory(parentWindow) {
  const DEFAULT_AOE3_USER_DIR = path.join(homedir, "Documents/My Games/Age of Empires 3/Users3")
  console.log('Default AOE3 directory:', DEFAULT_AOE3_USER_DIR)
  
  try {
    if (fs.existsSync(DEFAULT_AOE3_USER_DIR)) {
      console.log("Age of Empires 3 user directory exists.")
      return DEFAULT_AOE3_USER_DIR
    } else {
      console.log("Directory does not exist.")
      return promptForDirectory(parentWindow)
    }
  } catch(e) {
    console.log("An error occurred: " + e.message)
    return promptForDirectory(parentWindow)
  }
}

/**
 * Prompt user to select a directory
 * @param {BrowserWindow} parentWindow - The parent window for the dialog
 * @returns {string|null} The selected directory path or null if cancelled
 */
function promptForDirectory(parentWindow) {
  const result = dialog.showOpenDialogSync(parentWindow, {
    title: 'Select Age of Empires 3 Users3 Directory',
    defaultPath: homedir,
    properties: ['openDirectory']
  })
  
  if (result && result.length > 0) {
    console.log("User selected directory: " + result[0])
    return result[0]
  } else {
    console.log("User cancelled directory selection.")
    return null
  }
}

/**
 * Find all XML files in a directory
 * @param {string} directoryPath - The directory to search
 * @returns {string[]} Array of full paths to XML files
 */
function findXmlFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath)
  const xmlFiles = []
  
  for (let filePath of files) {
    if (isXmlFile(filePath)) {
      xmlFiles.push(path.join(directoryPath, filePath))
      console.log("XML file found: " + filePath)
    }
  }
  
  return xmlFiles
}

/**
 * Select which XML file to use (prompt if multiple)
 * @param {BrowserWindow} parentWindow - The parent window for dialogs
 * @param {string[]} xmlFiles - Array of XML file paths
 * @param {string} defaultPath - Default directory path for dialog
 * @returns {string|null} The selected file path or null if none available
 */
function selectXmlFile(parentWindow, xmlFiles, defaultPath) {
  if (xmlFiles.length === 0) {
    console.log("Error, no user files. Please play Age of Empires 3 at least once.")
    return null
  }
  
  if (xmlFiles.length > 1) {
    const result = dialog.showOpenDialogSync(parentWindow, {
      title: 'Select User Profile XML File',
      defaultPath: defaultPath,
      properties: ['openFile'],
      filters: [{ name: 'XML Files', extensions: ['xml'] }]
    })
    
    if (result && result.length > 0) {
      console.log("User selected file: " + result[0])
      return result[0]
    } else {
      console.log("User cancelled file selection. Using first file.")
      return xmlFiles[0]
    }
  } else {
    return xmlFiles[0]
  }
}

/**
 * Always prompt user to select an XML file
 * @param {BrowserWindow} parentWindow - The parent window for the dialog
 * @param {string} defaultPath - Default directory path for dialog
 * @returns {string|null} The selected file path or null if cancelled
 */
function promptForXmlFile(parentWindow, defaultPath) {
  const result = dialog.showOpenDialogSync(parentWindow, {
    title: 'Select User Profile XML File',
    defaultPath: defaultPath || homedir,
    properties: ['openFile'],
    filters: [{ name: 'XML Files', extensions: ['xml'] }]
  })
  
  if (result && result.length > 0) {
    console.log("User selected file: " + result[0])
    return result[0]
  } else {
    console.log("User cancelled file selection.")
    return null
  }
}

/**
 * Read and parse an AOE3 user profile XML file
 * @param {string} filePath - Path to the XML file
 * @returns {Promise<{xml: string, json: object, error?: string}>}
 */
function parseXmlFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log('Reading file:', filePath)
    
    try {
      // The user profile XML file is UTF-16 encoded
      const userProfileData = fs.readFileSync(filePath, "UCS-2")
      const parser = new xml2js.Parser()
      
      parser.parseString(userProfileData, function (err, result) {
        if (err) {
          console.error('XML parse error', err)
          resolve({ xml: userProfileData, json: null, error: err.message })
        } else {
          console.dir(result)
          resolve({ xml: userProfileData, json: result })
        }
      })
    } catch (err) {
      console.error('File read error:', err)
      reject(err)
    }
  })
}

/**
 * Main function to load AOE3 profile data
 * @param {BrowserWindow} parentWindow - The parent window for dialogs
 * @returns {Promise<object>} Object containing directory, files, xml, and json data
 */
async function loadAoe3Profile(parentWindow) {
  // Step 1: Get the directory
  const aoe3UserDir = selectAoe3Directory(parentWindow)
  if (!aoe3UserDir) {
    throw new Error('No directory selected')
  }
  
  // Step 2: Find XML files
  const xmlFiles = findXmlFiles(aoe3UserDir)
  if (xmlFiles.length === 0) {
    throw new Error('No XML files found in directory')
  }
  
  // Step 3: Select which file to use
  const userFilePath = selectXmlFile(parentWindow, xmlFiles, aoe3UserDir)
  if (!userFilePath) {
    throw new Error('No XML file selected')
  }
  
  // Step 4: Parse the selected file
  const parseResult = await parseXmlFile(userFilePath)
  
  // Step 5: Return all the data
  return {
    aoe3UserDir: aoe3UserDir,
    userFilePath: userFilePath,
    userFiles: fs.readdirSync(aoe3UserDir),
    ...parseResult
  }
}

module.exports = {
  loadAoe3Profile,
  selectAoe3Directory,
  promptForDirectory,
  findXmlFiles,
  selectXmlFile,
  promptForXmlFile,
  parseXmlFile,
  isXmlFile
}
