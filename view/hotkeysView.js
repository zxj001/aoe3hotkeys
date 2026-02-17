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
 * Create a map of group names to their user action names
 * @param {Array} userGroups - Array of user hotkey groups
 * @returns {Map} Map of group name to array of action names
 */
function createUserGroupMap(userGroups) {
	const groupMap = new Map();
	
	if (!userGroups || !Array.isArray(userGroups)) {
		return groupMap;
	}
	
	userGroups.forEach(group => {
		const groupName = group.$.Name || 'Unnamed Group';
		const actionNames = [];
		
		if (group.KeyMap && Array.isArray(group.KeyMap)) {
			group.KeyMap.forEach(keymap => {
				const name = keymap.Name ? keymap.Name[0] : null;
				if (name) {
					actionNames.push(name);
				}
			});
		}
		
		if (actionNames.length > 0) {
			groupMap.set(groupName, actionNames);
		}
	});
	
	return groupMap;
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
 * @param {Map} userGroupMap - Map of group name to user's actions in that group
 * @param {string} filterText - Text to filter actions by (optional)
 * @returns {string} HTML string for the group, or empty if no matches
 */
function renderHotkeyGroup(defaultGroup, userMap, userGroupMap, filterText = '') {
	const groupName = defaultGroup.name || 'Unnamed Group';
	const filter = filterText.toLowerCase().trim();
	
	// Create a set of all action names we'll display (union of default and user)
	const allActionNames = new Set();
	const actionDataMap = new Map();
	
	// Add all default actions
	defaultGroup.actions.forEach(action => {
		allActionNames.add(action.name);
		actionDataMap.set(action.name, {
			displayName: action.displayName || action.name,
			defaultKey: action.defaultKey || ''
		});
	});
	
	// Add any user actions from this group that aren't in defaults
	const userActionsInGroup = userGroupMap.get(groupName) || [];
	userActionsInGroup.forEach(actionName => {
		if (!allActionNames.has(actionName)) {
			allActionNames.add(actionName);
			actionDataMap.set(actionName, {
				displayName: actionName,
				defaultKey: ''
			});
		}
	});
	
	// Build rows, filtering as needed
	let rowsHtml = '';
	let matchCount = 0;
	
	// Render all actions
	allActionNames.forEach(actionName => {
		const actionData = actionDataMap.get(actionName);
		const userBinding = userMap.get(actionName);
		const currentKey = userBinding ? userBinding.key : '';
		const userAction = userBinding ? userBinding.action : null;
		const defaultKey = actionData.defaultKey;
		
		// Apply filter if specified
		if (filter) {
			const displayName = actionData.displayName.toLowerCase();
			const currentKeyLower = currentKey.toLowerCase();
			const defaultKeyLower = defaultKey.toLowerCase();
			
			// Check if any field matches the filter
			if (!displayName.includes(filter) && 
			    !currentKeyLower.includes(filter) && 
			    !defaultKeyLower.includes(filter)) {
				return; // Skip this action
			}
		}
		
		matchCount++;
		
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
		} else if (currentKey === defaultKey && defaultKey !== '') {
			// Bound to default key
			statusClass = 'hotkey-status-default';
			statusText = 'Default';
		} else if (defaultKey === '') {
			// User-only binding (no default exists)
			statusClass = 'hotkey-status-custom';
			statusText = 'User Only';
		} else {
			// Custom binding
			statusClass = 'hotkey-status-custom';
			statusText = 'Custom';
		}
		
		// Display current key, or default if not set
		const displayKey = currentKey || defaultKey;
		const keyClass = userBinding && userAction === 'bind' ? 'hotkey-key' : 'hotkey-key hotkey-default';
		
		rowsHtml += `<tr>`;
		rowsHtml += `<td>${escapeHtml(actionData.displayName)}</td>`;
		rowsHtml += `<td><span class="${keyClass}">${escapeHtml(displayKey)}</span></td>`;
		rowsHtml += `<td><span class="hotkey-key hotkey-default">${escapeHtml(defaultKey || '-')}</span></td>`;
		rowsHtml += `<td class="${statusClass}">${statusText}</td>`;
		rowsHtml += `</tr>`;
	});
	
	// If no matches, return empty string (don't render this group)
	if (matchCount === 0) {
		return '';
	}
	
	// Build the group HTML
	let html = `<div class="hotkey-group">`;
	html += `<div class="hotkey-group-title">${escapeHtml(groupName)}</div>`;
	html += `<table class="hotkey-table">`;
	html += `<thead><tr><th>Action</th><th>Current Key</th><th>Default Key</th><th>Status</th></tr></thead>`;
	html += `<tbody>`;
	html += rowsHtml;
	html += `</tbody></table></div>`;
	return html;
}

/**
 * Render all hotkey groups
 * @param {Array} defaultGroups - Array of default hotkey groups
 * @param {Map} userMap - Map of action names to user's current bindings
 * @param {Map} userGroupMap - Map of group name to user's actions in that group
 * @param {Array} userGroups - Array of user hotkey groups for user-only groups
 * @param {string} filterText - Text to filter actions by (optional)
 * @returns {string} HTML string for all groups
 */
function renderAllHotkeys(defaultGroups, userMap, userGroupMap, userGroups, filterText = '') {
	// Create a set of all group names (union of default and user groups)
	const allGroupNames = new Set();
	const groupDataMap = new Map();
	
	// Add all default groups
	if (defaultGroups && defaultGroups.length > 0) {
		defaultGroups.forEach(group => {
			allGroupNames.add(group.name);
			groupDataMap.set(group.name, { 
				isDefault: true, 
				defaultGroup: group 
			});
		});
	}
	
	// Add any user-only groups
	if (userGroups && Array.isArray(userGroups)) {
		userGroups.forEach(group => {
			const groupName = group.$.Name || 'Unnamed Group';
			if (!allGroupNames.has(groupName)) {
				allGroupNames.add(groupName);
				// Create a pseudo default group for user-only groups
				const actionNames = userGroupMap.get(groupName) || [];
				groupDataMap.set(groupName, {
					isDefault: false,
					defaultGroup: {
						name: groupName,
						actions: actionNames.map(name => ({
							name: name,
							displayName: name,
							defaultKey: ''
						}))
					}
				});
			}
		});
	}
	
	if (allGroupNames.size === 0) {
		return '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found.</div>';
	}
	
	// Render all groups
	let html = '';
	let totalGroupsRendered = 0;
	
	allGroupNames.forEach(groupName => {
		const groupData = groupDataMap.get(groupName);
		if (groupData && groupData.defaultGroup) {
			const groupHtml = renderHotkeyGroup(groupData.defaultGroup, userMap, userGroupMap, filterText);
			if (groupHtml) {
				html += groupHtml;
				totalGroupsRendered++;
			}
		}
	});
	
	// Show message if filter produced no results
	if (filterText && totalGroupsRendered === 0) {
		return '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys match the filter.</div>';
	}
	
	return html || '<div style="padding: 20px; text-align: center; color: #999;">No hotkeys found.</div>';
}

/**
 * Show hotkeys view and hide other views
 * @param {Object} jsonData - Parsed XML as JSON
 * @param {Object} defaultKeymapData - Parsed default keymap XML as JSON
 * @param {string} filterText - Text to filter actions by (optional)
 */
function showHotkeysView(jsonData, defaultKeymapData, filterText = '') {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	const filterContainer = document.getElementById('hotkeys-filter-container');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	const userGroups = parseHotkeys(jsonData);
	const defaultGroups = parseDefaultKeymap(defaultKeymapData);
	const userMap = createUserKeymapLookup(userGroups);
	const userGroupMap = createUserGroupMap(userGroups);
	const html = renderAllHotkeys(defaultGroups, userMap, userGroupMap, userGroups, filterText);
	
	hotkeysContainer.innerHTML = html;
	hotkeysContainer.style.display = 'block';
	xmlContainer.style.display = 'none';
	
	// Show filter container when in hotkeys view
	if (filterContainer) {
		filterContainer.style.display = 'block';
	}
	
	console.log('Hotkeys view displayed with', defaultGroups.length, 'default groups,', userMap.size, 'user bindings, and', userGroups ? userGroups.length : 0, 'user groups');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		escapeHtml,
		parseDefaultKeymap,
		createUserKeymapLookup,
		createUserGroupMap,
		parseHotkeys,
		renderHotkeyGroup,
		renderAllHotkeys,
		showHotkeysView
	};
}
