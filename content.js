let observer = null;

function filterTableRows(keywords) {
    try {
        // Get the table body
        const tableBody = document.querySelector('.ant-table-tbody');
        if (!tableBody) {
            console.log('Table body not found');
            return;
        }

        // Get all rows except measure row
        const rows = tableBody.querySelectorAll('tr:not(.ant-table-measure-row)');
        console.log('Found rows:', rows.length);

        rows.forEach((row, index) => {
            try {
                // Get all text content from the row
                const allText = row.textContent.toLowerCase().trim();
                console.log(`Row ${index} text:`, allText);

                // Show row if it matches any keyword
                const shouldShow = keywords.length === 0 || keywords.some(keyword => {
                    const lowercaseKeyword = keyword.toLowerCase().trim();
                    const matches = allText.includes(lowercaseKeyword);
                    console.log(`Checking keyword "${lowercaseKeyword}" against row ${index}:`, matches);
                    return matches;
                });
                
                // Apply visibility
                row.style.display = shouldShow ? 'table-row' : 'none';
                console.log(`Row ${index} visibility:`, shouldShow ? 'visible' : 'hidden');
            } catch (error) {
                console.error('Error processing row:', index, error);
            }
        });
    } catch (error) {
        console.error('Filter table rows error:', error);
    }
}

function filterPumpCards(keywords) {
    try {
        const pumpCards = document.querySelectorAll('.pump-card');
        
        pumpCards.forEach(card => {
            try {
                const nameElement = card.querySelector('.text-grey-50');
                const descElement = card.querySelector('.text-grey-200');
                
                const tokenName = (nameElement?.textContent || '').toLowerCase().trim();
                const tokenDesc = (descElement?.textContent || '').toLowerCase().trim();
                
                const shouldShow = keywords.length === 0 || keywords.some(keyword => {
                    const lowercaseKeyword = keyword.toLowerCase().trim();
                    return tokenName.includes(lowercaseKeyword) || tokenDesc.includes(lowercaseKeyword);
                });
                
                card.style.display = shouldShow ? 'flex' : 'none';
            } catch (error) {
                console.error('Error processing individual card:', error);
            }
        });
    } catch (error) {
        console.error('Filter pump cards error:', error);
    }
}

function filterContent(keywords) {
    // Determine which page we're on and apply appropriate filtering
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);

    if (currentPath.includes('pump-vision')) {
        console.log('Filtering pump vision page');
        filterPumpCards(keywords);
    } else if (currentPath === '/') {
        console.log('Filtering main page');
        filterTableRows(keywords);
    }
}

function initializeObserver() {
    try {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            try {
                chrome.storage.local.get(['filterKeywords'], (result) => {
                    const keywords = result.filterKeywords || [];
                    filterContent(keywords);
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

function initializeExtension() {
    try {
        chrome.storage.local.get(['filterKeywords'], (result) => {
            const keywords = result.filterKeywords || [];
            console.log('Initializing with keywords:', keywords);
            filterContent(keywords);
        });

        initializeObserver();

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'filter') {
                console.log('Received filter request with keywords:', request.keywords);
                filterContent(request.keywords);
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