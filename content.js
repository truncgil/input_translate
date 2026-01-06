// Content Script

let profiles = [];
let activeElement = null;
let floatingBtn = null;
let isTranslating = false;

// Ayarları yükle
chrome.storage.sync.get(['profiles'], (result) => {
    if (result.profiles) {
        profiles = result.profiles;
    }
});

// Ayarlar değişirse güncelle
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.profiles) {
        profiles = changes.profiles.newValue;
    }
});

// UI Oluşturma (Shadow DOM)
function createFloatingButton() {
    if (floatingBtn) return floatingBtn;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.zIndex = '2147483647'; // Max z-index
    container.style.display = 'none';
    container.style.top = '0';
    container.style.left = '0';
    
    // Shadow root
    const shadow = container.attachShadow({ mode: 'open' });
    
    // Stil
    const style = document.createElement('style');
    style.textContent = `
        .translate-btn {
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-family: sans-serif;
            font-size: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 4px;
            transition: background-color 0.2s;
            pointer-events: auto;
        }
        .translate-btn:hover {
            background-color: #3367d6;
        }
        .icon {
            font-size: 14px;
            font-weight: bold;
        }
    `;
    
    // Buton
    const btn = document.createElement('button');
    btn.className = 'translate-btn';
    btn.innerHTML = '<span class="icon">A文</span> Çevir';
    
    // Mouse down olayını yakala ve yayılmayı durdur
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        handleButtonClick();
    });

    shadow.appendChild(style);
    shadow.appendChild(btn);
    
    document.body.appendChild(container);
    
    return { container, btn };
}

// Olay Dinleyicileri
document.addEventListener('mouseup', handleSelection);
document.addEventListener('keyup', handleSelection);
document.addEventListener('keydown', handleKeydown);

// Input dışına tıklayınca butonu gizle
document.addEventListener('mousedown', (e) => {
    if (floatingBtn && !floatingBtn.container.contains(e.target)) {
        hideButton();
    }
});

function isEditable(element) {
    if (!element) return false;
    return ['INPUT', 'TEXTAREA'].includes(element.tagName) || element.isContentEditable;
}

function handleSelection(e) {
    const el = e.target;
    
    // Seçim yapılan element düzenlenebilir değilse ve butonun kendisi değilse çık
    // (Butona tıklama durumunu kontrol etmek için shadow DOM'a bakmak gerekebilir, 
    // ama mousedown handler'ı zaten işi çözüyor)
    if (!isEditable(el) && (!floatingBtn || !floatingBtn.container.contains(el))) {
        return;
    }

    activeElement = el;

    // Seçim metnini al (hem input hem contenteditable için çalışır)
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        showButton(el, e);
    } else {
        hideButton();
    }
}

function showButton(targetEl, event) {
    if (!floatingBtn) {
        floatingBtn = createFloatingButton();
    }

    // Pozisyon Hesaplama
    // Google Translate ile çakışmayı önlemek için biraz daha yukarı alalım
    // veya biraz sağa kaydıralım.
    
    let top, left;

    // Mouse olayı ise ve koordinat varsa
    if (event && (event.type === 'mouseup' || event.type === 'keyup')) {
        // Seçimin koordinatlarını al (range kullanarak daha hassas konumlandırma)
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            top = rect.top + window.scrollY - 35; // Seçimin hemen üstü
            left = rect.right + window.scrollX + 5; // Seçimin sağ tarafı (Google solda çıkar genelde)
        } else {
            // Fallback
            top = event.pageY - 40;
            left = event.pageX;
        }
    } else {
        const rect = targetEl.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        top = rect.top + scrollTop - 40;
        left = rect.right + scrollLeft - 10; 
    }
    
    // Ekran sınırları kontrolü
    if (top < 0) top = 0;
    if (left > window.innerWidth - 80) left = window.innerWidth - 80;

    floatingBtn.container.style.top = `${top}px`;
    floatingBtn.container.style.left = `${left}px`;
    floatingBtn.container.style.display = 'block';
}

function hideButton() {
    if (floatingBtn) {
        floatingBtn.container.style.display = 'none';
    }
}

function handleButtonClick() {
    // Varsayılan olarak ilk profili veya 'tr' kullan
    const targetLang = (profiles.length > 0) ? profiles[0].targetLang : 'tr';
    processTranslation(targetLang);
}

function handleKeydown(e) {
    if (!isEditable(e.target)) return;

    // Kısayol kontrolü
    const matchedProfile = profiles.find(p => {
        if (!p.shortcut) return false;
        return p.shortcut.code === e.code &&
               p.shortcut.altKey === e.altKey &&
               p.shortcut.ctrlKey === e.ctrlKey &&
               p.shortcut.shiftKey === e.shiftKey &&
               p.shortcut.metaKey === e.metaKey;
    });

    if (matchedProfile) {
        e.preventDefault();
        // Aktif elementi güncelle (odaklanılan element)
        activeElement = e.target;
        processTranslation(matchedProfile.targetLang);
    }
}

async function processTranslation(targetLang) {
    if (isTranslating) return;
    
    // Seçili metni al
    const selection = window.getSelection();
    const text = selection.toString();
    
    if (!text) return;

    // UI Güncelleme
    isTranslating = true;
    if (floatingBtn) floatingBtn.btn.textContent = '...';

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'translate',
            text: text,
            targetLang: targetLang
        });

        if (response && response.success) {
            replaceSelection(response.data);
            hideButton();
        } else {
            console.error('Çeviri hatası:', response ? response.error : 'Bilinmeyen hata');
            // Kullanıcıyı rahatsız etmemek için alert yerine console log tercih edilebilir
        }
    } catch (err) {
        console.error(err);
    } finally {
        isTranslating = false;
        if (floatingBtn) floatingBtn.btn.innerHTML = '<span class="icon">A文</span> Çevir';
    }
}

function replaceSelection(newText) {
    // ContentEditable ve Input/Textarea için farklı yaklaşımlar
    
    if (document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        
        const el = document.activeElement;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = el.value;
        
        el.value = text.substring(0, start) + newText + text.substring(end);
        el.selectionStart = start + newText.length;
        el.selectionEnd = start + newText.length;
        
        // Event tetikle
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        
    } else {
        // ContentEditable (div vb.) için execCommand kullanımı (en güvenilir yöntem)
        // document.execCommand 'deprecated' olsa da metin editörleri için hala standarttır.
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, newText);
        } else {
            // Fallback: Range değişimi (daha karmaşık ve bazen sorunlu olabilir)
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(newText));
                
                // İmleci sona taşı
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
}
