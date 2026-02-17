// Renderer: receive XML data from preload-exposed API and coordinate views

let currentXmlData = null;
let currentJsonData = null;
let currentDefaultKeymap = null; // Store default keymap data
let availableDefaultKeymaps = []; // List of available default keymap names
let currentDefaultKeymapIndex = 0; // Currently selected default keymap index
let currentFileInfo = null; // Store directory and file path
let showFormatted = true;
let currentView = 'xml'; // 'xml' or 'hotkeys'

function showXml(data) {
	if (!data) return;
	
	if (data.xml) {
		currentXmlData = data.xml;
		currentJsonData = data.json;
		currentDefaultKeymap = data.defaultKeymap; // Store default keymap
		
		// Store available default keymaps
		if (data.availableDefaultKeymaps) {
			availableDefaultKeymaps = data.availableDefaultKeymaps;
			currentDefaultKeymapIndex = data.currentDefaultKeymapIndex || 0;
			updateDefaultKeymapSelector();
		}
		
		// Store file info
		currentFileInfo = {
			directory: data.aoe3UserDir,
			filePath: data.userFilePath
		};
		
		// Update file info display
		updateFileInfo();
		
		// Display hotkeys view by default
		showHotkeysViewMode();
		
		// Show success status when data is loaded
		if (data.aoe3UserDir) {
			showStatus('Profile loaded successfully from: ' + data.aoe3UserDir);
		}
	} else if (data.json) {
		currentJsonData = data.json;
		const el = document.getElementById('xml-content');
		if (el) {
			el.innerText = JSON.stringify(data.json, null, 2);
		}
	} else if (data.error) {
		const el = document.getElementById('xml-content');
		if (el) {
			el.innerText = 'Error: ' + data.error;
		}
		showStatus('Error: ' + data.error, true);
	}
}

function updateDisplay() {
	if (!currentXmlData) return;
	displayXml(currentXmlData, showFormatted);
}

function toggleView() {
	showFormatted = !showFormatted;
	updateDisplay();
}

// Update the file info display
function updateFileInfo() {
	const fileInfoEl = document.getElementById('file-info');
	const directoryEl = document.getElementById('info-directory');
	const profileEl = document.getElementById('info-profile');
	
	if (!fileInfoEl || !directoryEl || !profileEl) return;
	
	if (currentFileInfo) {
		directoryEl.textContent = currentFileInfo.directory || '-';
		
		// Extract just the filename from the full path
		if (currentFileInfo.filePath) {
			const pathParts = currentFileInfo.filePath.split(/[\\\/]/);
			profileEl.textContent = pathParts[pathParts.length - 1];
		} else {
			profileEl.textContent = '-';
		}
		
		fileInfoEl.style.display = 'block';
	} else {
		fileInfoEl.style.display = 'none';
	}
}

// Update the default keymap selector dropdown
function updateDefaultKeymapSelector() {
	const selector = document.getElementById('default-keymap-selector');
	if (!selector) return;
	
	// Clear existing options
	selector.innerHTML = '';
	
	// Add options for each available default keymap
	availableDefaultKeymaps.forEach((name, index) => {
		const option = document.createElement('option');
		option.value = index;
		option.textContent = name;
		if (index === currentDefaultKeymapIndex) {
			option.selected = true;
		}
		selector.appendChild(option);
	});
	
	// Show the selector container if there are options
	const container = document.getElementById('default-keymap-selector-container');
	if (container) {
		container.style.display = availableDefaultKeymaps.length > 0 ? 'block' : 'none';
	}
}

// Select a new default keymap
async function selectDefaultKeymap() {
	const selector = document.getElementById('default-keymap-selector');
	if (!selector) return;
	
	const newIndex = parseInt(selector.value);
	if (newIndex === currentDefaultKeymapIndex) return;
	
	if (!window.api || !window.api.selectDefaultKeymap) {
		alert('API not available');
		return;
	}
	
	showStatus('Loading default keymap...');
	try {
		const result = await window.api.selectDefaultKeymap(newIndex);
		if (result.success) {
			currentDefaultKeymap = result.defaultKeymap;
			currentDefaultKeymapIndex = result.currentDefaultKeymapIndex;
			
			// Refresh the hotkeys view if currently displayed
			if (currentView === 'hotkeys' && currentJsonData) {
				const filterInput = document.getElementById('hotkeys-filter');
				const filterText = filterInput ? filterInput.value : '';
				showHotkeysView(currentJsonData, currentDefaultKeymap, filterText);
			}
			
			showStatus('Default keymap changed successfully');
		}
	} catch (err) {
		console.error('Error selecting default keymap:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Switch to hotkeys view
function showHotkeysViewMode() {
	if (!currentJsonData) {
		showStatus('No data loaded', true);
		return;
	}
	
	currentView = 'hotkeys';
	
	// Get current filter value
	const filterInput = document.getElementById('hotkeys-filter');
	const filterText = filterInput ? filterInput.value : '';
	
	showHotkeysView(currentJsonData, currentDefaultKeymap, filterText);
	
	// Hide the toggle raw/formatted button in hotkeys view
	const toggleBtn = document.getElementById('toggle-raw');
	if (toggleBtn) {
		toggleBtn.style.display = 'none';
	}
}

// Apply filter to hotkeys view
function applyHotkeysFilter() {
	if (currentView !== 'hotkeys' || !currentJsonData) {
		return;
	}
	
	const filterInput = document.getElementById('hotkeys-filter');
	const filterText = filterInput ? filterInput.value : '';
	
	showHotkeysView(currentJsonData, currentDefaultKeymap, filterText);
}

// Switch to XML view
function showXmlViewMode() {
	if (!currentXmlData) {
		showStatus('No data loaded', true);
		return;
	}
	
	currentView = 'xml';
	showXmlView(currentXmlData, showFormatted);
	
	// Hide filter container when in XML view
	const filterContainer = document.getElementById('hotkeys-filter-container');
	if (filterContainer) {
		filterContainer.style.display = 'none';
	}
	
	// Show the toggle raw/formatted button in XML view
	const toggleBtn = document.getElementById('toggle-raw');
	if (toggleBtn) {
		toggleBtn.style.display = 'inline-block';
	}
}

function copyXml() {
	console.log('copyXml called');
	console.log('currentXmlData exists:', !!currentXmlData);
	console.log('currentXmlData length:', currentXmlData ? currentXmlData.length : 0);
	
	if (!currentXmlData) {
		console.log('No XML data, showing alert');
		alert('No XML data to copy');
		return;
	}
	
	console.log('window.api:', window.api);
	console.log('window.api.writeToClipboard:', window.api ? window.api.writeToClipboard : 'no api');
	
	if (window.api && window.api.writeToClipboard) {
		// Use Electron's clipboard via IPC
		console.log('Using Electron clipboard via IPC');
		window.api.writeToClipboard(currentXmlData)
			.then(() => {
				console.log('Clipboard write succeeded');
				showStatus('XML copied to clipboard!');
			})
			.catch(err => {
				console.error('Clipboard write failed:', err);
				showStatus('Failed to copy: ' + err.message, true);
			});
	} else if (navigator.clipboard) {
		// Fallback to browser clipboard API
		console.log('Using navigator.clipboard');
		navigator.clipboard.writeText(currentXmlData).then(() => {
			console.log('Navigator clipboard write succeeded');
			showStatus('XML copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy:', err);
			showStatus('Failed to copy: ' + err.message, true);
		});
	} else {
		console.log('No clipboard API available');
		showStatus('Clipboard API not available', true);
	}
}

// Request new directory selection
async function selectNewDirectory() {
	if (!window.api || !window.api.selectNewDirectory) {
		alert('API not available');
		return;
	}
	showStatus('Selecting new directory...');
	try {
		await window.api.selectNewDirectory();
	} catch (err) {
		console.error('Error selecting directory:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Request new profile selection
async function selectNewProfile() {
	if (!window.api || !window.api.selectNewProfile) {
		alert('API not available');
		return;
	}
	showStatus('Selecting new profile...');
	try {
		await window.api.selectNewProfile();
	} catch (err) {
		console.error('Error selecting profile:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Load default hotkeys into current profile
async function loadDefaultHotkeys() {
	if (!window.api || !window.api.loadDefaultHotkeys || !window.api.mergeHotkeys) {
		alert('API not available');
		return;
	}
	
	if (!currentXmlData) {
		showStatus('No profile loaded', true);
		return;
	}
	
	// Confirm with user
	if (!confirm('This will replace all hotkeys in your current profile with the selected default keymap. Continue?')) {
		return;
	}
	
	showStatus('Loading default hotkeys...');
	try {
		// First get the default keymap data
		const loadResult = await window.api.loadDefaultHotkeys();
		
		if (loadResult.success && loadResult.needsMerge) {
			// Merge the hotkeys
			const mergeResult = await window.api.mergeHotkeys(currentXmlData);
			
			if (mergeResult.success) {
				// Update current data
				currentXmlData = mergeResult.xml;
				currentJsonData = mergeResult.json;
				
				// Refresh the view
				if (currentView === 'hotkeys') {
					const filterInput = document.getElementById('hotkeys-filter');
					const filterText = filterInput ? filterInput.value : '';
					showHotkeysView(currentJsonData, currentDefaultKeymap, filterText);
				} else {
					showXmlView(currentXmlData, showFormatted);
				}
				
				showStatus('Default hotkeys loaded successfully! Remember to save.');
			}
		}
	} catch (err) {
		console.error('Error loading default hotkeys:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Save profile to file
async function saveProfile() {
	if (!window.api || !window.api.saveProfile) {
		alert('API not available');
		return;
	}
	
	if (!currentXmlData) {
		showStatus('No profile data to save', true);
		return;
	}
	
	// Confirm with user
	if (!confirm('This will overwrite your profile file. Continue?')) {
		return;
	}
	
	showStatus('Saving profile...');
	try {
		const result = await window.api.saveProfile(currentXmlData);
		
		if (result.success) {
			showStatus('Profile saved successfully!');
		}
	} catch (err) {
		console.error('Error saving profile:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Reload profile from disk
async function reloadProfile() {
	if (!window.api || !window.api.reloadProfile) {
		alert('API not available');
		return;
	}
	
	// Confirm with user
	if (!confirm('This will discard any unsaved changes and reload the profile from disk. Continue?')) {
		return;
	}
	
	showStatus('Reloading profile...');
	try {
		const result = await window.api.reloadProfile();
		
		if (result.success) {
			showStatus('Profile reloaded successfully');
		}
	} catch (err) {
		console.error('Error reloading profile:', err);
		showStatus('Error: ' + err.message, true);
	}
}

// Show status message
function showStatus(message, isError = false) {
	console.log('showStatus called with message:', message, 'isError:', isError);
	const statusEl = document.getElementById('status');
	console.log('Status element found:', !!statusEl);
	
	if (statusEl) {
		statusEl.textContent = message;
		statusEl.style.display = 'block';
		statusEl.style.backgroundColor = isError ? '#ffebee' : '#e3f2fd';
		statusEl.style.color = isError ? '#c62828' : '#1565c0';
		console.log('Status element updated and displayed');
		
		// Auto-hide after 3 seconds if not an error
		if (!isError) {
			setTimeout(() => {
				statusEl.style.display = 'none';
				console.log('Status element hidden after timeout');
			}, 3000);
		}
	} else {
		console.error('Status element not found!');
	}
}

// Make functions globally accessible for onclick handlers
window.toggleView = toggleView;
window.copyXml = copyXml;
window.selectNewDirectory = selectNewDirectory;
window.selectNewProfile = selectNewProfile;
window.selectDefaultKeymap = selectDefaultKeymap;
window.showHotkeysViewMode = showHotkeysViewMode;
window.showXmlViewMode = showXmlViewMode;

console.log('Renderer loaded');
console.log('window.api:', window.api);
console.log('window.copyXml:', typeof window.copyXml);
console.log('window.toggleView:', typeof window.toggleView);

// Set up event listeners - use a function that can be called immediately or on DOMContentLoaded
function setupEventListeners() {
	console.log('Setting up event listeners');
	
	const selectDirBtn = document.getElementById('select-directory');
	const selectProfileBtn = document.getElementById('select-profile');
	const toggleBtn = document.getElementById('toggle-raw');
	const copyBtn = document.getElementById('copy-xml');
	const viewHotkeysBtn = document.getElementById('view-hotkeys');
	const viewXmlBtn = document.getElementById('view-raw-xml');
	const loadDefaultBtn = document.getElementById('load-default-hotkeys');
	const saveBtn = document.getElementById('save-profile');
	const reloadBtn = document.getElementById('reload-profile');
	
	console.log('Buttons found:', {
		selectDir: !!selectDirBtn,
		selectProfile: !!selectProfileBtn,
		toggle: !!toggleBtn,
		copy: !!copyBtn,
		viewHotkeys: !!viewHotkeysBtn,
		viewXml: !!viewXmlBtn,
		loadDefault: !!loadDefaultBtn,
		save: !!saveBtn,
		reload: !!reloadBtn
	});
	
	if (selectDirBtn) {
		selectDirBtn.addEventListener('click', () => {
			console.log('Select directory button clicked');
			selectNewDirectory();
		});
	}
	
	if (selectProfileBtn) {
		selectProfileBtn.addEventListener('click', () => {
			console.log('Select profile button clicked');
			selectNewProfile();
		});
	}
	
	if (toggleBtn) {
		toggleBtn.addEventListener('click', () => {
			console.log('Toggle view button clicked');
			toggleView();
		});
	}
	
	if (copyBtn) {
		copyBtn.addEventListener('click', () => {
			console.log('Copy XML button clicked!');
			copyXml();
		});
	}
	
	if (viewHotkeysBtn) {
		viewHotkeysBtn.addEventListener('click', () => {
			console.log('View hotkeys button clicked');
			showHotkeysViewMode();
		});
	}
	
	if (viewXmlBtn) {
		viewXmlBtn.addEventListener('click', () => {
			console.log('View raw XML button clicked');
			showXmlViewMode();
		});
	}
	
	// Default keymap selector
	const defaultKeymapSelector = document.getElementById('default-keymap-selector');
	if (defaultKeymapSelector) {
		defaultKeymapSelector.addEventListener('change', () => {
			console.log('Default keymap selector changed');
			selectDefaultKeymap();
		});
	}
	
	// Hotkeys filter input
	const hotkeysFilter = document.getElementById('hotkeys-filter');
	if (hotkeysFilter) {
		// Use input event for real-time filtering
		hotkeysFilter.addEventListener('input', () => {
			console.log('Hotkeys filter changed');
			applyHotkeysFilter();
		});
	}
	
	// Load default hotkeys button
	if (loadDefaultBtn) {
		loadDefaultBtn.addEventListener('click', () => {
			console.log('Load default hotkeys button clicked');
			loadDefaultHotkeys();
		});
	}
	
	// Save profile button
	if (saveBtn) {
		saveBtn.addEventListener('click', () => {
			console.log('Save profile button clicked');
			saveProfile();
		});
	}
	
	// Reload profile button
	if (reloadBtn) {
		reloadBtn.addEventListener('click', () => {
			console.log('Reload profile button clicked');
			reloadProfile();
		});
	}
}

// Set up event listeners when DOM is ready
if (document.readyState === 'loading') {
	console.log('DOM still loading, waiting for DOMContentLoaded');
	document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
	console.log('DOM already loaded, setting up immediately');
	setupEventListeners();
}

if (window.api && typeof window.api.onXml === 'function') {
	console.log('Setting up XML listener...');
	window.api.onXml((data) => {
		console.log('Received XML data:', data);
		showXml(data)
	})
} else {
	console.warn('API not available: xml events will not be received')
}
