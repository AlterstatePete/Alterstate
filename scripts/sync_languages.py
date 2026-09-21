"""Optional maintenance helper. The resulting site needs no Python or build step.

Edit root HTML/data-fi copy and METADATA below, then run this script to synchronize
the static Finnish pages and search metadata. Uses only Python's standard library.
"""
from html import escape, unescape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = 'https://alterstate.studio'
METADATA = {
    'index': {
        'en': ('ALTERSTATE Studio', 'Advertising films, brand videos and social content. ALTERSTATE Studio combines creative direction with AI-assisted production, from first idea to final edit.'),
        'fi': ('ALTERSTATE Studio', 'Mainosfilmit, brändivideot ja somevideot yrityksille. ALTERSTATE Studio yhdistää luovan suunnittelun ja tekoälyavusteisen tuotannon ideasta valmiiksi videoksi.'),
    },
    'work': {
        'en': ('Films & videos | ALTERSTATE Studio', 'Explore a selection of films and visual stories. Contact ALTERSTATE Studio to discuss your next video, from the first idea to the final edit.'),
        'fi': ('Videot | ALTERSTATE Studio', 'Tutustu valikoimaan videoita ja visuaalisia tarinoita. Ota yhteyttä ALTERSTATE Studioon ja suunnitellaan seuraava videosi ideasta valmiiksi.'),
    },
    'services': {
        'en': ('Video production services & pricing | ALTERSTATE Studio', 'Video production from €600, VAT 0%. Concepts, complete films, editing and help with existing footage. Get a quote based on your project’s scope.'),
        'fi': ('Videotuotannon palvelut ja hinnat | ALTERSTATE Studio', 'Videotuotanto alkaen 600 € (ALV 0 %). Ideointi, kokonaiset videot, leikkaus ja olemassa olevan materiaalin viimeistely. Pyydä tarjous projektistasi.'),
    },
    'about': {
        'en': ('About our video production studio | ALTERSTATE Studio', 'Meet ALTERSTATE, an independent creative video studio for brands, companies and agencies. Human creative direction with AI-assisted production.'),
        'fi': ('Tutustu videotuotantostudioon | ALTERSTATE Studio', 'ALTERSTATE on itsenäinen videotuotantostudio yrityksille, brändeille ja mainostoimistoille. Yhdistämme luovan näkemyksen ja tekoälyavusteisen tuotannon.'),
    },
    'contact': {
        'en': ('Contact us about your video | ALTERSTATE Studio', 'An early idea, a ready-to-produce video or help with an existing film. Contact ALTERSTATE Studio: pete@alterstate.studio or +358 40 859 8077.'),
        'fi': ('Ota yhteyttä – suunnitellaan videosi | ALTERSTATE Studio', 'Alustava idea, valmis suunnitelma tai apua olemassa olevaan videoon. Ota yhteyttä: pete@alterstate.studio tai +358 40 859 8077.'),
    },
}
LABELS = {
    'Language': 'Kieli', 'Main navigation': 'Päänavigaatio',
    'Mobile navigation': 'Mobiilinavigaatio', 'Open menu': 'Avaa valikko',
    'ALTERSTATE Studio — home': 'ALTERSTATE Studio — etusivu',
    'Video carousel': 'Videokaruselli', 'Choose video': 'Valitse video',
    'Previous video': 'Edellinen video', 'Next video': 'Seuraava video',
    'Close video': 'Sulje video',
}
PLACES = dict(zip(
    ['Norway', 'Faroe Islands', 'Switzerland', 'Iceland', 'The Ocean', 'New Zealand'],
    ['Norja', 'Färsaaret', 'Sveitsi', 'Islanti', 'Valtameri', 'Uusi-Seelanti']))


def page_url(page, language):
    directory = '/fi/' if language == 'fi' else '/'
    return SITE_URL + directory + ('' if page == 'index' else page + '/')


def navigation(source, language):
    """Normalize internal page links; keep assets, fragments and external links intact."""
    def anchor(match):
        tag = match[0]
        href = re.search(r'href="([^"]+)"', tag)
        if not href:
            return tag
        route = re.fullmatch(r'(?:\.\./|/)?(?:fi/)?(index|work|services|about|contact)?(?:\.html)?/?', href[1])
        if not route:
            return tag
        choice = re.search(r'data-lang-choice="(en|fi)"', tag)
        lang = choice[1] if choice else language
        target = page_url(route[1] or 'index', lang).removeprefix(SITE_URL)
        return tag.replace(href[0], f'href="{target}"')
    return re.sub(r'<a\b[^>]*>', anchor, source)


def metadata(source, page, language):
    title, description = METADATA[page][language]
    source = re.sub(r'    <!-- SEO START -->.*?    <!-- SEO END -->\n', '', source, flags=re.S)
    source = re.sub(r'    <meta (?:name="description"|property="og:[^"]+")[^>]*>\n', '', source)
    source = re.sub(r'    <title>.*?</title>\n', '', source)
    source = re.sub(r'    <link rel="icon"[^>]*>\n', '', source)
    icon_prefix = '../' if language == 'fi' else ''
    source = source.replace('  </head>',
                            f'    <link rel="icon" href="{icon_prefix}favicon.ico?v=1" sizes="32x32">\n'
                            f'    <link rel="icon" type="image/svg+xml" href="{icon_prefix}favicon.svg?v=1">\n  </head>')
    locale = 'fi_FI' if language == 'fi' else 'en_GB'
    other_locale = 'en_GB' if language == 'fi' else 'fi_FI'
    url = page_url(page, language)
    tags = [
        '<!-- SEO START -->',
        f'<title>{escape(title)}</title>',
        f'<meta name="description" content="{escape(description, quote=True)}">',
        f'<link rel="canonical" href="{url}">',
    ]
    for lang in ('en', 'fi', 'x-default'):
        tags.append(f'<link rel="alternate" hreflang="{lang}" href="{page_url(page, "fi" if lang == "fi" else "en")}">')
    for key, value in {'type': 'website', 'site_name': 'ALTERSTATE Studio', 'title': title,
                       'description': description, 'url': url, 'locale': locale,
                       'locale:alternate': other_locale}.items():
        tags.append(f'<meta property="og:{key}" content="{escape(value, quote=True)}">')
    organization = {
        '@context': 'https://schema.org', '@type': 'Organization',
        '@id': SITE_URL + '/#organization', 'name': 'ALTERSTATE Studio',
        'url': SITE_URL + '/', 'email': 'pete@alterstate.studio',
        'telephone': '+358408598077',
        'contactPoint': {'@type': 'ContactPoint', 'contactType': 'customer enquiries',
                         'email': 'pete@alterstate.studio', 'telephone': '+358408598077',
                         'availableLanguage': ['English', 'Finnish']},
    }
    tags += ['<script type="application/ld+json">', json.dumps(organization, ensure_ascii=False, indent=2), '</script>', '<!-- SEO END -->']
    return source.replace('  </head>', '\n'.join('    ' + tag for tag in tags) + '\n  </head>')


def finnish_page(source, page):
    source = source.replace('<html lang="en">', '<html lang="fi">')
    # Translation-bearing elements contain only text, not nested markup.
    pattern = r'(<([a-z][a-z0-9]*)\b[^>]*\bdata-fi="([^"]*)"[^>]*>)([^<]*)(</\2>)'
    source = re.sub(pattern, lambda m: m[1] + escape(unescape(m[3]), quote=False) + m[5], source)
    source = source.replace('href="css/', 'href="../css/').replace('src="js/', 'src="../js/')
    source = re.sub(r'<nav class="language-switch".*?</nav>',
                    f'<nav class="language-switch" aria-label="Kieli"><a href="../{page}.html" lang="en" hreflang="en" data-lang-choice="en">EN</a><span class="language-divider" aria-hidden="true">/</span><a href="{page}.html" lang="fi" hreflang="fi" data-lang-choice="fi" class="active" aria-current="true">FI</a></nav>', source)
    for english, finnish in LABELS.items():
        source = source.replace(f'aria-label="{english}"', f'aria-label="{finnish}"')
    for english, finnish in PLACES.items():
        source = source.replace(f'alt="{english} nature video preview"', f'alt="{finnish} – luontovideon esikatselukuva"')
        for en_action, fi_action in [('Select video', 'Valitse video'), ('Play video', 'Toista video')]:
            source = source.replace(f'aria-label="{en_action}: {english}"', f'aria-label="{fi_action}: {finnish}"')
    source = source.replace('aria-roledescription="carousel"', 'aria-roledescription="karuselli"')
    source = source.replace('<h2 id="film-title">Film</h2>', '<h2 id="film-title">Video</h2>')
    source = source.replace('Enable JavaScript to use the video player. Language links and page content work without it.', 'Ota JavaScript käyttöön videotoistoa varten. Kielivalinta ja sivujen sisältö toimivat myös ilman JavaScriptiä.')
    return metadata(navigation(source, 'fi'), page, 'fi')


def main():
    (ROOT / 'fi').mkdir(exist_ok=True)
    urls = []
    for page in METADATA:
        path = ROOT / (page + '.html')
        source = metadata(navigation(path.read_text(encoding='utf-8'), 'en'), page, 'en')
        path.write_text(source, encoding='utf-8')
        finnish = finnish_page(source, page)
        (ROOT / 'fi' / path.name).write_text(finnish, encoding='utf-8')
        if page != 'index':
            # GitHub Pages serves directory/index.html at /directory/ natively.
            # Keep the original files for editing, file previews and old links.
            for language, html in [('en', source), ('fi', finnish)]:
                directory = ROOT / page if language == 'en' else ROOT / 'fi' / page
                directory.mkdir(parents=True, exist_ok=True)
                prefix = '../' if language == 'en' else '../../'
                html = re.sub(r'href="(?:\.\./)?css/', 'href="' + prefix + 'css/', html)
                html = re.sub(r'src="(?:\.\./)?js/', 'src="' + prefix + 'js/', html)
                html = re.sub(r'href="(?:\.\./)?favicon\.', 'href="' + prefix + 'favicon.', html)
                (directory / 'index.html').write_text(html, encoding='utf-8')
        urls.extend(page_url(page, language) for language in ('en', 'fi'))
    entries = '\n'.join(f'  <url><loc>{url}</loc></url>' for url in urls)
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + '\n</urlset>\n', encoding='utf-8')
    (ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n', encoding='utf-8')
    print('Updated source pages, GitHub Pages routes, sitemap.xml and robots.txt.')


if __name__ == '__main__':
    main()
