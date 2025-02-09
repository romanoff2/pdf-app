async function sendFile() {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }

    const uploadButton = document.getElementById('uploadButton');
    const sendButton = document.getElementById('sendButton');
    uploadButton.disabled = true;
    sendButton.disabled = true;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').innerHTML = '';

    try {
        // Read the file as an ArrayBuffer
        const arrayBuffer = await selectedFile.arrayBuffer();

        // Determine content type
        let contentType;
        if (currentParser === 'resume') {
            contentType = 'application/pdf';
        } else if (currentParser === 'receipt') {
            contentType = selectedFile.type; // Use browser-detected type for images
        }

        const response = await fetch(API_ENDPOINTS[currentParser].url, {
            method: 'POST',
            headers: {
                'X-File-Name': selectedFile.name,
                'Content-Type': contentType, // Send the explicit content type
            },
            body: arrayBuffer, // Send the ArrayBuffer directly
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        const formatter = new JSONFormatter(data, 1, {
            hoverPreviewEnabled: false,
            theme: 'dark',
            animateOpen: true,
            animateClose: true
        });

        document.getElementById('result').innerHTML = '';
        document.getElementById('result').appendChild(formatter.render());

    } catch (error) {
        console.error('Full error:', error);
        document.getElementById('result').innerHTML = `
            <div class="error">
                Error: ${error.message}
            </div>
        `;
    } finally {
        uploadButton.disabled = false;
        sendButton.disabled = false;
        document.getElementById('loading').style.display = 'none';
    }
}