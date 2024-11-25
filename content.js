let observer = null;

function filterCards(keywords) {
    try {
        // Get all pump cards
        const pumpCards = document.querySelectorAll('.pump-card');
        
        pumpCards.forEach(card => {
            try {
                // Get the token name and description elements
                const nameElement = card.querySelector('.text-grey-50');
                const descElement = card.querySelector('.text-grey-200');
                
                // Safely get text content and convert to lowercase
                const tokenName = (nameElement?.textContent || '').toLowerCase().trim();
                const tokenDesc = (descElement?.textContent || '').toLowerCase().trim();
                
                // Debug logging
                console.log('Filtering card:', {
                    tokenName,
                    tokenDesc,
                    keywords
                });

                // Show card if it matches any keyword
                const shouldShow = keywords.length === 0 || keywords.some(keyword => {
                    const lowercaseKeyword = keyword.toLowerCase().trim();
                    const nameMatch = tokenName.includes(lowercaseKeyword);
                    const descMatch = tokenDesc.includes(lowercaseKeyword);
                    
                    // Debug logging for matches
                    // console.log('Keyword check:', {
                    //     keyword: lowercaseKeyword,
                    //     nameMatch,
                    //     descMatch
                    // });
                    
                    return nameMatch || descMatch;
                });
                
                // Apply visibility
                card.style.display = shouldShow ? 'flex' : 'none';
                
                // Debug logging for visibility
                // console.log('Card visibility:', {
                //     tokenName,
                //     shouldShow
                // });
            } catch (error) {
                console.error('Error processing individual card:', error);
            }
        });
    } catch (error) {
        console.error('Filter cards error:', error);
    }
}

function initializeObserver() {
    try {
        // Stop existing observer if any
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            try {
                chrome.storage.local.get(['filterKeywords'], (result) => {
                    const keywords = result.filterKeywords || [];
                    filterCards(keywords);
                });
            } catch (error) {
                console.error('Observer error:', error);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } catch (error) {
        console.error('Initialize observer error:', error);
    }
}

// Initialize extension
function initializeExtension() {
    try {
        // Apply saved filters on page load
        chrome.storage.local.get(['filterKeywords'], (result) => {
            const keywords = result.filterKeywords || [];
            console.log('Initializing with keywords:', keywords);
            filterCards(keywords);
        });

        // Initialize observer
        initializeObserver();

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'filter') {
                console.log('Received filter request with keywords:', request.keywords);
                filterCards(request.keywords);
            }
        });
    } catch (error) {
        console.error('Initialize extension error:', error);
    }
}

// Start the extension
initializeExtension();

// Handle extension reload/update
document.addEventListener('DOMContentLoaded', initializeExtension); 