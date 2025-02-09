const API_ENDPOINTS = {
    resume: {
        url: '/api/process-pdf',
        acceptedTypes: '.pdf'
    },
    gas: {
        url: '/api/process-gas',
        acceptedTypes: '.pdf'
    },
    receipt: {
        url: '/api/process-receipt',
        acceptedTypes: 'image/*'
    }
};

let selectedFile = null;
let currentParser = 'resume';

function switchParser(parser) {
    currentParser = parser;
    selectedFile = null;
    document.getElementById('fileName').textContent = '';
    document.getElementById('sendButton').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    
    document.getElementById('fileInput').accept = API_ENDPOINTS[parser].acceptedTypes;
    
    const titles = {
        resume: 'Resume Parser',
        gas: 'Gas Bill Parser',
        receipt: 'Receipt Parser'
    };
    document.getElementById('parserTitle').textContent = titles[parser];
    
    document.querySelectorAll('.parser-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    document.getElementById('fileName').textContent = `Selected file: ${file.name}`;
    document.getElementById('sendButton').style.display = 'inline-block';
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
        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Get the boundary from the form data
        const boundary = Math.random().toString().substr(2);
        
        const response = await fetch(API_ENDPOINTS[currentParser].url, {
            method: 'POST',
            headers: {
                'X-File-Name': selectedFile.name
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
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