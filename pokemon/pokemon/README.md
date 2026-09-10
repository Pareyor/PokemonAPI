# ⚡ PokéPulse TCG & Battle Arena

> Plataforma Fullstack de Cartas Coleccionables Pokémon, Simulador de Apertura de Sobres (Booster Packs) y Arena de Combates por Turnos con Ventajas Elementales.

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

### 2. 📦 Tienda y Apertura de Sobres (Booster Packs)
- **3 Tipos de Sobres con Probabilidades Distintas**:
  - 🔵 **Sobre Básico PokéPulse** (100 monedas): 3 cartas variadas.
  - 🟣 **Sobre Maestros de Kanto** (200 monedas): 4 cartas, ¡al menos 1 Rara garantizada!
  - 🟡 **Sobre Eclipse Legendario** (350 monedas): 5 cartas, ¡al menos 1 Épica o Legendaria garantizada!
- **Animación de Rasgado y Revelación**: Toca cada carta oculta para voltearla y descubrir su rareza y efectos visuales. Se guardan automáticamente en tu base de datos de PostgreSQL.

### 3. ⚔️ Arena de Combate Pokémon por Turnos
- **4 Entrenadores Rivales con Equipos Únicos**:
  - 🪨 **Líder Brock** (Geodude, Onix, Golem) — Fácil (+100 monedas)
  - 🔥 **Líder Blaine** (Rapidash, Arcanine, Magmar) — Media (+180 monedas)
  - 🦅 **Rival Azul** (Pidgeot, Alakazam, Blastoise) — Difícil (+250 monedas)
  - 🐉 **Campeona Cynthia** (Spiritomb, Lucario, Garchomp) — Extrema (+400 monedas)
- **Sistema de Ventaja Elemental (Daño Súper Eficaz)**:
  - Fuego vence a Planta (+50% daño)
  - Agua vence a Fuego (+50% daño)
  - Planta vence a Agua (+50% daño)
  - Eléctrico vence a Agua (+50% daño)
  - Lucha vence a Normal/Siniestro (+50% daño)
  - Psíquico vence a Lucha (+50% daño)
  - Dragón vence a Dragón (+50% daño)
- **Habilidades y Poderes Especiales**:
  - **Ataque Básico** (Ataque físico o elemental rápido).
  - **Poder Especial** (Gran daño con efectos adicionales como Quemadura, Parálisis, Auto-curación o Daño Crítico).
- Barras dinámicas de salud (HP), cálculo según el Ataque del atacante vs Defensa del defensor, turno según Velocidad (SPD) y registro de combate en tiempo real.

### 4. 🛠️ Forja y Creador de Cartas Personalizadas (CRUD Create/Update)
- Crea cartas Pokémon a tu medida seleccionando cualquier número de Pokédex oficial (para cargar automáticamente el sprite original), tipo elemental, estadísticas numéricas, dos poderes personalizados y efecto holográfico.

---

## 📡 Endpoints de la API REST

Documentación interactiva disponible en:
👉 **[http://localhost:8089/swagger-ui.html](http://localhost:8089/swagger-ui.html)**

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/cards` | Listar cartas con filtros (`search`, `type`, `rarity`, `inDeck`). |
| `GET` | `/api/cards/{id}` | Detalle completo de una carta. |
| `POST` | `/api/cards` | Crear nueva carta personalizada. |
| `PUT` | `/api/cards/{id}` | Actualizar datos de una carta. |
| `PATCH` | `/api/cards/{id}/deck` | Añadir o quitar del mazo de combate (máx 5). |
| `POST` | `/api/cards/{id}/level-up` | Subir de nivel e incrementar estadísticas. |
| `DELETE` | `/api/cards/{id}` | Reciclar/eliminar carta y recibir monedas. |
| `POST` | `/api/packs/open?type=...` | Abrir sobre booster (`BASIC`, `KANTO_MASTERS`, `LEGENDARY_ECLIPSE`). |
| `GET` | `/api/trainer/profile` | Datos del entrenador, saldo de monedas y récords. |
| `POST` | `/api/trainer/claim-bonus` | Reclamar bono de 150 monedas gratis. |
| `GET` | `/api/battle/opponents` | Listar líderes rivales disponibles para combatir. |
| `POST` | `/api/battle/record` | Registrar resultado de combate y premiar monedas. |
