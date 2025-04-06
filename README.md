# 🎥 MCH Scraper API

API para scrapear contenido de [monoschino2.com](https://monoschino2.com), separada en dos servicios:  
- **API principal** (scraping estático, deploy en Vercel)  
- **Microservicio externo** (scraping dinámico con Playwright, deploy en Railway)

---

## 🌐 Endpoints disponibles

### `GET /api/main`

Scrapea la página principal de Monoschino2 y devuelve:
- Últimos episodios
- Carrusel
- Series recientes

**Ejemplo:**
```
GET /api/main
```

---

### `GET /api/anime?url=<url>`

Scrapea información detallada de una serie:  
título, descripción, géneros, imagen y lista de episodios.

**Parámetros:**
- `url`: URL completa de la serie (debe empezar con `https://monoschino2.com/anime/...`)

**Ejemplo:**
```
GET /api/anime?url=https://monoschino2.com/anime/jujutsu-kaisen-tv
```

**Respuesta:**
```json
{
  "title": "Jujutsu Kaisen (TV)",
  "description": "Yuji Itadori...",
  "genres": ["Acción", "Sobrenatural"],
  "episodes": [
    {
      "number": "1",
      "title": "Ryomen Sukuna",
      "url": "https://monoschino2.com/ver/jujutsu-kaisen-1"
    },
    ...
  ]
}
```

---

### `GET /api/watch?url=<url>`

Obtiene el `iframe` del reproductor de video de un episodio.  
Usa el microservicio externo con Playwright para manejar contenido dinámico.

**Parámetros:**
- `url`: URL de episodio (`https://monoschino2.com/ver/...`)

**Ejemplo:**
```
GET /api/watch?url=https://monoschino2.com/ver/guilty-gear-strive-dual-rulers-1
```

**Respuesta:**
```json
{
  "iframe": "https://re.animepelix.net/redirect.php?id=https://re.ironhentai.com/face.php?id=Strive-01"
}
```

> ⚠️ Esta ruta tiene **cacheo local por 1 hora** (memoria en caliente).

---

## ⚙️ Desarrollo local

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env`:

```env
PLAYWRIGHT_SERVICE_URL=https://playwright-x-service-production.up.railway.app/api/watch
```

3. Correr servidor local:

```bash
npm run dev
```

---

## 🚀 Deploy

| Ruta | Servicio | Plataforma |
|------|----------|------------|
| `/api/main`, `/api/anime` | Scraping estático (Cheerio) | Vercel |
| `/api/watch` | Scraping dinámico (Playwright) | Railway |

---

## 🧠 Cacheo

- El servicio `/api/watch` implementa cacheo con `Map()` en memoria.
- TTL (tiempo de vida): `1 hora`
- Evita pedir repetidamente el iframe al microservicio.

---

## 👨‍💻 Autor

**Leandro González Matkovich**  
🛠 Técnico Universitario en Programación – UTN  
🌐 [GitHub](https://github.com/silentM4gician)  
📧 leandrogonzalezmatkovich@gmail.com