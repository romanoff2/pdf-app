document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('pdfFile');
    const loadingDiv = document.getElementById('loading');
    const responseDiv = document.getElementById('response');
    
    if (!fileInput.files[0]) {
        alert('Please select a PDF file');
        return;
    }

    try {
        loadingDiv.style.display = 'block';
        responseDiv.style.display = 'none';

        const response = await fetch('/api', {
            method: 'POST',
            body: fileInput.files[0]
        });

        const data = await response.json();
        
        responseDiv.textContent = JSON.stringify(data, null, 2);
        responseDiv.style.display = 'block';
    } catch (error) {
        responseDiv.textContent = 'Error: ' + error.message;
        responseDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
});