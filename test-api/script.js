document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const BACKEND_URL = 'http://localhost:3001'; // Updated to match the backend port
    
    // DOM Elements
    const healthCheckBtn = document.getElementById('healthCheck');
    const healthResponse = document.getElementById('healthResponse');
    
    const chatMessageInput = document.getElementById('chatMessage');
    const sendChatMessageBtn = document.getElementById('sendChatMessage');
    const geminiResponse = document.getElementById('geminiResponse');
    
    const imageUploadInput = document.getElementById('imageUpload');
    const analyzeImageBtn = document.getElementById('analyzeImage');
    const previewImage = document.getElementById('previewImage');
    const imageResponse = document.getElementById('imageResponse');
    
    // Event Listeners
    healthCheckBtn.addEventListener('click', checkHealth);
    sendChatMessageBtn.addEventListener('click', sendChatMessage);
    analyzeImageBtn.addEventListener('click', analyzeImage);
    
    // Enable/disable image analysis button based on file selection
    imageUploadInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            analyzeImageBtn.disabled = false;
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.classList.remove('d-none');
            };
            reader.readAsDataURL(e.target.files[0]);
        } else {
            analyzeImageBtn.disabled = true;
            previewImage.classList.add('d-none');
        }
    });
    
    // Health Check API
    async function checkHealth() {
        healthResponse.textContent = 'Checking...';
        
        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            const data = await response.text();
            
            healthResponse.textContent = `Status: ${response.status}\nResponse: ${data}`;
            
            if (response.status === 200) {
                healthResponse.style.color = 'green';
            } else {
                healthResponse.style.color = 'red';
            }
        } catch (error) {
            healthResponse.textContent = `Error: ${error.message}`;
            healthResponse.style.color = 'red';
        }
    }
    
    // Gemini Chat API
    async function sendChatMessage() {
        const message = chatMessageInput.value.trim();
        
        if (!message) {
            geminiResponse.textContent = 'Please enter a message';
            return;
        }
        
        geminiResponse.textContent = 'Sending message to Gemini API...';
        
        try {
            const chatMessages = [
                {
                    role: 'user',
                    type: 'text',
                    content: message
                }
            ];
            
            const response = await fetch(`${BACKEND_URL}/gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: chatMessages })
            });
            
            const data = await response.json();
            
            // Format the response
            geminiResponse.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            geminiResponse.textContent = `Error: ${error.message}`;
        }
    }
    
    // Image Recognition API
    async function analyzeImage() {
        const file = imageUploadInput.files[0];
        
        if (!file) {
            imageResponse.textContent = 'Please select an image';
            return;
        }
        
        imageResponse.textContent = 'Analyzing image...';
        
        try {
            // Convert image to base64
            const base64Image = await fileToBase64(file);
            
            // Send to backend
            const response = await fetch(`${BACKEND_URL}/image/recognise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Image })
            });
            
            const data = await response.json();
            
            // Format the response
            imageResponse.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            imageResponse.textContent = `Error: ${error.message}`;
        }
    }
    
    // Helper: Convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Extract base64 data (remove data:image/jpeg;base64, prefix)
                const base64 = reader.result.toString().split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }
});
