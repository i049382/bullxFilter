let keywords = [];

// Load keywords when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get(['filterKeywords']);
  keywords = result.filterKeywords || [];
  renderKeywords();
});

// Add keyword button handler
document.getElementById('addKeyword').addEventListener('click', addKeyword);
document.getElementById('keywordInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addKeyword();
  }
});

function addKeyword() {
  const input = document.getElementById('keywordInput');
  const keyword = input.value.trim();
  
  if (keyword && !keywords.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
    keywords.push(keyword);
    saveAndUpdateKeywords();
    input.value = '';
  }
}

function deleteKeyword(keyword) {
  keywords = keywords.filter(k => k !== keyword);
  saveAndUpdateKeywords();
}

function renderKeywords() {
  const container = document.getElementById('keywordsList');
  container.innerHTML = '';
  
  keywords.forEach(keyword => {
    const div = document.createElement('div');
    div.className = 'keyword-item';
    div.innerHTML = `
      <span class="keyword-text">${keyword}</span>
      <button class="delete-btn">DELETE</button>
    `;
    
    div.querySelector('.delete-btn').addEventListener('click', () => {
      deleteKeyword(keyword);
    });
    
    container.appendChild(div);
  });
}

async function saveAndUpdateKeywords() {
  try {
    // Save to storage
    await chrome.storage.local.set({ filterKeywords: keywords });
    
    // Update UI
    renderKeywords();
    
    // Send to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Sending keywords to content script:', keywords);
    chrome.tabs.sendMessage(tab.id, { 
      action: 'filter', 
      keywords: keywords 
    });
  } catch (error) {
    console.error('Error saving/updating keywords:', error);
  }
} 