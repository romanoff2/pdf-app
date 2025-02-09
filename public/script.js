const API_ENDPOINTS = {
    resume: {
        url: '/api/resume',
        acceptedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    receipt: {
        url: '/api/receipt',
        acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff']
    }
};

let selectedFile = null;
let currentParser = 'resume';

function switchParser(parser) {
    currentParser = parser;
    const fileInput = document.getElementById('fileInput');
    
    if (parser === 'resume') {
        fileInput.accept = '.pdf,.doc,.docx';
        document.getElementById('parserTitle').textContent = 'Resume Parser';
    } else {
        fileInput.accept = '.jpg,.jpeg,.png,.webp,.gif,.tiff';
        document.getElementById('parserTitle').textContent = 'Receipt Parser';
    }
    
    // Reset file selection
    fileInput.value = '';
    selectedFile = null;
    document.getElementById('fileName').textContent = '';
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        document.getElementById('fileName').textContent = selectedFile.name;
    }
});

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
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(API_ENDPOINTS[currentParser].url, {
            method: 'POST',
            headers: {
                'X-File-Name': selectedFile.name
            },
            body: formData
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