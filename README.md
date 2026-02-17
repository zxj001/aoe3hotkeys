# Age of Empires 3 Hotkeys Editor

An Electron desktop application for viewing, comparing, and managing Age of Empires 3 hotkey configurations.

## Features

### Profile Management
- **Load user profiles** - Open and parse Age of Empires 3 XML profile files
- **Save changes** - Persist modified hotkey configurations back to profile files (UTF-16 encoding)
- **Reload profiles** - Discard unsaved changes and reload from disk
- **Directory selection** - Choose custom AoE3 installation directories

### Hotkey Viewing & Comparison
- **Organized display** - View hotkeys grouped by category in table format
- **Default keymap comparison** - Compare user hotkeys against game defaults side-by-side
- **Multiple default profiles** - Switch between various default keymaps:
  - Game default keymap
  - MrMilos Hotkey Setup profiles (NewProfile, NewProfile2, NewProfile3)
- **Union display** - Shows all hotkeys from both user profile and selected default keymap
- **Real-time filtering** - Search/filter hotkeys by action name or key binding

### Editing & Management
- **Load defaults** - Copy default keymap bindings into your user profile
- **XML view** - Toggle to raw XML view with syntax highlighting
- **Copy to clipboard** - Export XML content for external use

## File Structure

### Main Application Files
- `package.json` - npm configuration, dependencies, and app metadata
- `main.js` - Electron main process: window management, IPC handlers, file path tracking
- `preload.js` - Secure IPC bridge exposing sandboxed APIs to renderer process
- `index.html` - Main UI layout, structure, and styling

### Renderer Files
- `renderer.js` - UI controller: view orchestration, IPC communication, state management
- `view/xmlView.js` - XML formatting and syntax highlighting
- `view/hotkeysView.js` - Hotkey parsing, table rendering, union logic, filtering
- `aoe3FileLoader.js` - File I/O operations for AoE3 profiles and keymaps

### Example Files
- `example/defaultkeymap.xml` - Game default hotkey configuration
- `example/example.xml` - Sample user profile
- `example/MrMilos_Hotkey_Setup/` - Alternative default hotkey profiles

## Prerequisites

1. [Node.js](https://nodejs.org/) (which includes npm)
2. Age of Empires 3 Complete Edition installation (optional - for loading actual profiles)

## Installation & Usage

```bash
# Install dependencies
npm install

# Run the application
npm start
```

## How to Use

1. **Select AoE3 Directory** - Click "Select AoE3 Directory" to choose your Age of Empires 3 installation folder
2. **Load Profile** - Click "Load Profile" to open a user profile XML file
3. **Choose Default Keymap** - Use the dropdown to select which default keymap to compare against
4. **Filter Hotkeys** - Type in the filter box to search for specific hotkeys
5. **Load Defaults** - Click "Load Default Hotkeys" to copy the selected default keymap into your profile
6. **Save Changes** - Click "Save" to write changes to disk
7. **Reload** - Click "Reload" to discard unsaved changes and reload from file

## Technical Details

- **Architecture**: Electron.js (Chromium + Node.js)
- **XML Processing**: xml2js for parsing and building
- **IPC**: Secure inter-process communication via contextBridge
- **Encoding**: UTF-16 (UCS-2) for user profiles, UTF-8 for default keymaps
- **File Format**: Supports both `DefaultKeyMap` and `Profile/KeyMapGroups` XML structures

## Development Roadmap

**Completed:**
- ✅ Load and display AoE3 profile XML files
- ✅ Raw XML view with syntax highlighting
- ✅ Organized hotkey table display
- ✅ Toggle between XML and hotkeys views
- ✅ Default keymap comparison column
- ✅ Multiple default keymap profiles
- ✅ Union display (user + default hotkeys)
- ✅ Real-time hotkey filtering
- ✅ Load default hotkeys into profile
- ✅ Save profile changes
- ✅ Reload profile functionality
- ✅ Clipboard operations

**Future Enhancements:**
- Conflict detection (duplicate key bindings)
- Visual change tracking (modified hotkeys highlighting)
- Unsaved changes warning before exit
- In-app hotkey editing
- Hotkey conflict resolution suggestions

## License

[CC0 1.0 (Public Domain)](LICENSE.md)

[CC0 1.0 (Public Domain)](LICENSE.md)
