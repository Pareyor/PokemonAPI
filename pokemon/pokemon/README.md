# ⚡ PokéPulse: TCG Arena

> Juego de cartas Pokémon fullstack: **colección por usuario**, **sobres que se abren como los de verdad** (cortas el sobre con el dedo y deslizas las cartas) y **combates por turnos resueltos en el servidor**.

> ℹ️ El Modo Historia RPG está aparcado hasta que el juego de cartas esté afianzado. Su código está archivado en `~/Desktop/PokemonApi/archivo-modo-historia/` (no estaba en git).

---

## 🌟 Tecnologías y Arquitectura

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + TypeScript** | Creado con **Vite**, **Tailwind CSS** y componentes interactivos con iconos **Lucide React**. Efectos de brillo holográfico Foil en cartas, sprites oficiales de PokeAPI y animaciones de combate. |
| **Backend** | **Java 21 + Spring Boot 3.4.3** | Arquitectura REST limpia: Controllers, Services, Repositorios con `JpaSpecificationExecutor`, Entidades JPA y DTOs con Java Records. |
| **Base de Datos** | **PostgreSQL 16 en Docker** | Contenedor persistente configurado en el puerto libre `5434` vía `docker-compose.yml`. |
| **Documentación API** | **OpenAPI 3 / Swagger UI** | Swagger interactivo para probar todas las operaciones y endpoints en tiempo real. |
| **IDE & Tooling** | **Visual Studio Code** | Configuración nativa en `.vscode` con tareas de ejecución automatizadas y perfiles de depuración. |

---

## 📐 Puertos Asignados en Localhost

Para convivir con cualquier otro servicio existente en tu máquina:

- 🌐 **Frontend (React Vite)**: `http://localhost:3001`
- ⚙️ **Backend (Spring Boot API)**: `http://localhost:8089`
- 📖 **Swagger UI Interactivo**: `http://localhost:8089/swagger-ui.html`
- 🗄️ **Base de Datos PostgreSQL (Docker)**: `localhost:5434` (BD: `pokemon_db`, Usuario: `pokemon_user`)

---

## 🚀 Inicio Rápido (1 Solo Paso)

### Opción A: Desde la Terminal
```bash
cd "/Users/pareyor/Desktop/pokemon"
./start.sh
```

El script se encargará de:
1. Comprobar que Docker esté activo.
2. Iniciar el contenedor de PostgreSQL 16 en el puerto 5434.
3. Arrancar el backend Spring Boot precompilado en el puerto 8089.
4. Cargar la baraja inicial de 10 Pokémon icónicos (Pikachu, Charizard, Blastoise, Mewtwo, etc.) y 500 PokéMonedas iniciales.
5. Iniciar el servidor Vite de React en el puerto 3001.

Para detener todos los servicios en cualquier momento:
```bash
./stop.sh
```

---

### Opción B: Ejecución por Terminales Separadas

Si prefieres tener el control en pestañas independientes:

#### 1. Terminal 1: Base de Datos (Docker)
```bash
cd "/Users/pareyor/Desktop/pokemon"
docker compose up
```

#### 2. Terminal 2: Backend (Spring Boot)
```bash
cd "/Users/pareyor/Desktop/pokemon/backend"
mvn spring-boot:run
```
*(O directamente el ejecutable JAR: `java -jar target/pokepulse-backend-1.0.0.jar`)*

#### 3. Terminal 3: Frontend (React + TypeScript)
```bash
cd "/Users/pareyor/Desktop/pokemon/frontend"
npm run dev
```
Luego abre: **[http://localhost:3001](http://localhost:3001)**

---

## 🎮 Características y Mecánicas del Juego

### 1. 🎴 Colección y Álbum de Cartas (CRUD Completo)
- **Visualización de Cartas**: Tarjetas con degradados por tipo elemental, insignias de rareza (*Común, Infrecuente, Rara, Épica, Legendaria*) y efecto de brillo holográfico *Holo Foil*.
- **Gestión de Mazo**: Selecciona hasta 5 cartas activas para llevarlas a la Arena de Combate.
- **Subida de Nivel (+Stats)**: Invierte PokéMonedas para incrementar el nivel de tus cartas, aumentando permanentemente su salud (HP), ataque, defensa, velocidad y daño de habilidades.
- **Reciclaje de Cartas**: Recicla cartas duplicadas o que no uses para obtener monedas según su rareza.
- **Filtros Avanzados**: Búsqueda en vivo por nombre o ataque, filtro por tipo elemental (Fuego, Agua, Planta, Eléctrico, etc.) y filtro de solo cartas en mazo.

### 2. 📦 Tienda y Apertura de Sobres (Booster Packs estilo TCG)
- **Estructura de booster real (10 cartas)**: 4 Comunes, 3 Infrecuentes, 1 Reverse Holo, 1 Reverse Holo "alta" (puede dar Épicas+) y el **slot de Rara siempre al fondo**. Sin especies repetidas dentro del mismo sobre.
- **3 expansiones** (`BASIC` 100, `KANTO_MASTERS` 200, `LEGENDARY_ECLIPSE` 350 monedas) con **probabilidades publicadas** por slot en `GET /api/packs/catalog`.
- **God Pack**: con baja probabilidad las 10 cartas son Épica o superior.
- **Pity**: tras N sobres seguidos sin Legendaria, el slot de rara la garantiza (15 / 10 / 6 según expansión).
- **Comprar ≠ abrir**: los sobres se compran sellados (de 1 a 10) y se abren cuando quieras.
- **Mesa de apertura**: desliza el dedo por la parte superior para cortar el sobre (borde dentado), la tira sale volando y el mazo sale del sobre. Desliza cada carta hacia cualquier lado para ver la siguiente; las cartas especiales salen **boca abajo con un aura** del color de su rareza y les das la vuelta tú. Marca **NUEVA** para especies que no tenías. También funciona con teclado (Enter / Espacio / flechas).

### 3. ⚔️ Arena de Combate por Turnos (resuelta en el servidor)
- **El servidor es la autoridad**: el cliente solo envía la acción; daño, efectos, IA y recompensa se calculan en el backend. No se pueden falsear victorias ni monedas.
- **Acciones**: Ataque rápido (+34% energía), Ataque especial (energía al 100%), Proteger (-60% daño, falla si se repite), Cambiar y Rendirse.
- **Orden de turno por Velocidad**; Proteger y Cambiar tienen prioridad. Parálisis reduce la velocidad a la mitad.
- **Efectos de carta reales**: 🔥 Quemadura (daño por turno), ⚡ Parálisis (puede perder el turno), 💚 Curación (recupera parte del daño), 💥 Crítico asegurado.
- **Tabla de tipos completa (18 tipos)**: súper eficaz ×1.5, poco eficaz ×0.7, inmune ×0.4.
- **Hasta 6 cartas por equipo**; si se debilita tu Pokémon eliges relevo. El banquillo rival está oculto hasta que sale.
- **4 rivales con equipos de 6 e IA de 3 niveles** (Brock ★, Blaine ★★, Azul ★★, Cynthia ★★★ elige relevos con ventaja de tipo y se protege cuando vas a usar el especial).
- Los combates se pueden **retomar** tras recargar la página; empezar otro con uno a medias cuenta como derrota.

### 4. 🛠️ Forja de Cartas Personalizadas
- Las cartas forjadas son *proxies*, como en el TCG real: **no son legales en la Arena**, reciclarlas no da monedas y solo ellas se pueden editar.
- Crea cartas Pokémon a tu medida seleccionando cualquier número de Pokédex oficial (para cargar automáticamente el sprite original), tipo elemental, estadísticas numéricas, dos poderes personalizados y efecto holográfico.

---

## 🔐 Cuentas y monedas
- Todos los endpoints de cartas, sobres, entrenador, Pokédex y combates **requieren sesión** (`Authorization: Bearer <token>` de `/api/auth/login`). Sin ella → `401`; recursos de otro usuario → `404`.
- Cada usuario tiene su colección, su mazo, sus sobres y sus monedas (única fuente: `app_users.coins`). Los usuarios nuevos reciben un mazo de bienvenida.
- Cuentas demo: `entrenador / pokemon123` y `admin / admin123`.
- **Monedas infinitas para pruebas**: `pokepulse.dev.infinite-coins: true` en `backend/src/main/resources/application.yml`. Ponlo a `false` para jugar con economía real.
- Bono diario de 150 monedas: una vez cada 24 h.

## 📡 Endpoints de la API REST

Documentación interactiva en **[http://localhost:8089/swagger-ui.html](http://localhost:8089/swagger-ui.html)** (pulsa *Authorize* y pega el token).

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` · `/api/auth/register` | Iniciar sesión / registrarse. Devuelve el token. |
| `GET` | `/api/cards` | Tus cartas, con filtros (`search`, `type`, `rarity`, `inDeck`). |
| `GET` | `/api/cards/{id}` | Detalle de una carta tuya. |
| `POST` | `/api/cards` | Forjar carta personalizada. |
| `PUT` | `/api/cards/{id}` | Editar una carta forjada. |
| `PATCH` | `/api/cards/{id}/deck` | Añadir o quitar del mazo (máx. 5). |
| `POST` | `/api/cards/{id}/level-up` | Subir de nivel. |
| `DELETE` | `/api/cards/{id}` | Reciclar carta por monedas. |
| `GET` | `/api/packs/catalog` | Expansiones, precios, slots, probabilidades y sobres hasta el pity. |
| `POST` | `/api/packs/purchase?type=...&quantity=1` | Comprar sobres sellados (1-10). `201`. |
| `GET` | `/api/packs/sealed` | Sobres sellados pendientes. |
| `POST` | `/api/packs/sealed/{id}/open` | Abrir un sobre sellado. `409` si ya estaba abierto. |
| `POST` | `/api/packs/open?type=...` | Comprar y abrir en un paso (compatibilidad). |
| `GET` | `/api/trainer/profile` | Perfil, monedas y estadísticas. |
| `POST` | `/api/trainer/claim-bonus` | Bono diario (`409` si aún no está disponible). |
| `GET` | `/api/pokedex` · `/api/pokedex/stats` | Pokédex con lo que tienes / te falta. |
| `GET` | `/api/battle/opponents` | Rivales con equipo, dificultad y recompensa. |
| `POST` | `/api/battle/start` | `{ opponentId, cardIds[] }` → empieza un combate. |
| `POST` | `/api/battle/{id}/action` | `{ action: ATTACK\|SPECIAL\|GUARD\|SWITCH\|FORFEIT, switchTo? }` → eventos del turno. |
| `GET` | `/api/battle/active` · `/api/battle/{id}` | Retomar / consultar combate. |
| `GET` | `/api/battle/records` | Tus últimos 20 combates. |

## 🧪 Tests

```bash
cd backend && mvn test
```
Cubren el generador de sobres (estructura, probabilidades publicadas, pity, god packs) y el motor de combate (orden por velocidad, energía, Proteger, relevos, efectos, IA).
