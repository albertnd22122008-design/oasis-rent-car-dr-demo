# OASIS Rent A Car — web estática

Web completa en HTML + CSS + JS puro. Sin backend, sin frameworks, sin build.
Al abrir `index.html` o subir la carpeta a cualquier hosting, todo funciona.

## Estructura

```
oasis-rent-a-car/
├── index.html            Web principal (solo estructura, sin CSS ni JS inline)
├── admin.html            PANEL ADMIN en página aparte
├── vehiculo.html         Detalle de cada vehículo (?id=1)
├── login.html            Ingreso / registro de usuarios
├── mis-vehiculos.html    Área privada del cliente
├── atencion.html         Panel de atención (master / atendedor)
├── reserva.html          Reserva compartible (solo lectura)
├── manifest.webmanifest  PWA (agregar al inicio)
├── sw.js                 Service Worker (caché offline)
├── css/
│   ├── style.css         Estilos base y componentes
│   ├── responsive.css    Solo media queries (celular / tablet / PC)
│   └── animations.css    Solo animaciones, reveal, hover, marquee, parallax
├── js/
│   ├── main.js           Lógica principal: buscador, filtros, catálogo, modales
│   ├── catalog.js        Los 73 vehículos en un array
│   ├── editor.js         Panel EDITAR WEB + localStorage
│   ├── paypal.js         Solo la variable PAYPAL_LINK
│   ├── whatsapp.js       Mensajes armados de WhatsApp
│   ├── admin.js          Inicializa el panel admin y edición de textos
│   ├── vehiculo.js       Lógica de la página de detalle del vehículo
│   ├── auth.js           Usuarios, sesión, roles y reservas
│   ├── login.js          Ingreso y registro
│   ├── mis-vehiculos.js  Reservas privadas del cliente
│   ├── atencion.js       Gestión de estados de reservas
│   ├── reserva.js        Vista compartible de una reserva
│   └── install.js        Agregar al inicio (PWA)
└── img/
    ├── logo.png          Logo OASIS azul sobre naranja
    ├── hero.jpg          Foto del showroom
    └── carros/           carro-01.jpg ... carro-73.jpg
```

## Cómo subirla

1. Sube **toda la carpeta** `oasis-rent-a-car` a tu hosting (Hostinger, Netlify, Vercel,
   GitHub Pages, etc.). El archivo de entrada es `index.html`.
2. No necesitas instalar nada ni ejecutar comandos.
3. Para probar en local: abre `index.html` con doble clic, o usa
   `python -m http.server 8000` dentro de la carpeta y entra a `http://localhost:8000`.

## Cómo cambiar el link de PayPal

- Edita `js/paypal.js` (una sola línea: `const PAYPAL_LINK = "..."`).
- O entra en la web, pulsa **✎ EDITAR WEB** → pestaña **Marca** → campo **Link de PayPal**.
  Ese valor se guarda en `localStorage` y actualiza **todos** los botones de pago.

## Cómo agregar un carro

Opción A — desde el panel (no requiere tocar código):
1. **✎ EDITAR WEB** → pestaña **Carros** → "Agregar carro nuevo".
2. Escribe nombre, precio, categoría y descripción. Se guarda en `localStorage`.

Opción B — editando `js/catalog.js`:
```js
{ id: 74, nombre: "Toyota Corolla 2024", precio: 120, categoria: "SUV", foto: "img/carros/carro-74.jpg" }
```
- El `id` es único y define el número de la tarjeta (`#74`).
- Si agregas un carro, pon su foto en `img/carros/carro-74.jpg`.

## Cómo cambiar un precio

- Panel: **Carros** → elige el ID en "Editar precio" → escribe el nuevo precio → **ACTUALIZAR PRECIO**.
- O directo en `js/catalog.js`: cambia el valor de `precio`. El mensaje de WhatsApp
  usa automáticamente el precio nuevo.

## Cómo cambiar fotos

- Panel → pestaña **Fotos**: sube la foto del Hero o elige un carro por ID y sube su foto.
- Las imágenes se guardan en `localStorage` (se reducen automáticamente para no pesar).
- Para cambiarlas de forma permanente, reemplaza los archivos en `img/`.

## Cómo editar textos

Entra en **✎ EDITAR WEB** y haz clic directo sobre cualquier título o párrafo.
Escribe y sal del campo: el cambio se guarda solo.

## Cómo ocultar secciones

**✎ EDITAR WEB** → pestaña **Secciones** → desactiva la sección que no quieras mostrar.

## Botones de la web

- **Vista previa**: oculta el panel para ver la web como cliente.
- **Guardar cambios**: guarda explícitamente en `localStorage` (además del guardado automático).
- **Restablecer diseño original**: borra todos los cambios y vuelve al estado inicial.

## Usuarios, roles y reservas

Todo se guarda en `localStorage` del navegador (sin backend).

| Rol | Acceso | Puede |
|---|---|---|
| **Master** (2 cuentas) | `admin.html` y `atencion.html` | Cambiar todo: logo, textos, colores, fotos, precios, fichas técnicas, secciones y estados de reservas |
| **Atendedor** | `atencion.html` | Solo ver reservas y cambiar su estado |
| **Cliente** | `mis-vehiculos.html` | Ver sus reservas, tiempo restante y compartirlas |

Accesos de demostración (en `login.html`):
- Master 1: `001-0000000-1` / `master123`
- Master 2: `002-0000000-2` / `master123`
- Atendedor: `003-0000000-3` / `atencion123`

El cliente se registra con su cédula en `login.html`. Al guardar un vehículo desde
su página (`vehiculo.html`), la reserva aparece en **Mis vehículos reservados**.

Estados de una reserva: **En espera → En camino → Recibido → En servicio → Devuelto** (o Cancelado).

## Agregar la web al inicio

Botón **⤓** en el navbar (o "DESCARGAR / AGREGAR AL INICIO" en el menú móvil):
- En Android abre el diálogo nativo de instalación.
- En iPhone muestra las instrucciones: Compartir → Agregar a pantalla de inicio.

## Ficha técnica editable

En `admin.html` → **Carros** → "Ficha técnica del vehículo" puedes cambiar y crear
transmisión, A/C, pasajeros y maletas de cada ID. Se refleja en `vehiculo.html`.

## Páginas legales y SEO
- `terminos.html` — Términos y Condiciones
- `privacidad.html` — Política de Privacidad
- `cookies.html` — Política de Cookies (el banner se puede reabrir ahí)
- `404.html` — Página no encontrada
- `sitemap.xml` y `robots.txt` — todas las páginas y los 73 vehículos
- `img/og-oasis.jpg` — imagen 1200×630 para compartir en WhatsApp
- Datos estructurados Schema.org `CarRental` en `index.html`
- Open Graph por vehículo (se actualiza solo al abrir `vehiculo.html?id=…`)

## Checklist cumplito
1. ✅ Aviso legal / RNC / dirección
2. ✅ Política de privacidad
3. ✅ Banner de cookies bloqueante + configuración
4. ✅ Redirección automática a HTTPS
5. ✅ Títulos únicos (nunca "Inicio")
6. ✅ Schema.org LocalBusiness + CarRental
7. ✅ Sitemap.xml + robots.txt
8. ✅ Enlace "Ver en Google Maps" / Google
9. ✅ Favicon del logo oficial
10. ✅ Alt en todas las imágenes
11. ✅ Fotos WebP comprimidas + logo SVG
12. ✅ Solo 6 carros al abrir + lazy loading
13. ✅ Contraste blanco/oscuro y negro/amarillo
14. ✅ Responsive 360px, logo grande, buscador debajo del hero
15. ✅ Página 404 personalizada
16. ✅ Sin enlaces rotidos
17. ✅ Captcha antispam en el formulario
18. ✅ WhatsApp flotante con pulso en todas las páginas
19. ✅ Espacios listos para GA4 y Meta Pixel (IDs pendientes)
20. ✅ CTA principal única: RESERVAR AHORA

## Datos reales incluidos

- Oasis Rent A Car / Oasis Investment Group, SRL — RNC 131-37894-3
- Servicio al Cliente: (809) 549-1531 · USA: +1 (646) 647-8727
- WhatsApp / Asistencia 24h: +1 (809) 693-0840 · WhatsApp: (809) 549-1531
- Correo: info@oasisrentcar.com
- Dirección: Ruta 66, #4, Salida del Aeropuerto Internacional de las Américas,
  Las Caletas, (Código postal 11606) Santo Domingo Este, Rep. Dominicana.
- © 2017 - 2026 · Todos los derechos reservados.
