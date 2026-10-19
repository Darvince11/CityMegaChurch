# Design System & Brand Identity

An elegant, welcoming, premium experience. Wine is the brand color; white dominates; brown is a warm accent used sparingly.

---

## 1. Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `--wine-900` (Deep Wine) | `#6B1F3A` | Primary brand; headers, footer background, primary buttons, links, active states |
| `--wine-800` (Secondary Wine) | `#7A2945` | Hover/active shades of primary |
| `--wine-700` | `#8C3457` | Pressed/interactive tint, gradients only subtle |
| `--warm-brown` | `#8A6240` | Subtle accents: section eyebrows, icons, dividers |
| `--soft-brown` | `#B89A7A` | Muted borders, secondary texture |
| `--warm-cream` | `#FAF7F2` | Page/section background alternation (never full-screen everywhere) |
| `--white` | `#FFFFFF` | Dominant surface |
| `--dark-text` | `#231F20` | Body text, headings emphasis |

**Semantic tokens:** `bg`, `surface`, `surface-muted`, `border`, `text-primary`, `text-muted`, `link`, `focus-ring`, `danger`, `success`, `warning` — all derived from the palette above.

### Accessibility contrast (verified pairings)
- Wine `#6B1F3A` on white → AA body/large text.
- White on Wine → AA.
- `#8A6240` used **only** as decoration/icon accents ≥ 4.5:1 against its background or otherwise lowered (large text/UI).
- Cream backgrounds use `#231F20` text (not gray) for AA.

---

## 2. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Fraunces** (serif, variable) | Premium, warm, spiritual serif; soft-warm optical sizes |
| Body | **Inter** | Editorial clarity, excellent on mobile |
| Numeric/Mono | **JetBrains Mono** (sparingly) | Registration numbers, references |

- Type scale tuned mobile-first (base 16px; display headings clamp down on small screens).
- Heading weights 500–650; avoid heavy/black weights (save for hero emphasis).
- Line length ≤ 65ch for reading content.

---

## 3. Layout & Radius

- **Radius:** subtle — `8px` cards, `12px` panels, `999px` pills/buttons. **No excessive rounded "blob" cards.**
- **Spacing:** 4px base scale; generous section padding (py-16/24) on public pages; compact in portals.
- **Grid:** max-width `1280px` containers; 12-col; gutters 16/24/32 by breakpoint.
- **Shadows:** soft `0 1px 2px rgba(35,31,32,.06), 0 8px 24px rgba(35,31,32,.08)` for elevation. No neon glows.

---

## 4. Imagery

- Authentic African/Ghanaian church photography (congregations, worship, community, camp).
- Photography is warm, candid, dignified — never cartoon-like or kitsch.
- Hero images: dark wine gradient overlay (#6B1F3A → transparent) for text legibility.
- Preferred orientation: hero 16:9/21:9 at widths ≥ 1400px; cards 4:3 or 1:1.

---

## 5. Component Specification (reusable set)

All built with **shadcn/ui primitives + Lucide icons**, customized via design tokens.

| Component | Specification |
|---|---|
| `Navbar` | Sticky, transparent-over-hero → white on scroll; links + "Give" pill (wine); mobile drawer (accessible, focus-trapped) |
| `Footer` | **Deep wine (#6B1F3A)** background, cream text; logo, About/Events/Camp/Fellowships/Sermons/Give links; service times; Wednesday/Thursday programs; contact + socials; current meeting info |
| `Hero` | Logo lockup, headline ("Welcome Home"), supporting message ("A place to grow in faith, build meaningful relationships and experience God together."), CTAs: **Plan Your Visit** (solid wine) + **Watch Latest Sermon** (outline cream); featured image |
| `Button` | Variants: primary (wine), secondary (outline), ghost, danger, link; sizes sm/md/lg; focus-visible ring (2px wine offset) |
| `Card` | Surface white, 1px border (`soft-brown/30`), radius 8px, subtle shadow, hover lift only on interactive cards |
| `EventCard` | Date block (wine), title, short description, time/location (dynamic), RSVP CTA |
| `CampCard` | Hero image, name/theme, dates, price, capacity indicator, CTA → `/camp/<slug>` |
| `SermonCard` | Thumbnail, title, preacher, date, scripture, duration badge; play icon |
| `StatCard` | Big number (wine), label, delta indicator |
| `StatusBadge` | Neutral/success/warning/danger/draft variants with dot |
| `Stepper` | Camp registration steps 1–6; numbered circles, current step wine-filled, done steps check |
| `MoMoPanel` | Network radio cards (MTN MoMo / Telecel Cash / AT Money) with recognizable brand colors applied subtly; phone input with country code; amount formatted in GHS |
| `QRDisplay` | Whitespace-framed QR with reference + "Download Confirmation" |
| `Table`, `Pagination`, `Tabs`, `Modal`, `Drawer`, `Toast`, `Alert`, `EmptyState`, `Skeleton`, `MobileMenu` | Standard shadcn patterns, themed to tokens |

---

## 6. Iconography

- **Lucide** throughout (consistent 1.5px stroke).
- Line icons preferred; avoid multi-color/branded icons (except MoMo network marks where used, kept muted).

---

## 7. Public vs Portal Surfaces

| Surface | Personality |
|---|---|
| Public site | Editorial: serif display headings, generous whitespace, cream section alternation, photography-led |
| Member portal | Calm utility: compact spacing, Inter-driven, front-door with dashboard cards |
| Admin portal | Dense-but-clean: sidebar (wine active state), tables, filters; not a generic SaaS look — wine accents and serif section titles keep brand identity |

---

## 8. Motion & Interaction

- Motion: 150–250ms ease-out; transitions on hover/focus only (no decorative loops).
- Respect `prefers-reduced-motion`.
- Focus states: 2px wine ring + offset, visible on keyboard.
- Touch targets ≥ 44px.

---

## 9. Accessibility Commitment

- Semantic HTML (header/nav/main/section/article/footer).
- Labels on all inputs (visible preferred); ARIA only when semantics insufficient.
- Form errors: announced via `role="alert"` + linked by `aria-describedby`.
- Color contrast AA (palette above), alt text on all meaningful images, captions for video.
- Keyboard: full tab order + focus-trapped modals/drawers + Escape behaviors.