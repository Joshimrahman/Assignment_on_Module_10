document.addEventListener('DOMContentLoaded', () => {
  const userPrompt = document.getElementById('userPrompt');
  const generateBtn = document.getElementById('generateBtn');
  const resultBox = document.getElementById('resultBox');
  const errorBox = document.getElementById('errorBox');
  
  // Generate button click handler
  generateBtn.addEventListener('click', async () => {
    const prompt = userPrompt.value.trim();
    
    // Clear previous error
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    
    // Validate input
    if (!prompt) {
      showError('⚠️ Please enter a prompt before clicking Generate!');
      return;
    }
    
    // Disable button and show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="loading"></span>Generating...';
    resultBox.innerHTML = '<p>Thinking... Please wait.</p>';
    
    try {
      // Send request to backend
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Display AI response with formatting
        resultBox.innerHTML = formatText(data.result);
      } else {
        // Handle API errors
        showError(`❌ ${data.error || 'Failed to generate response'}`);
        resultBox.innerHTML = '<p class="placeholder-text">Your AI-generated response will appear here...</p>';
      }
      
    } catch (error) {
      // Handle network errors
      showError(`❌ Network error: ${error.message}. Please check your connection.`);
      resultBox.innerHTML = '<p class="placeholder-text">Your AI-generated response will appear here...</p>';
    } finally {
      // Re-enable button
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate';
    }
  });
  
  // Show error message
  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  }
  
  // Simple text formatting (convert newlines to <br>)
  function formatText(text) {
    // Escape HTML to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert markdown-style formatting
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/\*(.+?)\*/g, '<em>$1</em>')              // Italic
      .replace(/`(.+?)`/g, '<code>$1</code>')            // Code
      .replace(/\n/g, '<br>');                           // Newlines
  }
  
  // Allow Enter key to submit (optional)
  userPrompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      generateBtn.click();
    }
  });
});