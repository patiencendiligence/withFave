console.log('[withFave] Background loaded');

chrome.action.onClicked.addListener(async (tab) => {
  console.log('[withFave] Icon clicked, tab:', tab.id, tab.url);
  
  // chrome:// 페이지에서는 실행 불가
  if (tab.url.startsWith('chrome://')) {
    console.log('[withFave] Cannot run on chrome:// pages');
    return;
  }
  
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css']
    });
    console.log('[withFave] CSS injected');
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    console.log('[withFave] JS injected');
  } catch (err) {
    console.error('[withFave] Error:', err);
  }
});
