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
	} else if (data && data.json) {
		el.innerText = JSON.stringify(data.json, null, 2)
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

// Make functions globally accessible for onclick handlers
window.toggleView = toggleView;
window.copyXml = copyXml;

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
