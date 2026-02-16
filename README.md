# Age of Empires 3 Hotkeys Editor

An Electron application for viewing and managing Age of Empires 3 hotkey configurations.

## Features
- Load and display Age of Empires 3 user profile XML files
- View hotkeys in an organized table format grouped by category
- Toggle between raw XML view and formatted hotkeys view
- Copy XML to clipboard
- Select custom AoE3 directory and profile files

## File Structure

### Main Application Files
- `package.json` - Points to the app's main file and lists its details and dependencies
- `main.js` - Main process: window creation, IPC handlers, directory tracking
- `preload.js` - Secure IPC bridge exposing APIs to renderer
- `index.html` - Main UI structure and styling

### Renderer Files
- `renderer.js` - Orchestrates views, handles IPC communication, manages state
- `view/xmlView.js` - XML formatting and syntax highlighting functionality
- `view/hotkeysView.js` - Hotkey parsing and table rendering functionality
- `aoe3FileLoader.js` - File system operations for loading AoE3 profiles

## Development Roadmap

**Current Features:**
- ✅ Load AoE3 profile XML files
- ✅ Display raw XML with syntax highlighting
- ✅ Display hotkeys in organized table format
- ✅ Toggle between XML and hotkeys views
- ✅ Directory/profile selection dialogs
- ✅ Clipboard functionality

**MVP Goals:**
* Searchable hotkeys
* Conflict detection (show duplicate key bindings)
* Change tracking (show modified hotkeys)
* Unsaved changes warning

# General Steps
1. look for Age of Empires 3 installation
2. Load user profile. If not found, warn user to create a new profile
3. Let user select profile
4. show hotkeys page

**MVP**

* searchable hot keys
* shows conflicts
* shows changes
* shows unsaved changes

# electron-quick-start

**Clone and run for a quick way to see Electron in action.**

This is a minimal Electron application based on the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start) within the Electron documentation.

**Use this app along with the [Electron API Demos](https://electronjs.org/#get-started) app for API code examples to help you get started.**

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start).

## Prerequisites
1. Install nvm
2. Install npm

## To Use
To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Resources for Learning Electron

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electronjs.org/community#boilerplates](https://electronjs.org/community#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
