# ALTERSTATE Studio

A responsive English/Finnish video production website built with HTML5, CSS3 and vanilla JavaScript. No frameworks, packages, build tools or backend.

## Open

Open `index.html` directly. Page content, language switching and gallery controls work locally. YouTube thumbnails and video playback require an internet connection. Video images load from YouTube. The local `favicon.svg` and `favicon.ico` provide the browser tab icon; upload both at the domain root.

For an optional HTTP preview, run `python -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`. YouTube can restrict embeds on `file://`; every video dialog also has a direct YouTube link.

## Pages

- `index.html`: video carousel, a concise explanation of the production offer and contact details.
- `work.html`: video gallery.
- `services.html`: services, understated starting prices and open-ended guidance on concept development, full productions and work on existing videos.
- `about.html`: a short studio introduction.
- `contact.html`: a simple Contact us page with email, telephone and an invitation to start at any stage.
- `css/style.css`: shared visual styles and responsive layouts.
- `fi/`: complete Finnish versions of all five pages, readable without JavaScript.
- `js/main.js`: mobile menu, video navigation, player and legacy language-link handling.
- `sitemap.xml` and `robots.txt`: search discovery for the production domain.
- `scripts/sync_languages.py`: optional standard-library Python helper for keeping translations and metadata in sync.

## Edit content

Each page is complete HTML. Root pages are English; `fi/` pages are Finnish. Both work directly from disk without a build step. To maintain translations together, edit the root pages' `data-en` / `data-fi` attributes and default English text, then optionally run `python scripts/sync_languages.py`. This refreshes the committed Finnish pages, all directory-based route pages, and metadata. Run it after editing source pages so the public routes receive the same changes. You can also edit the HTML directly; subsequent synchronization overwrites Finnish copies and directory index files. Headings preserve intentional line breaks.

EN/FI are real links to the matching language version of the current page. Language comes from the document URL, with no cookie, browser-language or localStorage redirection. On HTTP(S), content and language links work without JavaScript. When opening files directly, JavaScript converts navigation links to local index files. Previously shared `?lang=fi` links redirect in JavaScript to the corresponding Finnish document; `?lang=en` is removed. GitHub Pages has no custom server redirect rules: old `.html` URLs remain readable and use JavaScript to reach the clean URL. Without JavaScript, their canonical tags point to the clean version. Queries and fragments survive the redirect; recognized `lang` parameters are removed after choosing the language.

## Videos

The gallery has a large play control, on-image arrows, labeled previous/next buttons, six selectable video thumbnails in a draggable, swipeable strip with a next-card preview and no visible scrollbar, left/right keyboard navigation and horizontal swipe support. It does not autoplay or auto-advance. Swiping suppresses the resulting click so it does not accidentally play the video. Native dialogs support Escape, focus trapping and focus restoration; closing removes the iframe to stop playback.

The six nature films are placeholders from Scenic Relaxation, not studio productions. Their thumbnails load directly from YouTube:

- Norway: https://www.youtube.com/watch?v=CxwJrzEdw1U
- Faroe Islands: https://www.youtube.com/watch?v=g1QR0RO1pbw
- Switzerland: https://www.youtube.com/watch?v=fyOVKyaKJq4
- Iceland: https://www.youtube.com/watch?v=Pbzn79TSRO0
- The Ocean: https://www.youtube.com/watch?v=eoTpdTU8nTA
- New Zealand: https://www.youtube.com/watch?v=vtxVK3sbZ0o

Replace the `films` array in `js/main.js`, the initial hero/thumbnail markup in `index.html`, and the gallery buttons in `work.html` with your own videos. Set `data-film` to a matching ID. Images come directly from `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg`; no local copies are used. Counts and previous/next wrapping use the array length.

Thumbnail requests go to YouTube's image CDN when pages load. Playback contacts `youtube-nocookie.com` only after Play is clicked. Embeds supply the actual HTTP(S) page origin, `playsinline=1` and a `strict-origin-when-cross-origin` referrer policy. No origin or referrer is fabricated.

YouTube requires an identifying HTTP Referer. When opened through `file://`, the site shows a direct YouTube option rather than attempting an embed that may fail with error 153. Use the loopback HTTP preview for embedded playback. Browser privacy settings, network filters, embedding restrictions or YouTube availability can still affect playback. The always-visible Watch on YouTube link is above the player. All six placeholders loaded in the localhost browser check; playback availability can change.

Official reference: https://developers.google.com/youtube/terms/required-minimum-functionality#embedded-player-api-client-identity

## Pricing

Prices appear only in `services.html`:

- Simple idea: starting at €600, VAT 0% / ALV 0%.
- Larger idea: starting at €1,000, VAT 0% / ALV 0%.

The pricing note explains that scope, video length, deliverables and revision rounds affect the quote, and that the price is agreed before production. Update both translations when changing prices. These are starting points, not fixed packages with promised durations or revision allowances.

## Contact

- Email: `pete@alterstate.studio`
- Phone: `+358 40 859 8077`

Real `mailto:` and `tel:` links appear on every page and prominently on the contact page. There is no email template or form. Direct mail and telephone links open the visitor’s own email or calling application. Contact copy welcomes early ideas, joint concept development, ready-to-produce briefs and specific work on existing videos. No messages are automatically sent or stored by the site.

## Design and maintenance

Edit the CSS variables at the top of `css/style.css` for colors and spacing. The site uses system fonts and YouTube-hosted thumbnails. It includes keyboard focus styles, a skip link, reduced-motion support and accessible gallery/menu state. No star symbols are used in the branding.

The fixed header starts with a masthead at the footer wordmark's font size and contracts with gently eased, transform-based scaling as you scroll. STUDIO begins larger and scales down with the wordmark; 95ms of time-based smoothing softens wheel and trackpad steps without changing native scrolling. A stable `.header-space` reserves the original height so the page does not jump. `measureHeader()` and `paintHeader()` in `js/main.js` control the scroll range and compact dimensions (112px desktop, 88px mobile). Returning to the top restores the large wordmark. Reduced-motion preferences disable the logo scaling animation.

## SEO and launch

Production domain: `https://alterstate.studio` (confirmed). English home canonical: `/`; Finnish home canonical: `/fi/`. Other public URLs use directories: `/services/`, `/work/`, `/about/`, `/contact/`, and the matching `/fi/` routes. GitHub Pages serves an `index.html` inside each directory. Each page includes its own canonical, reciprocal `en` / `fi` / `x-default` hreflang links, a unique localized title and description, and matching Open Graph metadata. English is the fallback language. Organization JSON-LD contains only the real studio name, website and contact details. Placeholder videos intentionally have no VideoObject markup or fabricated portfolio claims.

All ten URLs are listed in `sitemap.xml`; `robots.txt` allows crawling and links to the sitemap. Metadata and the domain are maintained in `scripts/sync_languages.py`. No automated build, dependency installation or backend is required to serve the resulting files.

At launch:

- Publish the whole site directory structure to GitHub Pages, including `work/`, `services/`, `about/`, `contact/`, all `fi/` subdirectories, and `.nojekyll`. These committed files need no build command. Keep the existing GitHub Pages custom-domain setting for `alterstate.studio` (and its CNAME file if present in your repository). The root-relative links target that domain root, not a github.io repository subpath.
- Enable HTTPS in GitHub Pages. GitHub Pages uses trailing slashes for directory URLs, so `/services` resolves to `/services/`. Direct visits and refreshes work because each route is a real directory page. No DNS change at Porkbun is needed for clean paths. The separate `alterstate.fi` domain forward should still target `https://alterstate.studio/fi/`.
- Replace the nature placeholders with studio work before promoting the portfolio. Update work-page metadata to describe actual projects then. Add an owned social-sharing image when available; no borrowed video thumbnail is used as the studio's social image.
- Verify the domain in Google Search Console, submit `/sitemap.xml`, and inspect both language versions after publishing. Check live performance/Core Web Vitals on the actual host; local checks cannot establish field performance or indexing.
- Keep private staging deployments access-controlled or marked noindex through hosting settings. The included robots file is for the public production site.

References: [Google multilingual guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions), [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
