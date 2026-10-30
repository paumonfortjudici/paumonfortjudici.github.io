"""Last step of the portfolio PDF: python -I -X utf8 art-src/pdf/finish.py

Takes art-src/pdf/_build/portfolio-raw.pdf (Chrome's print of the HTML) and writes export/Pau-Monfort-Portfolio-2026.pdf with a clean
bookmark list (Chrome's outline drops the space of any title that wraps), the document properties and the streams compressed.
Needs PyMuPDF (pip install pymupdf).
"""
import json
import os

import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '_build', 'portfolio-raw.pdf')
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'export', 'Pau-Monfort-Portfolio-2026.pdf'))
meta = json.load(open(os.path.join(HERE, '_build', 'toc.json'), encoding='utf8'))

doc = pymupdf.open(RAW)
doc.set_toc(meta['toc'])
doc.set_metadata({
    'title': meta['title'],
    'author': meta['author'],
    'subject': 'Portfolio 2026: branding, editorial design, illustration and front-end development',
    'keywords': 'graphic design, branding, editorial, illustration, front-end, Barcelona',
    'creator': 'art-src/pdf (HTML to PDF with Chrome)',
    'producer': 'PyMuPDF',
})
os.makedirs(os.path.dirname(OUT), exist_ok=True)
doc.save(OUT, garbage=4, deflate=True, deflate_fonts=True, clean=True)
print(f'{OUT}  {doc.page_count} pages  {os.path.getsize(OUT) // 1024} KB')
