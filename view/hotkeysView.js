// Hotkeys View: Parse and display hotkey mappings in a table format

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Parse default keymap and create a lookup map by action name
 * @param {Object} defaultKeymapData - Parsed default keymap XML as JSON
 * @returns {Map} Map of action name to default key
 */
function parseDefaultKeymap(defaultKeymapData) {
	const defaultMap = new Map();
	
	if (!defaultKeymapData || !defaultKeymapData.DefaultKeyMap || !defaultKeymapData.DefaultKeyMap.KeyMapGroup) {
		return defaultMap;
	}
	
	const groups = defaultKeymapData.DefaultKeyMap.KeyMapGroup;
	groups.forEach(group => {
		if (group.KeyMapData && Array.isArray(group.KeyMapData)) {
			group.KeyMapData.forEach(keyData => {
				const name = keyData.Name ? keyData.Name[0] : null;
				const event = keyData.Event ? keyData.Event[0] : '';
				if (name) {
					defaultMap.set(name, event);
				}
			});
		}
	});
	
	return defaultMap;
}

/**
 * Parse hotkeys from JSON data
 * @param {Object} jsonData - Parsed XML as JSON
 * @returns {Array|null} Array of hotkey groups or null if not found
 */
function parseHotkeys(jsonData) {
	if (!jsonData || !jsonData.Profile || !jsonData.Profile.KeyMapGroups) {
		return null;
	}
	
	const keyMapGroups = jsonData.Profile.KeyMapGroups[0];
	if (!keyMapGroups || !keyMapGroups.Group) {
		return null;
	}
	
	return keyMapGroups.Group;
}

/**
 * Render a single hotkey group as HTML
 * @param {Object} group - Hotkey group object
 * @param {Map} defaultMap - Map of action names to default keys
 * @returns {string} HTML string for the group
 */
function renderHotkeyGroup(group, defaultMap) {
	const groupName = group.$.Name || 'Unnamed Group';
	let html = `<div class="hotkey-group">`;
	html += `<div class="hotkey-group-title">${escapeHtml(groupName)}</div>`;
	html += `<table class="hotkey-table">`;
	html += `<thead><tr><th>Action</th><th>Current Key</th><th>Default Key</th><th>Status</th></tr></thead>`;
	html += `<tbody>`;
	
	// Process keymaps in the group
	if (group.KeyMap && Array.isArray(group.KeyMap)) {
		group.KeyMap.forEach(keymap => {
			const name = keymap.Name ? keymap.Name[0] : 'Unknown';
			const event = keymap.Event ? keymap.Event[0] : '';
			const action = keymap.Action ? keymap.Action[0] : 'bind';
			const defaultKey = defaultMap.get(name) || '-';
			
			const statusClass = action === 'bind' ? 'hotkey-status-bind' : 'hotkey-status-unbind';
			const statusText = action === 'bind' ? 'Bound' : 'Unbound';
			
			html += `<tr>`;
			html += `<td>${escapeHtml(name)}</td>`;
			html += `<td><span class="hotkey-key">${escapeHtml(event)}</span></td>`;
			html += `<td><span class="hotkey-key hotkey-default">${escapeHtml(defaultKey)}</span></td>`;
			html += `<td class="${statusClass}">${statusText}</td>`;
			html += `</tr>`;
		});
	}
	
	html += `</tbody></table></div>`;
	return html;
}

/**
 * Render all hotkey groups
 * @param {Array} groups - Array of hotkey groups
 * @param {Map} defaultMap - Map of action names to default keys
 * @returns {string} HTML string for all groups
 */
function renderAllHotkeys(groups, defaultMap) {
	if (!groups || groups.length === 0) {
		return '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found in this profile.</div>';
	}
	
	let html = '';
	groups.forEach(group => {
		html += renderHotkeyGroup(group, defaultMap);
	});
	
	return html;
}

/**
 * Show hotkeys view and hide other views
 * @param {Object} jsonData - Parsed XML as JSON
 * @param {Object} defaultKeymapData - Parsed default keymap XML as JSON
 */
function showHotkeysView(jsonData, defaultKeymapData) {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	const groups = parseHotkeys(jsonData);
	const defaultMap = parseDefaultKeymap(defaultKeymapData);
	const html = renderAllHotkeys(groups, defaultMap);
	
	hotkeysContainer.innerHTML = html;
	hotkeysContainer.style.display = 'block';
	xmlContainer.style.display = 'none';
	
	console.log('Hotkeys view displayed with default keymap');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		escapeHtml,
		parseDefaultKeymap,
		parseHotkeys,
		renderHotkeyGroup,
		renderAllHotkeys,
		showHotkeysView
	};
}
