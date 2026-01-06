// Background Script

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text, request.targetLang)
      .then(translatedText => {
        sendResponse({ success: true, data: translatedText });
      })
      .catch(error => {
        console.error('Translation error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Asenkron yanıt için gerekli
  }
});

/**
 * Google Translate API (gtx) kullanarak metni çevirir.
 * @param {string} text - Çevrilecek metin
 * @param {string} targetLang - Hedef dil kodu (örn: 'en', 'tr')
 * @returns {Promise<string>}
 */
async function translateText(text, targetLang) {
  if (!text) return '';
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Google Translate dönen veri yapısı: [[["Çeviri", "Orjinal", ...], ...], ...]
    // Genellikle data[0] içinde cümle cümle çeviriler bulunur. Bunları birleştirmemiz gerekebilir.
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text; // Çeviri bulunamazsa orjinalini döndür
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
