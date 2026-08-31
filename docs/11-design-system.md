# Design System Standard

Gunakan dokumen ini sebagai acuan saat memulai project baru atau menormalisasi project yang sudah berjalan. Cukup ganti nilai token (warna, font, radius) tanpa mengubah struktur sistem.

---

## 1. Prinsip Desain

1.  **Hierarchy dulu, dekorasi kemudian.** Selesaikan apa yang harus dipahami user terlebih dahulu, apa yang harus dilakukan selanjutnya, baru tentukan styling.
2.  **Coherence over novelty.** Lebih baik sistem yang konsisten daripada kumpulan komponen yang terlihat polished tapi tidak nyambung.
3.  **Content-driven composition.** Pilih layout berdasarkan konten dan tugas, bukan template default (hindari centered hero / 50:50 split / 3 kartu equal secara otomatis).
4.  **Beban kognitif rendah.** Hanya minta input yang berubah, otomatiskan sisanya. Satu layar = satu tugas utama yang jelas.
5.  **Tanpa dekorasi tanpa alasan.** Jangan tambah gradient, glow, glass, blur hanya karena terlihat modern/AI/tech. Setiap elemen visual harus punya alasan produk.
6.  **Aksesibilitas adalah default.** Kontras, focus indicator, touch target, dan semantic structure bukan tambahan di akhir.

---

## 2. Design Tokens

Implementasikan sebagai **CSS Custom Properties** agar bisa dipakai di framework apapun (CSS murni, Tailwind, Uno, vanilla-extract, dsb).

### 2.1 Warna — Semantic, bukan literal

Jangan menamai warna `blue-500` atau `lime`. Gunakan peran semantik:

```css
:root {
  /* Ground */
  --color-bg: #f7f8f2; /* page background */
  --color-surface: #ffffff; /* card / panel */
  --color-surface-muted: #eef1e6; /* subdued surface, segmented control, stat tile */

  /* Text */
  --color-text: #14241a; /* primary — kontras tinggi */
  --color-text-muted: #5c6b60; /* secondary / caption */
  --color-text-inverse: #ffffff; /* di atas surface gelap */

  /* Border */
  --color-border: #e3e7da; /* hairline — semua divider & card border */
  --color-border-strong: #14241a; /* untuk input focus, outline */

  /* Action */
  --color-primary: #caf85a; /* CTA utama */
  --color-primary-hover: #b5e83f;
  --color-primary-soft: #eef8cf; /* background icon, hover muted */
  --color-primary-bg: #f5fbe4; /* tint paling muda */

  /* Inverted surface (untuk emphasis / status live) */
  --color-inverted: #1b3a2a;
  --color-inverted-hover: #234a37;

  /* Semantic */
  --color-success: #2f9e5a;
  --color-warning: #e8a723;
  --color-error: #e5533d;
  --color-info: #3d7de5;
}
```

**Aturan pakai:**

- `bg` untuk page, `surface` untuk card, `surface-muted` untuk control/tiles.
- `primary` hanya untuk 1 aksi dominan per view. Jangan pakai primary untuk semua button.
- `inverted` untuk menarik atensi (mis. banner status, header aktif) — pakai hemat.
- `border` konsisten `1px` untuk semua card. Jangan mix border + shadow + outline sekaligus tanpa alasan.

> Untuk ganti brand, cukup override 6 variabel pertama — komponen lain ikut berubah tanpa refactor.

### 2.2 Tipografi — 3 peran

```css
:root {
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif; /* heading / hero */
  --font-body: 'Inter', system-ui, sans-serif; /* body / UI */
  --font-mono: 'JetBrains Mono', ui-monospace, monospace; /* numerik / meta */
}
```

| Peran       | Font           | Ciri                                                                 | Pakai untuk                                  |
| ----------- | -------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| **Display** | `font-display` | `font-weight 700–800`, `letter-spacing -0.02em`, `line-height 0.9–1` | Judul screen `32–48px`, hero number          |
| **Body**    | `font-body`    | `400–600`, `line-height 1.5`                                         | Paragraf, label, navigation                  |
| **Mono**    | `font-mono`    | `tabular-nums`, `500–700`                                            | Angka, durasi, timestamp, meta `12 · 8 sets` |

Skala acuan (bukan harga mati, jaga konsistensi):
`12/16 · 14/20 · 16/24 · 18/28 · 20/28 · 24/32 · 30/36 · 36/40 · 48/1`

Aturan:

- Sentence case default. Jangan uppercase dekoratif kecuali akronim / brand.
- Jangan pakai ultra-bold atau monospace sebagai dekorasi tanpa fungsi.
- Judul dan label pendukung harus punya hierarki jelas (size + weight + muted).

### 2.3 Spacing & Radius

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --radius-xs: 8px;
  --radius-sm: 12px; /* default card */
  --radius-md: 16px;
  --radius-lg: 24px; /* hero / emphasis card */
  --radius-xl: 32px;
  --radius-full: 9999px; /* pill button, tab indicator */
}
```

- Vocabulary terbatas: jangan invent `13px` atau `18px` tanpa alasan.
- Nested radius: jika gap <32px → `inner = outer − gap` (hanya jika hasil >2px).
- Layout page: `max-width 640–720px` centered untuk mobile-first, padding horizontal `20px`, vertical `24px`, bottom `112px` jika ada bottom nav.

### 2.4 Surfaces

- **Page** = `bg` tanpa border.
- **Card** = `surface + 1px border + radius-sm`.
- **Hero/Emphasis** = `primary atau inverted + radius-lg + padding 24px`.
- Satu surface = satu peran. Hindari double-frame (card di dalam card dengan border sama kuat).

### 2.5 Selection & Scrollbar

```css
::selection {
  background: var(--color-primary);
  color: var(--color-text);
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
*:hover {
  scrollbar-color: var(--color-border) transparent;
}
```

---

## 3. Layout & Komposisi

Pilih komposisi secara intentional:

`centered · asymmetric · split · editorial · modular · dense-data · list-first · table-first · detail-first`

Jangan default ke centered hero, 50/50 split, atau card di mana-mana. Tentukan:

1. Apa yang harus dipahami user pertama kali.
2. Apa yang harus dilakukan selanjutnya.
3. Apa yang mendukung keputusan tersebut.
4. State sistem apa yang relevan (empty, populated, live, stale).

**Shell generik (opsional, sesuaikan kebutuhan):**

```
Header sticky (border-bottom, backdrop-blur)
  ├─ Brand (kiri)
  └─ Context action (kanan, mis. status / CTA sekunder)

Main max-w-2xl centered
  └─ Stack vertikal: space-y-6 untuk section, space-y-3 untuk list

Navigation (opsional)
  └─ Bottom fixed (mobile) atau sidebar (desktop)
     └─ Active = pill bg-primary, inactive = text-muted
```

Sembunyikan navigasi global saat user berada di mode fokus (mis. form panjang, player, editor) untuk mengurangi distraksi. Ganti dengan sticky action bar di bawah.

---

## 4. Komponen — Prinsip (bukan implementasi framework)

Komponen dipilih berdasarkan **tugas dan relasi konten**, bukan estetika. Pilih dengan sengaja: `card · list · table · panel · divider · chart · plain content`.

### 4.1 Button — 4 variant maksimal

| Variant           | Visual                     | Pakai                                             |
| ----------------- | -------------------------- | ------------------------------------------------- |
| **Primary**       | `bg-primary text-text`     | 1 aksi utama per view                             |
| **Inverted/Dark** | `bg-inverted text-inverse` | CTA di atas surface primary / aksi final di modal |
| **Outline**       | `border-2 border-strong`   | Aksi sekunder                                     |
| **Ghost**         | `text-muted hover:text`    | Tersier / batal                                   |

- Bentuk: `rounded-full padding 12–16px vertical, 24px horizontal, font-bold`.
- State wajib: default, hover, focus (`ring 2px`), active/pressed, disabled (`bg-muted / text-muted 60%`), loading.
- Label harus spesifik: `Simpan ke riwayat` bukan `Submit`; `Tambah latihan` bukan `Learn more`.

**IconButton** — `44×44px, rounded-lg`. Active `bg-inverted text-inverse`, idle `bg-muted hover:bg-primary-soft`.

### 4.2 Card / Panel

`surface + border + radius-sm + padding 16–20px`. Jika clickable: `cursor-pointer hover:border-strong/30`.

Jangan jadikan setiap KPI/testimoni/konten sebagai card. Gunakan list/divider/plain jika lebih jujur terhadap hierarki.

### 4.3 Chip & Badge

- **Chip** — `rounded-full px-10px py-4px text-xs font-semibold`. Tone: `muted` (`bg-muted`), `primary` (`bg-primary`), `inverted` (`bg-inverted text-inverse`).
- **Badge** — Chip + dot `8px` di kiri. Tone semantik: success/warning/error/info dengan background `12–15% opacity`.

### 4.4 Input & Control

- Input: `border-2 border-strong` saat focus, `type=number` tanpa spinner untuk numerik cepat.
- Segmented control: `bg-muted p-4px rounded-xl`, active `bg-inverted text-inverse rounded-lg`.
- Search: `border-2 border-strong rounded-md` + icon.

### 4.5 Modal / Sheet

- Overlay `bg-text/40`, konten `bg-surface`.
- Mobile: bottom sheet `rounded-t-xl`, desktop: centered `max-w-md rounded-xl`.
- Header `font-display 20–24px` + IconButton close.
- Pakai untuk: picker, konfirmasi, summary — jangan untuk navigasi utama.

### 4.6 Empty State

`border-2 dashed border + surface + padding 56px vertical + centered`. Isi: icon, title `font-display 20px`, desc `text-muted text-sm max-w-sm`, action opsional.

### 4.7 Data States

Dukung minimal: `empty · populated · loading · error · stale · permission`. Jangan pakai browser alert generik untuk error produk.

---

## 5. Iconography & Ornamen

- Style: line icon, grid 24px, `stroke-width ~2.2`, `round cap/join`, `aria-hidden`.
- Jangan ulang pola "icon generik di kotak rounded" tanpa alasan produk.
- Ornamen (mis. spark, mascot, squiggle) dipakai sebagai **watermark** `opacity 5%` di hero card, atau sebagai ilustrasi empty state — bukan di setiap card.
- Satu set icon cukup. Jangan mix fill + line + duotone tanpa sistem.

---

## 6. Interaction & States

- **Hover** — `transition-colors` saja. Jangan ubah layout saat hover.
- **Focus** — wajib terlihat. Satu indikator per kontrol (`ring 2px`). Jangan stack outline + border + focus-within sekaligus.
- **Row interaction** — hover/focus harus edge-to-edge dalam container, bukan terpotong padding/rounded wrapper.
- **Compound control** — jika kontrol ada di dalam container berbordir, bedakan hierarki visualnya; jangan double-frame.
- **Destructive** — `text-error` atau `bg-error text-inverse`, selalu butuh konfirmasi modal.
- **Informasi status** — jangan andalkan warna saja (tambah dot, label `W`, atau icon).

---

## 7. Motion

Motion opsional, bukan default. Tanya dulu: perlu animasi? Untuk apa? Alat paling sederhana apa?

| Tujuan                    | Alat                              |
| ------------------------- | --------------------------------- |
| Hover / press / color     | CSS `transition`                  |
| Mount sederhana           | CSS `@starting-style`             |
| Animasi predetermined     | CSS `animation`                   |
| Kontrol programatik       | WAAPI                             |
| Spring / gesture / layout | Library motion (hanya jika perlu) |

- Prefer `transform` & `opacity`. Hindari animasi `width/height/margin/top/left` kecuali butuh layout animation.
- Jangan enter dari `scale(0)`. Gunakan scale subtle.
- Easing: enter `ease-out` (`cubic-bezier(0.23,1,0.32,1)`), move `ease-in-out` (`0.77,0,0.175,1`), hover `ease`.
- Durasi: press `100–160ms`, tooltip/popover `125–200ms`, dropdown `150–250ms`, modal/drawer `200–500ms`. Frequent UI <300ms.
- Hormati `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 8. Responsif & Aksesibilitas

- **Responsif = rekomposisi**, bukan mengecilkan. `sm = 640px` sebagai titik ubah `grid 1→2`, `flex-col→row`, `sheet→centered modal`.
- **Touch target** minimal `44px` (`size-11`, `py-12px`). `touch-none` untuk drag handle.
- **Keyboard** — semua interaktif punya `focus-visible` yang reliable, urutan tab logis.
- **Semantic** — pakai `header`, `main`, `nav`, `button`, `label`, `aria-*` yang benar.
- **Kontras** — teks utama vs background harus lolos WCAG AA. Jangan andalkan warna saja untuk state (tambah label/icon).
- **Line length** — jaga `45–75` karakter per baris untuk body text.

---

## 9. Konten

- Jangan pakai Lorem Ipsum, John Doe, atau metrik kredibilitas palsu. Gunakan konten plausibel yang kontekstual.
- Bahasa konkret, active voice. Hindari buzzword generik (`Elevate`, `Seamless`, `Unleash`, `Next Gen`, `Unlock your potential`).
- Angka pakai `mono + tabular-nums` agar tidak loncat saat berubah.

---

## 10. Anti-Patterns (AI Convergence Guardrails)

Jika beberapa muncul bersamaan tanpa alasan produk yang kuat, reconsider:

- Sans-serif generik tanpa reasoning, monospace dekoratif, uppercase micro-label di mana-mana, numbered eyebrow `01 — OVERVIEW` berulang
- Gradient biru-ungu, gradient text di mana-mana, dark + neon glow untuk "tech/AI"
- Glassmorphism di mana-mana, rounded-card di mana-mana, pill button di mana-mana
- Centered hero default, 50/50 split default, 3 kartu fitur equal
- Max-width & spacing yang diulang mekanis, icon generik di kotak rounded di mana-mana, floating glass-pill nav, fade-up di semua elemen, satu easing untuk semua, 300ms untuk semua, dashboard/stats palsu, terminal window hanya untuk kredibilitas, blob/grid/sparkle dekoratif tanpa tujuan

Ini peringatan, bukan larangan mutlak. Pakai pola umum jika memang tepat untuk produk.

---

## 11. Cara Mengadopsi di Project Baru

1.  Copy token di §2 ke `index.css` / `globals.css` / `tokens.css` project baru.
2.  Ganti nilai warna & font sesuai brand — nama variabel tetap.
3.  Terapkan aturan tipografi & spacing sebelum styling komponen.
4.  Bangun komponen base (`Button`, `Panel`, `Chip`, `Input`, `Modal`, `EmptyState`) mengikuti prinsip §4 — sesuaikan implementasi dengan framework (React/Vue/Svelte/HTML).
5.  Tentukan komposisi (§3) berdasarkan tugas utama user, bukan template.
6.  Audit anti-patterns (§10) sebelum rilis.

### Checklist Build Order

1. Context & task
2. Hierarchy
3. Content structure
4. Composition
5. Typography
6. Color & surfaces
7. Components
8. Responsive
9. States
10. Motion (secukupnya)
11. Accessibility
12. Content realism & polish

---

_Standar ini framework-agnostic — bisa dipakai di React, Vue, Svelte, Astro, atau HTML murni. Implementasi boleh berbeda, sistem tetap sama._
