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
 * @returns {string} HTML string for the group
 */
function renderHotkeyGroup(group) {
	const groupName = group.$.Name || 'Unnamed Group';
	let html = `<div class="hotkey-group">`;
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
	return html;
}

/**
 * Render all hotkey groups
 * @param {Array} groups - Array of hotkey groups
 * @returns {string} HTML string for all groups
 */
function renderAllHotkeys(groups) {
	if (!groups || groups.length === 0) {
		return '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found in this profile.</div>';
	}
	
	let html = '';
	groups.forEach(group => {
		html += renderHotkeyGroup(group);
	});
	
	return html;
}

/**
 * Show hotkeys view and hide other views
 * @param {Object} jsonData - Parsed XML as JSON
 */
function showHotkeysView(jsonData) {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	const groups = parseHotkeys(jsonData);
	const html = renderAllHotkeys(groups);
	
	hotkeysContainer.innerHTML = html;
	hotkeysContainer.style.display = 'block';
	xmlContainer.style.display = 'none';
	
	console.log('Hotkeys view displayed');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		escapeHtml,
		parseHotkeys,
		renderHotkeyGroup,
		renderAllHotkeys,
		showHotkeysView
	};
}
