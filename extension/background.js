chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    selectedMember: 'jk',
    emotion: 0,
    visible: true
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const { visible } = await chrome.storage.local.get('visible');
  const newVisible = !visible;
  chrome.storage.local.set({ visible: newVisible });
  
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  } catch (e) {
    // Content script not loaded on this tab, ignore
  }
});

chrome.tabs.onCreated.addListener(updateEmotion);
chrome.tabs.onRemoved.addListener(updateEmotion);

async function updateEmotion() {
  const tabs = await chrome.tabs.query({});
  const tc = tabs.length;
  const h = new Date().getHours();
  
  let e = tc <= 5 ? 0 : tc <= 15 ? 1 : tc <= 30 ? 2 : 3;
  if (h >= 22 || h < 6) e = Math.max(0, e - 1);
  else if (h >= 9 && h < 11) e = Math.min(3, e + 1);
  
  chrome.storage.local.set({ emotion: e, tabCount: tc });
}
