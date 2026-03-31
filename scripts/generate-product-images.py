"""
Generate professional product images for LookKuan clothing store.
Creates beautiful gradient-based product mockup images with Thai text.
"""
import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'product-images')
os.makedirs(OUTPUT_DIR, exist_ok=True)

SIZE = (800, 800)

# ─── Product definitions ────────────────────────────────────
PRODUCTS = [
    # Existing seed products
    {"file": "polo-white.png", "name": "เสื้อโปโลขาว", "emoji": "👔", "colors": [(255,255,255), (240,240,240)], "accent": (249,115,22)},
    {"file": "polo-navy.png", "name": "เสื้อโปโลกรม", "emoji": "👔", "colors": [(30,41,82), (20,28,58)], "accent": (100,140,220)},
    {"file": "polo-black.png", "name": "เสื้อโปโลดำ", "emoji": "👔", "colors": [(35,35,40), (20,20,25)], "accent": (180,180,180)},
    {"file": "tshirt-round-white.png", "name": "เสื้อยืดคอกลมขาว", "emoji": "👕", "colors": [(250,250,252), (235,235,240)], "accent": (56,189,248)},
    {"file": "tshirt-round-black.png", "name": "เสื้อยืดคอกลมดำ", "emoji": "👕", "colors": [(40,40,45), (25,25,30)], "accent": (249,115,22)},
    {"file": "pants-long-black.png", "name": "กางเกงขายาวสีดำ", "emoji": "👖", "colors": [(30,30,35), (15,15,20)], "accent": (160,160,170)},
    {"file": "pants-long-navy.png", "name": "กางเกงขายาวสีกรม", "emoji": "👖", "colors": [(25,35,70), (15,22,50)], "accent": (100,150,230)},
    {"file": "skirt-black.png", "name": "กระโปรงสั้นสีดำ", "emoji": "👗", "colors": [(35,35,40), (22,22,27)], "accent": (236,72,153)},
    {"file": "dress-floral.png", "name": "ชุดเดรสลายดอก", "emoji": "👗", "colors": [(255,228,230), (252,205,210)], "accent": (244,63,94)},
    {"file": "cap-brand.png", "name": "หมวกแก๊ปปักโลโก้", "emoji": "🧢", "colors": [(20,20,25), (35,35,42)], "accent": (249,115,22)},
    # New products
    {"file": "jacket-zip-black.png", "name": "แจ็กเก็ตซิปหน้าดำ", "emoji": "🧥", "colors": [(30,30,38), (18,18,24)], "accent": (200,200,210)},
    {"file": "jacket-zip-navy.png", "name": "แจ็กเก็ตซิปกรม", "emoji": "🧥", "colors": [(22,32,68), (14,20,48)], "accent": (120,160,240)},
    {"file": "tshirt-oversize-white.png", "name": "เสื้อยืด Oversize ขาว", "emoji": "👕", "colors": [(248,248,250), (232,232,238)], "accent": (168,85,247)},
    {"file": "tshirt-oversize-black.png", "name": "เสื้อยืด Oversize ดำ", "emoji": "👕", "colors": [(38,38,44), (22,22,28)], "accent": (34,211,238)},
    {"file": "sport-shirt-red.png", "name": "เสื้อกีฬาแดง", "emoji": "⚽", "colors": [(220,38,38), (185,28,28)], "accent": (255,255,255)},
    {"file": "sport-shirt-blue.png", "name": "เสื้อกีฬาน้ำเงิน", "emoji": "⚽", "colors": [(37,99,235), (29,78,216)], "accent": (255,255,255)},
    {"file": "polo-pink.png", "name": "เสื้อโปโลชมพู", "emoji": "👔", "colors": [(251,207,232), (244,182,214)], "accent": (219,39,119)},
    {"file": "shorts-khaki.png", "name": "กางเกงขาสั้นกากี", "emoji": "👖", "colors": [(195,176,145), (175,155,125)], "accent": (120,90,50)},
    {"file": "school-shirt.png", "name": "เสื้อนักเรียนปักชื่อ", "emoji": "🏫", "colors": [(248,248,252), (235,235,242)], "accent": (37,99,235)},
    {"file": "company-uniform.png", "name": "ยูนิฟอร์มบริษัท", "emoji": "🏢", "colors": [(240,240,245), (225,225,232)], "accent": (249,115,22)},
]


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_radial_gradient(draw, cx, cy, radius, center_color, edge_color, img_size):
    """Draw a radial gradient."""
    for r in range(radius, 0, -2):
        t = 1 - (r / radius)
        color = lerp_color(edge_color, center_color, t)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def draw_fabric_texture(img, base_color, density=80):
    """Add subtle fabric-like texture."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    random.seed(hash(str(base_color)))
    for _ in range(density):
        x = random.randint(0, w - 1)
        y = random.randint(0, h - 1)
        offset = random.randint(-8, 8)
        c = tuple(max(0, min(255, base_color[i] + offset)) for i in range(3))
        length = random.randint(3, 12)
        angle = random.random() * math.pi
        x2 = x + int(length * math.cos(angle))
        y2 = y + int(length * math.sin(angle))
        draw.line([(x, y), (x2, y2)], fill=c + (30,), width=1)


def draw_clothing_shape(draw, product, w, h, accent):
    """Draw a simplified clothing silhouette."""
    emoji = product["emoji"]

    # Common: draw subtle hanger or display line
    mid_x = w // 2

    if emoji in ("👕", "👔"):
        # T-shirt / Polo shape
        points = [
            (mid_x - 180, 200), (mid_x - 100, 170), (mid_x - 40, 180),
            (mid_x + 40, 180), (mid_x + 100, 170), (mid_x + 180, 200),
            (mid_x + 160, 320), (mid_x + 110, 310),
            (mid_x + 110, 580), (mid_x - 110, 580),
            (mid_x - 110, 310), (mid_x - 160, 320),
        ]
        draw.polygon(points, fill=accent + (25,), outline=accent + (50,))
        # Collar
        draw.arc([mid_x - 45, 165, mid_x + 45, 210], 0, 180, fill=accent + (60,), width=2)

    elif emoji == "👖":
        # Pants shape
        points = [
            (mid_x - 120, 160), (mid_x + 120, 160),
            (mid_x + 130, 380), (mid_x + 20, 380),
            (mid_x, 350),
            (mid_x - 20, 380), (mid_x - 130, 380),
        ]
        # Extend to full length
        draw.polygon([
            (mid_x - 120, 160), (mid_x + 120, 160),
            (mid_x + 140, 580), (mid_x + 10, 580),
            (mid_x, 400),
            (mid_x - 10, 580), (mid_x - 140, 580),
        ], fill=accent + (20,), outline=accent + (40,))
        # Waistband
        draw.rectangle([mid_x - 125, 155, mid_x + 125, 175], fill=accent + (30,))

    elif emoji == "👗":
        # Dress / Skirt shape
        draw.polygon([
            (mid_x - 60, 180), (mid_x + 60, 180),
            (mid_x + 50, 250), (mid_x + 160, 580),
            (mid_x - 160, 580), (mid_x - 50, 250),
        ], fill=accent + (20,), outline=accent + (40,))
        # Straps
        draw.line([(mid_x - 40, 130), (mid_x - 60, 180)], fill=accent + (50,), width=3)
        draw.line([(mid_x + 40, 130), (mid_x + 60, 180)], fill=accent + (50,), width=3)

    elif emoji == "🧥":
        # Jacket shape
        draw.polygon([
            (mid_x - 190, 200), (mid_x - 110, 170), (mid_x - 30, 185),
            (mid_x + 30, 185), (mid_x + 110, 170), (mid_x + 190, 200),
            (mid_x + 170, 340), (mid_x + 120, 330),
            (mid_x + 120, 590), (mid_x + 5, 590),
            (mid_x + 5, 200),
            (mid_x - 5, 200),
            (mid_x - 5, 590), (mid_x - 120, 590),
            (mid_x - 120, 330), (mid_x - 170, 340),
        ], fill=accent + (20,), outline=accent + (40,))
        # Center zip line
        draw.line([(mid_x, 185), (mid_x, 590)], fill=accent + (50,), width=2)

    elif emoji == "🧢":
        # Cap shape
        draw.ellipse([mid_x - 160, 250, mid_x + 160, 450], fill=accent + (20,), outline=accent + (40,))
        draw.rectangle([mid_x - 170, 370, mid_x + 170, 410], fill=accent + (25,))
        # Brim
        draw.ellipse([mid_x - 180, 380, mid_x + 100, 480], fill=accent + (15,), outline=accent + (35,))

    elif emoji in ("⚽",):
        # Sport shirt - more athletic shape
        points = [
            (mid_x - 200, 210), (mid_x - 110, 170), (mid_x - 40, 185),
            (mid_x + 40, 185), (mid_x + 110, 170), (mid_x + 200, 210),
            (mid_x + 170, 330), (mid_x + 120, 320),
            (mid_x + 115, 560), (mid_x - 115, 560),
            (mid_x - 120, 320), (mid_x - 170, 330),
        ]
        draw.polygon(points, fill=accent + (25,), outline=accent + (50,))
        # V-neck
        draw.polygon([(mid_x - 30, 185), (mid_x, 230), (mid_x + 30, 185)], fill=accent + (35,))
        # Number on chest
        draw.text((mid_x - 20, 310), "10", fill=accent + (40,))

    else:
        # Generic clothing
        draw.rounded_rectangle([mid_x - 140, 200, mid_x + 140, 560], radius=20, fill=accent + (18,), outline=accent + (35,))


def draw_brand_tag(draw, w, h, accent):
    """Draw a small brand tag."""
    tag_x, tag_y = w - 120, h - 80
    draw.rounded_rectangle([tag_x, tag_y, tag_x + 90, tag_y + 35], radius=6, fill=accent + (50,))
    draw.text((tag_x + 8, tag_y + 6), "LookKuan", fill=(255, 255, 255, 120))


def draw_decorative_elements(draw, w, h, accent):
    """Add decorative dots/circles."""
    random.seed(42)
    for _ in range(5):
        x = random.randint(50, w - 50)
        y = random.randint(50, h - 50)
        r = random.randint(3, 8)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=accent + (15,))


def generate_product_image(product):
    w, h = SIZE
    c1, c2 = product["colors"]
    accent = product["accent"]

    # Create base image with gradient
    img = Image.new('RGBA', (w, h), c1 + (255,))
    draw = ImageDraw.Draw(img)

    # Draw diagonal gradient background
    for y in range(h):
        for x in range(0, w, 4):  # Step by 4 for performance
            t = (x / w * 0.5 + y / h * 0.5)
            t = max(0, min(1, t))
            color = lerp_color(c1, c2, t)
            draw.rectangle([x, y, x + 4, y + 1], fill=color)

    # Add subtle radial highlight
    highlight = lerp_color(c1, (255, 255, 255), 0.15)
    draw_radial_gradient(draw, w // 2, h // 3, 350, highlight + (60,), c1 + (0,), (w, h))

    # Make it RGBA for transparency effects
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Draw clothing silhouette
    draw_clothing_shape(overlay_draw, product, w, h, accent)

    # Draw decorative elements
    draw_decorative_elements(overlay_draw, w, h, accent)

    # Draw brand tag
    draw_brand_tag(overlay_draw, w, h, accent)

    # Composite
    img = Image.alpha_composite(img, overlay)

    # Add very subtle noise/texture
    draw_fabric_texture(img, c1, density=120)

    # Convert to RGB for saving as PNG
    final = Image.new('RGB', (w, h), (255, 255, 255))
    final.paste(img, mask=img.split()[3])

    # Apply slight blur to smooth out
    final = final.filter(ImageFilter.GaussianBlur(radius=0.5))

    filepath = os.path.join(OUTPUT_DIR, product["file"])
    final.save(filepath, 'PNG', quality=95)
    print(f"  ✓ {product['file']} — {product['name']}")
    return filepath


if __name__ == '__main__':
    print(f"\n🎨 Generating {len(PRODUCTS)} product images...\n")

    for product in PRODUCTS:
        generate_product_image(product)

    print(f"\n✅ Done! Images saved to: {os.path.abspath(OUTPUT_DIR)}")
    print(f"   Total: {len(PRODUCTS)} images")
