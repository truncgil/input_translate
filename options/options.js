// Varsayılan profil yapısı
const DEFAULT_PROFILES = [
    { targetLang: 'en', shortcut: null }
];

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add-profile-btn').addEventListener('click', () => addProfileUI());
document.getElementById('save-btn').addEventListener('click', saveOptions);

// Ayarları yükle
function restoreOptions() {
    chrome.storage.sync.get({ profiles: DEFAULT_PROFILES }, (items) => {
        const profilesContainer = document.getElementById('profiles-container');
        profilesContainer.innerHTML = ''; // Temizle
        
        items.profiles.forEach(profile => {
            addProfileUI(profile);
        });
    });
}

// Yeni profil ekleme arayüzü
function addProfileUI(profile = { targetLang: 'en', shortcut: null }) {
    const container = document.getElementById('profiles-container');
    const template = document.getElementById('profile-template');
    const clone = template.content.cloneNode(true);
    
    const itemDiv = clone.querySelector('.profile-item');
    const langSelect = clone.querySelector('.target-lang');
    const shortcutInput = clone.querySelector('.shortcut-key');
    const clearBtn = clone.querySelector('.clear-shortcut');
    const removeBtn = clone.querySelector('.remove-profile-btn');

    // Değerleri ata
    langSelect.value = profile.targetLang;
    if (profile.shortcut) {
        shortcutInput.value = formatShortcut(profile.shortcut);
        shortcutInput.dataset.shortcut = JSON.stringify(profile.shortcut);
    }

    // Kısayol kaydetme olayları
    shortcutInput.addEventListener('keydown', (e) => {
        e.preventDefault();
        
        // Sadece modifier tuşlarına basıldıysa işlem yapma
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

        const shortcut = {
            key: e.key.toUpperCase(),
            code: e.code,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey
        };

        shortcutInput.value = formatShortcut(shortcut);
        shortcutInput.dataset.shortcut = JSON.stringify(shortcut);
    });

    shortcutInput.addEventListener('focus', () => {
        shortcutInput.classList.add('recording');
    });

    shortcutInput.addEventListener('blur', () => {
        shortcutInput.classList.remove('recording');
    });

    // Temizle butonu
    clearBtn.addEventListener('click', () => {
        shortcutInput.value = '';
        delete shortcutInput.dataset.shortcut;
    });

    // Sil butonu
    removeBtn.addEventListener('click', () => {
        container.removeChild(itemDiv);
    });

    container.appendChild(itemDiv);
}

// Kısayolu okunabilir stringe çevir
function formatShortcut(shortcut) {
    if (!shortcut) return '';
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Meta'); // Mac Command
    parts.push(shortcut.key);
    return parts.join(' + ');
}

// Ayarları kaydet
function saveOptions() {
    const profileItems = document.querySelectorAll('.profile-item');
    const profiles = [];

    profileItems.forEach(item => {
        const lang = item.querySelector('.target-lang').value;
        const shortcutData = item.querySelector('.shortcut-key').dataset.shortcut;
        
        profiles.push({
            targetLang: lang,
            shortcut: shortcutData ? JSON.parse(shortcutData) : null
        });
    });

    chrome.storage.sync.set({ profiles: profiles }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Ayarlar başarıyla kaydedildi! 🎉';
        status.classList.add('show');
        
        setTimeout(() => {
            status.classList.remove('show');
            setTimeout(() => { status.textContent = ''; }, 300);
        }, 2000);
    });
}
