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
 * Parse default keymap and create structured data by group
 * @param {Object} defaultKeymapData - Parsed default keymap XML as JSON
 * @returns {Array} Array of groups with their default key mappings
 */
function parseDefaultKeymap(defaultKeymapData) {
	const defaultGroups = [];
	
	if (!defaultKeymapData) {
		return defaultGroups;
	}
	
	// Handle game default format (DefaultKeyMap)
	if (defaultKeymapData.DefaultKeyMap && defaultKeymapData.DefaultKeyMap.KeyMapGroup) {
		const groups = defaultKeymapData.DefaultKeyMap.KeyMapGroup;
		groups.forEach(group => {
			const groupName = group.$.name || 'Unnamed Group';
			const actions = [];
			
			if (group.KeyMapData && Array.isArray(group.KeyMapData)) {
				group.KeyMapData.forEach(keyData => {
					const name = keyData.Name ? keyData.Name[0] : null;
					const displayName = keyData.DisplayName ? keyData.DisplayName[0] : name;
					const event = keyData.Event ? keyData.Event[0] : '';
					if (name) {
						actions.push({
							name: name,
							displayName: displayName,
							defaultKey: event
						});
					}
				});
			}
			
			if (actions.length > 0) {
				defaultGroups.push({
					name: groupName,
					actions: actions
				});
			}
		});
	}
	// Handle user profile format (Profile -> KeyMapGroups -> Group)
	else if (defaultKeymapData.Profile && defaultKeymapData.Profile.KeyMapGroups) {
		const keyMapGroups = defaultKeymapData.Profile.KeyMapGroups[0];
		if (keyMapGroups && keyMapGroups.Group) {
			const groups = keyMapGroups.Group;
			groups.forEach(group => {
				const groupName = group.$.Name || 'Unnamed Group';
				const actions = [];
				
				if (group.KeyMap && Array.isArray(group.KeyMap)) {
					group.KeyMap.forEach(keymap => {
						const name = keymap.Name ? keymap.Name[0] : null;
						const event = keymap.Event ? keymap.Event[0] : '';
						const action = keymap.Action ? keymap.Action[0] : 'bind';
						
						// Only include bound keys as defaults
						if (name && action === 'bind') {
							actions.push({
								name: name,
								displayName: name,
								defaultKey: event
							});
						}
					});
				}
				
				if (actions.length > 0) {
					defaultGroups.push({
						name: groupName,
						actions: actions
					});
				}
			});
		}
	}
	
	return defaultGroups;
}

/**
 * Create a map of user's current key bindings by action name
 * @param {Array} userGroups - Array of user hotkey groups
 * @returns {Map} Map of action name to {key, action}
 */
function createUserKeymapLookup(userGroups) {
	const userMap = new Map();
	
	if (!userGroups || !Array.isArray(userGroups)) {
		return userMap;
	}
	
	userGroups.forEach(group => {
		if (group.KeyMap && Array.isArray(group.KeyMap)) {
			group.KeyMap.forEach(keymap => {
				const name = keymap.Name ? keymap.Name[0] : null;
				const event = keymap.Event ? keymap.Event[0] : '';
				const action = keymap.Action ? keymap.Action[0] : 'bind';
				if (name) {
					userMap.set(name, { key: event, action: action });
				}
			});
		}
	});
	
	return userMap;
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
 * @param {Object} defaultGroup - Default group object with actions
 * @param {Map} userMap - Map of action names to user's current bindings
 * @returns {string} HTML string for the group
 */
function renderHotkeyGroup(defaultGroup, userMap) {
	const groupName = defaultGroup.name || 'Unnamed Group';
	let html = `<div class="hotkey-group">`;
	html += `<div class="hotkey-group-title">${escapeHtml(groupName)}</div>`;
	html += `<table class="hotkey-table">`;
	html += `<thead><tr><th>Action</th><th>Current Key</th><th>Default Key</th><th>Status</th></tr></thead>`;
	html += `<tbody>`;
	
	// Process all actions from the default group
	defaultGroup.actions.forEach(action => {
		const userBinding = userMap.get(action.name);
		const currentKey = userBinding ? userBinding.key : '';
		const userAction = userBinding ? userBinding.action : null;
		const defaultKey = action.defaultKey || '';
		
		// Determine status
		let statusClass = '';
		let statusText = '';
		
		if (!userBinding) {
			// Not in user's profile - using default
			statusClass = 'hotkey-status-default';
			statusText = 'Default';
		} else if (userAction === 'unbind') {
			// Explicitly unbound
			statusClass = 'hotkey-status-unbind';
			statusText = 'Unbound';
		} else if (currentKey === defaultKey) {
			// Bound to default key
			statusClass = 'hotkey-status-default';
			statusText = 'Default';
		} else {
			// Custom binding
			statusClass = 'hotkey-status-custom';
			statusText = 'Custom';
		}
		
		// Display current key, or default if not set
		const displayKey = currentKey || defaultKey;
		const keyClass = userBinding && userAction === 'bind' ? 'hotkey-key' : 'hotkey-key hotkey-default';
		
		html += `<tr>`;
		html += `<td>${escapeHtml(action.displayName || action.name)}</td>`;
		html += `<td><span class="${keyClass}">${escapeHtml(displayKey)}</span></td>`;
		html += `<td><span class="hotkey-key hotkey-default">${escapeHtml(defaultKey)}</span></td>`;
		html += `<td class="${statusClass}">${statusText}</td>`;
		html += `</tr>`;
	});
	
	html += `</tbody></table></div>`;
	return html;
}

/**
 * Render all hotkey groups
 * @param {Array} defaultGroups - Array of default hotkey groups
 * @param {Map} userMap - Map of action names to user's current bindings
 * @returns {string} HTML string for all groups
 */
function renderAllHotkeys(defaultGroups, userMap) {
	if (!defaultGroups || defaultGroups.length === 0) {
		return '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found.</div>';
	}
	
	let html = '';
	defaultGroups.forEach(group => {
		html += renderHotkeyGroup(group, userMap);
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
	
	const userGroups = parseHotkeys(jsonData);
	const defaultGroups = parseDefaultKeymap(defaultKeymapData);
	const userMap = createUserKeymapLookup(userGroups);
	const html = renderAllHotkeys(defaultGroups, userMap);
	
	hotkeysContainer.innerHTML = html;
	hotkeysContainer.style.display = 'block';
	xmlContainer.style.display = 'none';
	
	console.log('Hotkeys view displayed with', defaultGroups.length, 'groups and', userMap.size, 'user bindings');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		escapeHtml,
		parseDefaultKeymap,
		createUserKeymapLookup,
		parseHotkeys,
		renderHotkeyGroup,
		renderAllHotkeys,
		showHotkeysView
	};
}
