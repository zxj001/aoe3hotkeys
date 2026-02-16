// Renderer: receive XML data from preload-exposed API and render it.

function showXml(data) {
	const el = document.getElementById('xml-content')
	if (!el) return
	if (data && data.xml) {
		el.innerText = data.xml
	} else if (data && data.json) {
		el.innerText = JSON.stringify(data.json, null, 2)
	} else {
		el.innerText = 'No XML data received.'
	}
}

if (window.api && typeof window.api.onXml === 'function') {
	window.api.onXml((data) => {
		showXml(data)
	})
} else {
	console.warn('API not available: xml events will not be received')
}
