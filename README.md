# Explorador de misiones lunares

Herramienta interactiva para comparar dónde y cuándo alunizaron las misiones a la Luna, sobre un globo 3D
con imágenes reales del Lunar Reconnaissance Orbiter (LRO).

- 28 alunizajes y 5 intentos fallidos, de Luna 9 (1966) a Blue Ghost e IM-2 (2025).
- Elegís hasta tres misiones (en el globo, la línea de tiempo o la lista) y las comparás: fecha, lugar, zona,
  distancia entre sitios, tiempo entre alunizajes, altura del Sol y de la Tierra en el cielo, fase lunar.
- "Iluminación como al alunizar": el globo se ilumina con la posición real del Sol en el instante del alunizaje.
- La comparación queda en la URL (`?m=apolo-11,change-4`) para compartirla, por ejemplo con un QR.

## Cómo correrlo

Requiere Node 20.19+ o 22.12+.

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm test          # pruebas de datos, geometría y astronomía
npm run build     # versión final en dist/ (se puede abrir desde cualquier hosting estático)
```

## Stack

React 19 + TypeScript, Vite, React Three Fiber / drei (Three.js), Zustand, Tailwind CSS 4, zod (validación
de datos) y astronomy-engine (posiciones del Sol, la Tierra y la Luna).

## Datos y metodología

El dataset vive en `src/data/missions.json` y se valida contra el esquema de `src/data/schema.ts` al cargar.
Cada fila tiene al menos una fuente.

- **Apolo**: coordenadas del módulo lunar según NSSDCA (medidas sobre imágenes LRO, Wagner et al. 2017).
- **Surveyor**: NSSDCA Master Catalog (posiciones determinadas con imágenes LRO).
- **Resto**: fichas de cada misión, que citan las identificaciones de LROC. Se cruzaron dos fuentes por misión;
  donde no coincidían se usó la posición identificada por LRO (por ejemplo, IM-1 está en 80,13° S y no en 84,9° S
  como figura en una de las listas).
- `coordPrecision: "nominal"` marca coordenadas históricas no confirmadas con LRO (Luna 9, Luna 13, Luna 17,
  Luna 21). La app las muestra como "aproximadas".
- `timePrecision: "dia"` marca misiones sin hora confiable; para ellas no se calcula la altura del Sol.

**Validación astronómica.** La altura del Sol calculada coincide con la de los informes de misión Apolo con un
margen de ±0,5° (`src/lib/astro.test.ts`). El Apolo 16 tenía planificados 11,9°, pero alunizó casi seis horas
tarde: el cálculo da 11,9° para la hora planificada y 14,8° para la real.

**Convención 3D.** La longitud 0 mira a la cámara, el este queda a la derecha y el norte arriba
(`src/lib/geo.ts`, con pruebas).

## Texturas

`public/textures/` se generó con `scripts/make_textures.py` a partir del
[CGI Moon Kit](https://svs.gsfc.nasa.gov/4720) del NASA Scientific Visualization Studio
(`lroc_color_poles_8k.tif` para el color y `ldem_16.tif` de LOLA para el relieve).
Hay versiones 2k (celulares) y 4k (pantallas grandes).

## Créditos

Mapa de la Luna: NASA/GSFC/Arizona State University (LRO), NASA SVS. Proyecto educativo independiente;
no es un producto oficial de la NASA y no usa sus logos.

## Próximas fases

1. ~~Base del proyecto, dataset verificado, globo 3D, comparador y línea de tiempo.~~
2. Vista de mapa 2D alternativa; separar etiquetas superpuestas (Apolo 12 y Surveyor 3 están a 180 m).
3. "La Luna desde Paysandú": cómo se veía la Luna desde Uruguay el día de cada alunizaje.
4. Modo kiosco para el evento (recorrido automático y reinicio por inactividad) y funcionamiento sin conexión.
5. Accesibilidad, rendimiento en celulares de gama baja y publicación.
