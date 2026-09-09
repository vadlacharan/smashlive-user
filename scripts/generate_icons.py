#!/usr/bin/env python3
"""Generate SmashLive app icons using assets/shuttlecock (2).png, centered at ~50%."""
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import math, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'assets')
SRC = os.path.join(BASE, 'shuttlecock (2).png')
SRC_IMG = Image.open(SRC).convert('RGBA')

def radial_gradient(size, c1, c2):
    img = Image.new('RGB', size)
    px = img.load()
    cx, cy = size[0] / 2, size[1] * 0.32
    max_d = math.hypot(cx, cy)
    for y in range(size[1]):
        for x in range(size[0]):
            d = math.hypot(x - cx, y - cy) / max_d
            t = min(1.0, d * 1.1)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img

def centered_logo(canvas_size, ratio=0.50):
    """Shuttlecock pasted in the middle, taking `ratio` of the canvas."""
    logo = SRC_IMG
    target = int(canvas_size * ratio)
    logo = logo.resize((target, target), Image.LANCZOS)
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    canvas.paste(logo, ((canvas_size - target) // 2, (canvas_size - target) // 2), logo)
    return canvas

# iOS / app icon — the shuttlecock PNG itself, centered at 55% on dark charcoal
icon = radial_gradient((1024, 1024), (0x16, 0x2E, 0x22), (0x0B, 0x0F, 0x0D)).convert('RGBA')
bloom = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
ImageDraw.Draw(bloom).ellipse([184, 102, 840, 922], fill=(57, 255, 136, 30))
bloom = bloom.filter(ImageFilter.GaussianBlur(120))
icon = Image.alpha_composite(icon, bloom)
icon = Image.alpha_composite(icon, centered_logo(1024, 0.55))
icon.convert('RGB').save(os.path.join(BASE, 'icon.png'))

# splash icon (transparent bg — sits on native splash backgroundColor)
centered_logo(512, 0.55).save(os.path.join(BASE, 'splash-icon.png'))

# android adaptive
Image.new('RGB', (432, 432), (0x0B, 0x0F, 0x0D)).save(os.path.join(BASE, 'android-icon-background.png'))
centered_logo(432, 0.50).save(os.path.join(BASE, 'android-icon-foreground.png'))
# monochrome: white silhouette
mono = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
logo = SRC_IMG.resize((216, 216), Image.LANCZOS)
alpha = logo.getchannel('A')
white = Image.new('RGBA', logo.size, (255, 255, 255, 255))
white.putalpha(alpha)
mono.paste(white, (108, 108), white)
mono.save(os.path.join(BASE, 'android-icon-monochrome.png'))

# web favicon
fav = radial_gradient((96, 96), (0x16, 0x2E, 0x22), (0x0B, 0x0F, 0x0D)).convert('RGBA')
fav = Image.alpha_composite(fav, centered_logo(96, 0.55))
fav.convert('RGB').save(os.path.join(BASE, 'favicon.png'))

print('icons regenerated with shuttlecock (2).png at ~50%')