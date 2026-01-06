// Background Script

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request.text, request.targetLang)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Asenkron yanıt
  }
});

async function handleTranslation(text, userTargetLang) {
  try {
    // Strateji Değişikliği:
    // Önce kullanıcının istediği dile (örn: EN) çevirmeyi dene.
    // Eğer kaynak zaten Türkçe ise, bu çeviri (TR->EN) doğrudur.
    // Eğer kaynak yabancı ise, o zaman Türkçe'ye çevirmemiz gerekir.

    // 1. Adım: Auto -> Hedef Dil (Örn: EN)
    const primaryTranslation = await fetchTranslation(text, userTargetLang);
    const detectedSrc = primaryTranslation.src || '';

    // Eğer algılanan kaynak dil Türkçe ise (veya tr-TR gibi)
    // Demek ki: Input'a Türkçe yazdık -> İngilizce istiyoruz.
    if (detectedSrc.startsWith('tr')) {
        return { 
            success: true, 
            data: primaryTranslation.translatedText, 
            detectedLang: 'tr' 
        };
    }

    // Eğer algılanan kaynak dil Türkçe DEĞİLSE (Yabancı)
    // Ve Kullanıcı da zaten Türkçe istememişse (userTargetLang !== 'tr')
    // Demek ki: Yabancı metin -> Türkçe istiyoruz.
    if (userTargetLang !== 'tr') {
        const toTurkish = await fetchTranslation(text, 'tr');
        return {
            success: true,
            data: toTurkish.translatedText,
            detectedLang: toTurkish.src
        };
    }

    // Eğer zaten hedef 'tr' idiyse ve kaynak yabancıysa, ilk çeviri doğrudur.
    return {
        success: true,
        data: primaryTranslation.translatedText,
        detectedLang: detectedSrc
    };

  } catch (error) {
    console.error('Translation process error:', error);
    throw error;
  }
}

async function fetchTranslation(text, targetLang) {
  if (!text) return { translatedText: '', src: '' };
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  
  let translatedText = '';
  if (data && data[0]) {
    translatedText = data[0].map(item => item[0]).join('');
  }
  
  const src = (data && data[2]) ? data[2] : '';

  return { translatedText, src };
}
