// Renderer: receive XML data from preload-exposed API and render it.

let currentXmlData = null;
let showFormatted = true;

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
		updateDisplay();
		// Show success status when data is loaded
		if (data.aoe3UserDir) {
			showStatus('Profile loaded successfully from: ' + data.aoe3UserDir);
		}
	} else if (data && data.json) {
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

function copyXml() {
	if (currentXmlData && navigator.clipboard) {
		navigator.clipboard.writeText(currentXmlData).then(() => {
			alert('XML copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy:', err);
		});
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
	const statusEl = document.getElementById('status');
	if (statusEl) {
		statusEl.textContent = message;
		statusEl.style.display = 'block';
		statusEl.style.backgroundColor = isError ? '#ffebee' : '#e3f2fd';
		statusEl.style.color = isError ? '#c62828' : '#1565c0';
		
		// Auto-hide after 3 seconds if not an error
		if (!isError) {
			setTimeout(() => {
				statusEl.style.display = 'none';
			}, 3000);
		}
	}
}

// Make functions globally accessible for onclick handlers
window.toggleView = toggleView;
window.copyXml = copyXml;
window.selectNewDirectory = selectNewDirectory;
window.selectNewProfile = selectNewProfile;

console.log('Renderer loaded');
console.log('window.api:', window.api);

if (window.api && typeof window.api.onXml === 'function') {
	console.log('Setting up XML listener...');
	window.api.onXml((data) => {
		console.log('Received XML data:', data);
		showXml(data)
	})
} else {
	console.warn('API not available: xml events will not be received')
}
