# Değişiklik günlüğü

## v2.1 · Kasım 2026

- **Yenilikler penceresi:** ana menüde sürüm etiketi (v2.1 · Kasım 2026); tıklayınca bu güncellemenin maddeleri açılır (Türkçe ve İngilizce). `Esc` ile kapanır.
- **Son marşların:** bitirdiğin son 8 marşın (şarkı, zorluk, derece, skor, tarih) yerelde, `arena.mehter.history` anahtarında tutulur ve Yenilikler penceresinde listelenir. Mevcut kayıt anahtarlarına (`arena.mehter.settings`, `.best`, `.best.easy`) dokunulmadı; bot ve `?auto` koşuları geçmişe yazmaz.
- **Tam kombo:** hiç kaçırmadan ve kopmadan biten marş sonuç ekranında «TAM KOMBO» mührü alır ve yeni bir pasaport rozeti (`mehter-fc`) kazandırır. Ruh tükenmez açıkken rozet verilmez.
- **Düzeltme:** ana menü altındaki bağlantı GitHub profiline gidiyordu; artık «Diğer oyunlar» adıyla oyunlar sayfasına gidiyor ve dokunmatik hedefi büyütüldü (17 px yüksekti).
- **Sayfa:** `<title>`, açıklama, Open Graph ve Twitter kartı Türkçeleştirildi (sayfa dili `tr` iken İngilizce kalmıştı); `canonical`, `og:locale`, `theme-color` ve satır içi favicon eklendi; Türkçe 404 sayfası eklendi.
- **Test:** `test/duman.mjs` duman testi eklendi (sayfa açılışı, konsol hatası, oyun başlangıcı, duraklatma, Yenilikler, telefonda taşma, bot koşusu).

## v2.0 · Ekim 2026

Alacakaranlık meydanı, kızıl-altın-koyu yeşil yeniden tasarım; ayrıntı için README.
