// XML View: Format and display raw XML data

/**
 * Format XML with proper indentation
 * @param {string} xml - Raw XML string
 * @returns {string} Formatted XML
 */
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

/**
 * Add syntax highlighting to XML
 * @param {string} xml - XML string
 * @returns {string} HTML with syntax highlighting
 */
function highlightXml(xml) {
	return xml
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/(&lt;\/?)(\w+)([^&]*?)(&gt;)/g, '<span class="xml-tag">$1$2</span><span class="xml-attr">$3</span><span class="xml-tag">$4</span>')
		.replace(/="([^"]*)"/g, '="<span class="xml-value">$1</span>"')
		.replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>');
}

/**
 * Display XML in the content area
 * @param {string} xmlData - XML string to display
 * @param {boolean} formatted - Whether to show formatted/highlighted view
 */
function displayXml(xmlData, formatted = true) {
	const el = document.getElementById('xml-content');
	if (!el || !xmlData) return;
	
	if (formatted) {
		const formattedXml = formatXml(xmlData);
		el.innerHTML = highlightXml(formattedXml);
	} else {
		el.textContent = xmlData;
	}
}

/**
 * Show XML view and hide other views
 * @param {string} xmlData - XML data to display
 * @param {boolean} formatted - Whether to show formatted view
 */
function showXmlView(xmlData, formatted = true) {
	const hotkeysContainer = document.getElementById('hotkeys-view');
	const xmlContainer = document.getElementById('xml-content');
	
	if (!hotkeysContainer || !xmlContainer) return;
	
	hotkeysContainer.style.display = 'none';
	xmlContainer.style.display = 'block';
	
	displayXml(xmlData, formatted);
	console.log('XML view displayed');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		formatXml,
		highlightXml,
		displayXml,
		showXmlView
	};
}
