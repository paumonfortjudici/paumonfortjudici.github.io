"""Files the card art of the folder: python -I -X utf8 art-src/sketchbook/cards.py   (after cards.mjs)

_build/thumb.png (720 x 900)  -> public/works/procreate/thumb.webp
_build/peek.png  (transparent) -> trimmed to its drawing -> public/works/procreate/peek.webp; prints its size (the registry and the cover deck need it)
"""
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, '_build')
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'public', 'works', 'procreate'))

thumb = Image.open(os.path.join(BUILD, 'thumb.png')).convert('RGB')
thumb.save(os.path.join(OUT, 'thumb.webp'), 'WEBP', quality=84, method=6)
print('thumb', thumb.size, os.path.getsize(os.path.join(OUT, 'thumb.webp')) // 1024, 'KB')

peek = Image.open(os.path.join(BUILD, 'peek.png')).convert('RGBA')
peek = peek.crop(peek.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())
peek.save(os.path.join(OUT, 'peek.webp'), 'WEBP', quality=92, method=6, exact=True)
print('peek', peek.size, os.path.getsize(os.path.join(OUT, 'peek.webp')) // 1024, 'KB')
