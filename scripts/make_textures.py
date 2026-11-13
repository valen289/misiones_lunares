"""Genera las texturas web del globo a partir del CGI Moon Kit de NASA SVS (ID 4720).

Uso: python3 -I make_textures.py <dir_descargas> <dir_salida>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
R_KM = 1737.4

src = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

# --- Color (equirectangular, centrado en longitud 0) ---
color8k = Image.open(src / "lroc_color_poles_8k.tif").convert("RGB")
for w, q in ((2048, 84), (4096, 82)) if "--normals-only" not in sys.argv else ():
    im = color8k.resize((w, w // 2), Image.LANCZOS)
    im.save(out / f"moon-color-{w // 1024}k.jpg", quality=q, optimize=True, progressive=True)

# --- Normal map desde la elevacion LOLA (km) ---
dem = np.asarray(Image.open(src / "ldem_16.tif"), dtype=np.float64)


def normal_map(h: np.ndarray, width: int, exaggeration: float) -> Image.Image:
    img = Image.fromarray(h.astype(np.float32), mode="F").resize((width, width // 2), Image.BILINEAR)
    h = np.asarray(img, dtype=np.float64)
    rows, cols = h.shape
    dlon = 2 * np.pi / cols
    dlat = np.pi / rows
    lat = (0.5 - (np.arange(rows) + 0.5) / rows) * np.pi
    coslat = np.maximum(np.cos(lat), 0.05)[:, None]
    # Este: la longitud crece hacia la derecha; envolver en el antimeridiano
    dh_east = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) / (2 * R_KM * coslat * dlon)
    # Norte: la fila 0 es el polo norte (y crece hacia el sur)
    up = np.vstack([h[:1], h[:-1]])
    down = np.vstack([h[1:], h[-1:]])
    dh_north = (up - down) / (2 * R_KM * dlat)
    # Cerca de los polos la proyeccion se degenera (filas muy cortas): atenuar el relieve
    # para que no aparezcan rayas radiales.
    fade = np.clip((np.cos(lat)[:, None] - 0.035) / 0.14, 0.0, 1.0)
    nx = -dh_east * exaggeration * fade
    ny = -dh_north * exaggeration * fade
    nz = np.ones_like(h)
    n = np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx / n, ny / n, nz / n], axis=-1)
    rgb = np.clip((rgb * 0.5 + 0.5) * 255.0 + 0.5, 0, 255).astype(np.uint8)
    return Image.fromarray(rgb, mode="RGB")


for w in (2048, 4096):
    normal_map(dem, w, exaggeration=6.0).save(out / f"moon-normal-{w // 1024}k.jpg", quality=86, optimize=True)

for f in sorted(out.iterdir()):
    print(f.name, f.stat().st_size // 1024, "KB")
