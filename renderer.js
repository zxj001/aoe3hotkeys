// Renderer: receive XML data from preload-exposed API and render it.

let currentXmlData = null;
let currentJsonData = null;
let showFormatted = true;
let currentView = 'xml'; // 'xml' or 'hotkeys'

function formatXml(xml) {
	const PADDING = '  ';
	const reg = /(>)(<)(\/*)/g;
	let formatted = '';
	let pad = 0;
	
	xml = xml.replace(reg, '$1\r\n$2$3');
	const lines = xml.split('\r\n');
	
	for (let line of lines) {
		let indent = 0;
		if (line.match(/.+<\/\w[^>]*>$/)) {
			indent = 0;
		} else if (line.match(/^<\/\w/)) {
			if (pad !== 0) {
				pad -= 1;
			}
		} else if (line.match(/^<\w([^>]*[^\/])?>.*$/)) {
			indent = 1;
		} else {
			indent = 0;
		}
		
		formatted += PADDING.repeat(pad) + line + '\r\n';
		pad += indent;
	}
	
	return formatted.trim();
}

function highlightXml(xml) {
	return xml
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/(&lt;\/?)(\w+)([^&]*?)(&gt;)/g, '<span class="xml-tag">$1$2</span><span class="xml-attr">$3</span><span class="xml-tag">$4</span>')
		.replace(/="([^"]*)"/g, '="<span class="xml-value">$1</span>"')
		.replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>');
}

function showXml(data) {
	const el = document.getElementById('xml-content')
	if (!el) return
	
	if (data && data.xml) {
		currentXmlData = data.xml;
		currentJsonData = data.json; // Store JSON data for hotkeys parsing
		updateDisplay();
		// Show success status when data is loaded
		if (data.aoe3UserDir) {
			showStatus('Profile loaded successfully from: ' + data.aoe3UserDir);
		}
	} else if (data && data.json) {
		currentJsonData = data.json;
		el.innerText = JSON.stringify(data.json, null, 2)
	} else if (data && data.error) {
		el.innerText = 'Error: ' + data.error;
		showStatus('Error: ' + data.error, true);
	} else {
		el.innerText = 'No XML data received.'
	}
}

function updateDisplay() {
	const el = document.getElementById('xml-content');
	if (!el || !currentXmlData) return;
	
	if (showFormatted) {
		const formatted = formatXml(currentXmlData);
		el.innerHTML = highlightXml(formatted);
	} else {
		el.textContent = currentXmlData;
	}
}

function toggleView() {
	showFormatted = !showFormatted;
	updateDisplay();
}

// Parse hotkeys from JSON data
function parseHotkeys() {
	if (!currentJsonData || !currentJsonData.Profile || !currentJsonData.Profile.KeyMapGroups) {
		return null;
	}
	
	const keyMapGroups = currentJsonData.Profile.KeyMapGroups[0];
	if (!keyMapGroups || !keyMapGroups.Group) {
		return null;
	}
	
	return keyMapGroups.Group;
}

// Display hotkeys view
function showHotkeysView() {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	const groups = parseHotkeys();
	
	if (!groups || groups.length === 0) {
		hotkeysContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found in this profile.</div>';
		hotkeysContainer.style.display = 'block';
		xmlContainer.style.display = 'none';
		currentView = 'hotkeys';
		return;
	}
	
	let html = '';
	
	// Process each group
	groups.forEach(group => {
		const groupName = group.$.Name || 'Unnamed Group';
		html += `<div class="hotkey-group">`;
		html += `<div class="hotkey-group-title">${escapeHtml(groupName)}</div>`;
		html += `<table class="hotkey-table">`;
		html += `<thead><tr><th>Action</th><th>Key</th><th>Status</th></tr></thead>`;
		html += `<tbody>`;
		
		// Process keymaps in the group
		if (group.KeyMap && Array.isArray(group.KeyMap)) {
			group.KeyMap.forEach(keymap => {
				const name = keymap.Name ? keymap.Name[0] : 'Unknown';
				const event = keymap.Event ? keymap.Event[0] : '';
				const action = keymap.Action ? keymap.Action[0] : 'bind';
				
				const statusClass = action === 'bind' ? 'hotkey-status-bind' : 'hotkey-status-unbind';
				const statusText = action === 'bind' ? 'Bound' : 'Unbound';
				
				html += `<tr>`;
				html += `<td>${escapeHtml(name)}</td>`;
				html += `<td><span class="hotkey-key">${escapeHtml(event)}</span></td>`;
				html += `<td class="${statusClass}">${statusText}</td>`;
				html += `</tr>`;
			});
		}
		
		html += `</tbody></table></div>`;
	});
	
	hotkeysContainer.innerHTML = html;
	hotkeysContainer.style.display = 'block';
	xmlContainer.style.display = 'none';
	currentView = 'hotkeys';
	console.log('Hotkeys view displayed');
}

// Show XML view
function showXmlView() {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	hotkeysContainer.style.display = 'none';
	xmlContainer.style.display = 'block';
	currentView = 'xml';
	updateDisplay();
	console.log('XML view displayed');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
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
window.showHotkeysView = showHotkeysView;
window.showXmlView = showXmlView;

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
	
	console.log('Buttons found:', {
		selectDir: !!selectDirBtn,
		selectProfile: !!selectProfileBtn,
		toggle: !!toggleBtn,
		copy: !!copyBtn,
		viewHotkeys: !!viewHotkeysBtn,
		viewXml: !!viewXmlBtn
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
			showHotkeysView();
		});
	}
	
	if (viewXmlBtn) {
		viewXmlBtn.addEventListener('click', () => {
			console.log('View raw XML button clicked');
			showXmlView();
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
