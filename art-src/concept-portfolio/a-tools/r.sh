#!/bin/bash
# usage: a-tools/r.sh <slide-number> <tag>   -> builds the slide, renders @2x, downsamples a 1x copy
N=$1; TAG=$2
SC="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad"
cd "C:/Users/User/Documents/Portofolio"
node art-src/concept-portfolio/a-tools/slide-$N.mjs --render --scale 2 --tag $TAG 2>&1 | grep -v '^{"out"' | tail -3
"$SC/venv/Scripts/python.exe" -I -X utf8 -c "
from PIL import Image
im=Image.open('$SC/art/concept-portfolio/slide-$N/$TAG@2x.png').convert('RGB')
im.resize((1080,1920),Image.LANCZOS).save('$SC/art/concept-portfolio/slide-$N/$TAG.png')
print('ok $TAG')
"
