# Input Translate Chrome Extension

Input Translate, web sayfalarındaki herhangi bir metin giriş alanında (Input, Textarea veya ContentEditable divler) seçtiğiniz metni anında istediğiniz dile çevirip, orijinal metinle değiştiren (replacement) bir Chrome eklentisidir.

## Özellikler

*   **Yerinde Çeviri (Replacement):** Seçili metni sadece çevirmekle kalmaz, doğrudan kutucuğun içindeki metinle değiştirir.
*   **Geniş Uyumluluk:** Standart `<input>`, `<textarea>` alanlarının yanı sıra Twitter, Gmail, Facebook gibi sitelerin kullandığı zengin metin editörlerinde (`contenteditable`) de sorunsuz çalışır.
*   **Klavye Kısayolları:** Her dil için özel kısayol atayabilirsiniz (Örn: `Alt + 1` -> İngilizce, `Alt + 2` -> Almanca).
*   **Çoklu Dil Desteği:** Ayarlar sayfasından sınırsız sayıda çeviri profili oluşturabilirsiniz.
*   **Kullanıcı Dostu Arayüz:** Metin seçildiğinde çıkan şık ve dikkat dağıtmayan bir buton ile tek tıkla çeviri imkanı.
*   **Gizlilik Odaklı:** Google Translate API'sini (istemci tarafı) kullanır, verilerinizi hiçbir sunucuda saklamaz.

## Kurulum

1.  Bu projeyi bilgisayarınıza indirin veya klonlayın.
2.  Google Chrome tarayıcısını açın ve adres çubuğuna `chrome://extensions` yazın.
3.  Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını aktif hale getirin.
4.  Sol üstte beliren **Paketlenmemiş öğe yükle (Load unpacked)** butonuna tıklayın.
5.  İndirdiğiniz proje klasörünü (`input_translate`) seçin.

## Kullanım

### Ayarlar
1.  Chrome araç çubuğundaki eklenti ikonuna sağ tıklayın ve **Seçenekler**'e gidin.
2.  **Yeni Profil Ekle** butonu ile hedef dil ve kısayol kombinasyonlarını belirleyin.
3.  **Kaydet** butonuna basarak ayarlarınızı saklayın.

### Çeviri Yapma
1.  Herhangi bir web sitesinde bir metin kutusuna yazı yazın.
2.  Çevirmek istediğiniz kısmı mouse ile seçin.
3.  **Yöntem 1:** Seçimin sağ üstünde beliren "Çevir" ikonuna tıklayın (Varsayılan veya ilk profil diline çevirir).
4.  **Yöntem 2:** Atadığınız klavye kısayolunu kullanın (Örn: `Alt + 1`).
5.  Seçili metin anında çevrilmiş haliyle değiştirilecektir.

## Teknoloji Yığını

*   Manifest V3
*   JavaScript (ES6+)
*   Chrome Storage API
*   Shadow DOM (Stil izolasyonu için)
*   Google Translate API (Client-side usage)

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
