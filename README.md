# Un pequeño universo para Yadhira ✦

Regalo web de cumpleaños hecho con HTML, CSS, JavaScript y Three.js.

## Incluye en esta primera versión
- Libro 3D con tapa decorada, páginas y controles para girarlo.
- Apertura del libro que conduce a una carta de cumpleaños.
- Menú con álbum scrapbook, torta 3D interactiva y mensaje final.
- Torta con cielo de atardecer (foto 360° de Poly Haven, CC0).
- Corazones y pétalos flotando, música de fondo con botón ♪.
- Álbum interactivo: desde el celular se pueden subir fotos y escribir notas; se guardan en el dispositivo (IndexedDB).
- Diseño adaptable a celular y computadora.
- Textos iniciales editables.

## Créditos de recursos
- Cielo de atardecer: "Qwantani Sunset (Pure Sky)" de Poly Haven (https://polyhaven.com/a/qwantani_sunset_puresky), licencia CC0.
- Música: "Gymnopédie No. 1" de Erik Satie (composición de dominio público), grabación descargada desde Internet Archive.

## Cómo ejecutarlo
Three.js usa módulos JavaScript, por lo que no conviene abrir `index.html` directamente con doble clic.

1. Instala Visual Studio Code.
2. Abre la carpeta `regalo_yadhira`.
3. Instala la extensión **Live Server**.
4. Haz clic derecho en `index.html` y selecciona **Open with Live Server**.
5. Necesitas conexión a internet para cargar Three.js y las fuentes de Google Fonts desde sus CDN.

Alternativa con Python instalado:
```bash
python -m http.server 8000
```
Luego abre `http://localhost:8000`.

## Estructura
```text
regalo_yadhira/
├── index.html
├── styles.css
├── README.md
├── js/
│   ├── main.js
│   ├── book.js
│   └── cake.js
└── assets/
    └── fotos/
```

## Añadir las fotografías
Cuando tengas las fotos, copia los archivos a `assets/fotos/`. En esta versión, las tarjetas del álbum son marcadores visuales. El siguiente paso será conectar cada tarjeta a una imagen real y añadir un texto propio para cada recuerdo.

Recomendación de nombres:
- `recuerdo-01.jpg`
- `recuerdo-02.jpg`
- `recuerdo-03.jpg`
- `recuerdo-04.jpg`

Para mejores resultados, usa fotos JPG o WebP y evita archivos demasiado pesados.

## Personalización
- Cambia los textos de la carta y los mensajes en `index.html`.
- Colores, tamaños y estilo: `styles.css`.
- Animación y geometría del libro: `js/book.js`.
- Modelo y comportamiento de la torta: `js/cake.js`.
- Navegación: `js/main.js`.

## Notas técnicas
- El libro y la torta se construyen con geometrías 3D procedurales; todavía no son modelos escaneados o modelos externos de alta complejidad.
- Las páginas están representadas por láminas 3D y una animación básica. Una siguiente iteración puede añadir una animación más realista hoja por hoja, portada con tipografía renderizada y una textura de cuero.
- La música no está incluida todavía; se puede añadir un control de reproducción que respete la interacción del usuario y los permisos del navegador.
- No contiene seguimiento ni analítica.
