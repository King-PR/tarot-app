# Tarot Matutino

Una aplicación web interactiva de tarot desarrollada con JavaScript y Three.js que permite a los usuarios descubrir su carta del día mediante una experiencia 3D.

## Descripción General

El objetivo del proyeto consistía en crear una página de tarot donde el usuario pueda hacer click en una carta boca abajo, la cual se voltea revelando una carta aleatoria con un mensaje inspirador para comenzar el día.

La aplicación utiliza renderizado 3D para crear una experiencia visualmente atractiva.

## Tabla de Contenidos

- [Instalación y Ejecución](#instalación-y-ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Arquitectura Técnica](#arquitectura-técnica)
- [Funcionamiento de Three.js](#funcionamiento-de-threejs)
- [Sistema de Texturas](#sistema-de-texturas)
- [Animaciones y Rotaciones](#animaciones-y-rotaciones)
- [Flujo de Interacción](#flujo-de-interacción)
- [Mejoras Futuras](#mejoras-futuras)

## Instalación y Ejecución

### Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Pasos de Instalación

1. Clonar o descargar el repositorio

2. Instalar dependencias en \Tarot-App\tarot-app:
```bash
npm install
```

3. Ejecutar el servidor de desarrollo (desde \Tarot-App\tarot-app):
```bash
npm run dev
```

4. Abrir el navegador en `http://localhost:5173`

### Dependencias del Proyecto

El proyecto utiliza dos dependencias principales:

- **Three.js (^0.160.0)**: Biblioteca de renderizado 3D que facilita el trabajo con WebGL
- **Vite (^5.0.0)**: Herramienta de desarrollo que proporciona un servidor rápido y compilación eficiente

La elección de estas herramientas específicas se explica más adelante en la sección de decisiones de diseño.

## Estructura del Proyecto

```
tarot-app/
├── assets/
│   ├── t1.jpg
│   ├── t2.jpg
│   └── ... (t3.jpg hasta t12.jpg)
├── index.html
├── style.css
├── main.js
├── cards.js
└── package.json
```

### Organización de Archivos

La estructura fue diseñada para ser simple, (fácil de navegar y comprender rápidamente).

**index.html**: Punto de entrada de la aplicación. Contiene la estructura HTML mínima necesaria: un contenedor para el canvas de Three.js, un panel de información de la carta que se muestra tras voltearla, y un footer con instrucciones para el usuario.

**style.css**: Todos los estilos visuales están concentrados en un único archivo. Incluye el gradiente de fondo, animaciones CSS para los textos, efectos para el panel de información, y settings para responsividad.

**main.js**: Archivo principal que contiene toda la lógica de Three.js, manejo de eventos, animaciones de volteo y renderizado. Es el corazón de la aplicación.

**cards.js**: Base de datos de las cartas del tarot. Separar los datos de la lógica permite modificar fácilmente el contenido sin tocar el código de renderizado.

**assets/**: Carpeta que contiene las imágenes reales de las cartas del tarot (t1.jpg hasta t12.jpg).

## Decisiones de Diseño

### Por qué Vite en lugar de un setup más simple

Aunque el desafío podría haberse resuelto con archivos HTML/JS planos, elegí Vite por varias razones prácticas:

1. **Hot Module Replacement**: Durante el desarrollo, cualquier cambio se refleja instantáneamente en el navegador sin necesidad de refrescar manualmente. Esto acelera significativamente el proceso de prueba y ajuste.

2. **Servidor de desarrollo integrado**: Evita problemas de CORS al cargar imágenes y módulos, que son comunes cuando se trabaja con archivos locales directamente.

3. **Build optimizado**: Aunque no es crítico para una demo, Vite puede generar una versión optimizada para producción con un solo comando.

### Por qué Three.js

Esta biblioteca es ideal para el proyecto porque:

1. **Abstracción de WebGL**: Three.js simplifica enormemente el trabajo con WebGL, que de otra forma requeriría cientos de líneas de código de bajo nivel para lograr el mismo resultado.

2. **Geometrías predefinidas**: La clase BoxGeometry permite crear la carta 3D de forma trivial, con control total sobre sus dimensiones y materiales.

3. **Sistema de texturas**: Three.js maneja automáticamente la carga y aplicación de texturas a superficies 3D, incluyendo texturas generadas en canvas.

4. **Renderizado eficiente**: El loop de animación de Three.js está optimizado para 60fps.

### Patrón de Dorso Generado con Canvas

En lugar de usar una imagen estática para el dorso de la carta, decidí generarlo programáticamente usando Canvas API. Esta decisión tiene varias ventajas:

1. **Cero dependencias de assets externos**: El dorso siempre funciona, sin importar si las imágenes de las cartas se cargan o no.

2. **Customización total**: Es fácil modificar colores, símbolos o diseño sin necesidad de editar imágenes en un programa externo.

El diseño incluye gradientes radiales, bordes dorados, símbolos místicos (luna, sol, estrellas) y texto con sombras, todo generado con código JavaScript.

## Arquitectura Técnica

### Variables Globales y Estado de la Aplicación

El archivo main.js mantiene el estado de la aplicación en variables globales:

```javascript
let scene, camera, renderer, cardGroup;
let isFlipped = false;
let isAnimating = false;
let currentCard = null;
let autoRotate = true;
```

Se tomó este camino de diseño ya que:

- Es fácil de entender y debuggear
- No requiere bibliotecas adicionales
- El estado es simple y no se comparte entre componentes

**isFlipped** y **isAnimating** son flags booleanos que previenen interacciones mientras hay animaciones en curso. Sin estos, el usuario podría hacer click múltiples veces y causar comportamientos inesperados.

**autoRotate** controla si la carta gira automáticamente. Se desactiva al hacer click y se reactiva al resetear (solicitar nueva carta), lo que mejora la experiencia ya que la carta no se mueve mientras el usuario lee su mensaje.

### Inicialización de Three.js

La función `init()` configura toda la escena 3D:

```javascript
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // ... configuración de luces y eventos
}
```

**Scene**: Es el contenedor donde viven todos los objetos 3D. Solo contiene la carta y las luces.

**PerspectiveCamera**: Simula la vista y ajusta lo observado en pantalla de la escena. El parámetro 75 es el campo de visión (field of view) en grados.

**WebGLRenderer**: El motor que realmente dibuja los píxeles en pantalla. La opción `alpha: true` hace el fondo transparente, permitiendo que se vea el gradiente CSS detrás.

### Sistema de Iluminación

Se usan tres tipos de luz:

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
const pointLight1 = new THREE.PointLight(0xffffff, 0.4);
const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
```

**AmbientLight**: Ilumina todos los objetos por igual, sin dirección. Esto asegura que no haya partes completamente negras.

**PointLight**: Luces que emiten desde un punto específico. Las dos luces puntuales desde ángulos diferentes (5,5,5 y -5,-5,5) crean profundidad y hacen que los bordes de la carta sean visibles.

## Funcionamiento de Three.js

### Geometría de la Carta

```javascript
const geometry = new THREE.BoxGeometry(2.5, 3.5, 0.05);
```

BoxGeometry crea un cubo (o en este caso, un rectángulo muy delgado). Los parámetros son:
- 2.5 unidades de ancho
- 3.5 unidades de alto (proporción similar a cartas reales)
- 0.05 unidades de profundidad (grosor mínimo para que parezca una carta física)

### Materiales y Caras

Un BoxGeometry tiene 6 caras (frente, atrás, arriba, abajo, izquierda, derecha). Podemos asignar un material diferente a cada una:

```javascript
const materials = [
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e }),  // derecha
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e }),  // izquierda
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e }),  // arriba
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e }),  // abajo
    new THREE.MeshPhongMaterial({ map: backTexture }), // frente (índice 4)
    new THREE.MeshPhongMaterial({ map: backTexture })  // atrás (índice 5)
];
```

Las caras laterales (0-3) son oscuras porque nunca se ven directamente, solo dan grosor a la carta.

Las caras principales (4 y 5) reciben texturas. Inicialmente ambas muestran el dorso decorativo. Cuando se voltea, la cara 5 se reemplaza con la imagen de la carta seleccionada.

**MeshPhongMaterial** se eligió porque responde a la luz de forma realista, creando highlights y sombras sutiles que dan sensación de objeto físico.

### Grupo de Objetos

```javascript
cardGroup = new THREE.Group();
cardGroup.add(card);
```

En lugar de rotar el mesh directamente, lo envolvemos en un Group. Esto tiene ventajas:

1. Si en el futuro queremos agregar efectos adicionales (partículas, glow), podemos añadirlos al grupo sin afectar la rotación de la carta.

2. Permite manejar la posición, rotación y escala de forma independiente.

3. Hace el código más claro: `cardGroup.rotation.y` es explícito en su propósito.

## Sistema de Texturas

### Generación de Textura del Dorso

La textura se genera en un canvas HTML invisible:

```javascript
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 712;
const ctx = canvas.getContext('2d');
```

**Resolución 512x712**: Es potencia de 2 en la dimensión horizontal (512 = 2^9), lo cual es importante para optimización en WebGL.

El proceso de dibujo sigue este orden:

1. Fondo con gradiente del centro hacia afuera
2. Círculos concéntricos sutiles para textura
3. Bordes dorados (exterior, medio, interior)
4. Luna creciente y estrellas en la parte superior
5. Texto "TAROT Matutino" en el centro
6. Símbolos 'místicos' en las esquinas
7. Sol con rayos en la parte inferior

Cada elemento se dibuja con `fillStyle` (relleno) o `strokeStyle` (contorno), capa por capa.

Finalmente, `new THREE.CanvasTexture(canvas)` convierte el canvas en una textura que Three.js puede aplicar a una superficie 3D.

### Carga de Imágenes Reales

```javascript
const img = new Image();
img.crossOrigin = "anonymous";
img.src = cardData.image;
```

**crossOrigin**: Necesario para evitar problemas de seguridad CORS al manipular la imagen en canvas.

La carga es asíncrona y usa callbacks:

```javascript
img.onload = () => {
    // Dibujar imagen en canvas
    // Crear textura
    // Aplicar a material
};

img.onerror = () => {
    console.error('Error al cargar imagen');
};
```

Este patrón asegura que la aplicación no se bloquee esperando que carguen las imágenes. Si una imagen falla, simplemente se registra el error en consola pero la aplicación sigue funcionando.

### Por qué Cargar Durante la Animación

```javascript
if (progress > 0.5 && !imageLoaded) {
    imageLoaded = true;
    loadCardImage(currentCard);
}
```

La imagen se carga a mitad del volteo por dos razones:

1. **Buen timing**: Para cuando termina el volteo (100% de progreso de volteo), la imagen ya está cargada y aplicada, creando una transición suave (se esconde transición en velocidad de giro).

2. **Ocultamiento del delay**: Si la imagen tarda en cargar, el usuario no lo nota porque está viendo la animación de volteo. Es mejor que cargar antes y hacer que el usuario espere sin feedback visual.

## Animaciones y Rotaciones

### Loop de Animación Principal

```javascript
function animate() {
    requestAnimationFrame(animate);
    
    if (!isAnimating && !isFlipped && autoRotate) {
        cardGroup.rotation.y += 0.003;
        cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}
```

`requestAnimationFrame` es el método estándar para animaciones suaves en navegadores. Sincroniza con la tasa de refresco del monitor (usualmente 60fps).

**Rotación automática**: `rotation.y += 0.003` rota la carta 0.003 radianes por frame. A 60fps, esto resulta en aproximadamente una rotación completa cada 35 segundos.

**Movimiento flotante**: `Math.sin(Date.now() * 0.001)` crea un movimiento ondulante suave. Date.now() proporciona milisegundos, dividido entre 1000 lo convierte en segundos, y sin() produce valores entre -1 y 1, multiplicados por 0.1 para amplitud sutil.

### Animación de Volteo

El volteo es más complejo porque debe:
1. Completar al menos una vuelta completa (para que se vea fluida)
2. Terminar exactamente en PI radianes (mirando al frente)
3. Aplicar easing para aceleración/desaceleración natural

```javascript
const normalizedStart = startRotation % (Math.PI * 2);
const remainingToComplete = (Math.PI * 2) - normalizedStart;
const totalRotation = remainingToComplete + Math.PI * 2 + Math.PI;
```

**normalizedStart**: Si la carta ha dado múltiples vueltas, esto la normaliza a su posición en el primer ciclo (0 a 2PI).

**remainingToComplete**: Cuánto falta para completar la vuelta actual.

**totalRotation**: Lo que falta + una vuelta completa + medio giro (PI) para voltear.

Por ejemplo: Si la carta está en 1.5 radianes:
- remainingToComplete = 2PI - 1.5 ≈ 4.78
- totalRotation = 4.78 + 2PI + PI ≈ 14.2 radianes

Esto asegura una animación fluida sin importar cuándo el usuario haga click.

### Función de Easing

```javascript
let eased;

if (progress < 0.5) {
  // Primera mitad: ease-in (acelera suavemente)
  eased = 4 * progress * progress * progress;
} else {
  // Segunda mitad: ease-out (desacelera suavemente)
  eased = 1 - Math.pow(-2 * progress + 2, 3) / 2;
}
```

Esta es una función ease-in-out cúbica. Significa:

- **Primera mitad (ease-in)**: Acelera gradualmente (4x³)
- **Segunda mitad (ease-out)**: Desacelera gradualmente

Sin easing, la animación sería lineal y se vería robótica. Con easing, se ve más natural, como si la carta tuviera peso físico.

### Efecto de Escala Durante Volteo

```javascript
const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
cardGroup.scale.set(scale, scale, 1);
```

`Math.sin(progress * Math.PI)` va de 0 a 1 y de vuelta a 0 durante la animación. Esto hace que la carta "crezca" ligeramente al voltearse y vuelva a su tamaño normal, añadiendo énfasis visual al momento del volteo.

El factor 0.15 significa que crece hasta un 15% más grande en el punto medio.

### Control de Posición Final

```javascript
if (progress < 1) {
    requestAnimationFrame(animateFlip);
} else {
    cardGroup.rotation.y = Math.PI;
    cardGroup.scale.set(1, 1, 1);
    cardGroup.position.y = 0;
    isAnimating = false;
    isFlipped = true;
    showCardInfo();
}
```

Cuando la animación termina, forzamos valores exactos en lugar de confiar en la última iteración. Esto previene acumulación de errores de punto flotante que podrían hacer que la carta quede ligeramente desalineada.

## Flujo de Interacción

### 1. Carga Inicial

- Se ejecuta `init()` que configura Three.js
- Se llama `createCard()` que genera la geometría y texturas
- Comienza el loop de animación con rotación automática
- El footer muestra "Haz click en la carta"

### 2. Click del Usuario

```javascript
renderer.domElement.addEventListener('click', handleCardClick);
```

El evento está en el canvas, no en el documento completo, para evitar que clicks fuera de la carta activen la animación.

```javascript
if (isAnimating || isFlipped) return;
```

Esta guardia previene múltiples clicks durante la animación o después de haber volteado la carta.

### 3. Selección de Carta

```javascript
currentCard = getRandomCard();
```

La función en cards.js simplemente usa `Math.random()` para seleccionar un índice aleatorio del array de cartas. Esto asegura distribución uniforme.

### 4. Animación de Volteo

Se inicia `flipCard()` que:
- Calcula la rotación total necesaria
- Inicia un loop de animación con `requestAnimationFrame`
- A mitad de camino, carga la imagen de la carta
- Al terminar, fija la posición en exactamente PI radianes

### 5. Revelación de Información

```javascript
setTimeout(() => {
    cardInfo.classList.remove('hidden');
    footer.style.display = 'none';
}, 300);
```

Un delay de 300ms da tiempo para que el usuario aprecie la carta volteada antes de que aparezca el panel de texto. Sin este delay, todo aparecería simultáneamente y sería visualmente abrumador.

### 6. Reset

```javascript
document.getElementById('reset-btn').addEventListener('click', resetCard);
```

El botón "Nueva Carta":
- Oculta el panel de información
- Restaura la textura del dorso en ambas caras
- Anima la carta volteando de vuelta
- Reactiva la rotación automática

El reset restaura completamente el estado inicial, permitiendo seleccionar infinitas cartas sin necesidad de recargar la página.

## Base de Datos de Cartas

El archivo cards.js contiene un array con 12 cartas:

```javascript
export const tarotCards = [
    {
        id: 1,
        name: "El Sol",
        emoji: "☀️",
        message: "Hoy es un día lleno de energía...",
        color: "#FFD700",
        image: "/assets/t1.jpg"
    },
    // ... más cartas
];
```

Esta estructura fue elegida porque:

1. **Simplicidad**: No requiere base de datos externa ni API calls
2. **Modificabilidad**: Agregar o editar cartas es trivial
3. **Type safety implícito**: Cada carta tiene la misma estructura, fácil de validar mentalmente

El campo `color` se usó inicialmente para el fondo de cartas generadas antes de tener los assets reales. Se mantiene como fallback si las imágenes no cargan.

El campo `emoji` se usa en el título del panel de información para reforzar visualmente cada carta.

## Responsividad

El CSS incluye media queries para adaptar la interfaz:

```css
@media (max-width: 768px) {
    #canvas-container { height: 400px; }
    header h1 { font-size: 2.2rem; }
}
```

También hay un listener de resize en JavaScript:

```javascript
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
```

**updateProjectionMatrix()** es crucial: sin esto, al cambiar el tamaño de la ventana, la cámara mantendría el aspect ratio anterior y la escena se vería distorsionada.

## Optimizaciones Implementadas

### Uso de Grupos en Lugar de Meshes Individuales

Envolver la carta en un Group permite futuras expansiones sin refactorizar el código de animación.

### Prevención de Interacciones Durante Animaciones

Los flags `isAnimating` e `isFlipped` evitan comportamientos inesperados y potenciales bugs difíciles de reproducir.

### Texturas de Canvas en Lugar de Archivos

El dorso generado con canvas carga instantáneamente y no depende de requests de red.

### Carga Lazy de Imágenes

Las imágenes solo se cargan cuando se seleccionan, no todas al inicio. Esto reduce el tiempo de carga inicial y el uso de memoria.

### Reutilización del Loop de Animación

Un solo `requestAnimationFrame` loop maneja tanto la rotación automática como el renderizado, en lugar de múltiples timers que podrían causar problemas de sincronización.

## Limitaciones

### Rendimiento en Dispositivos Móviles Antiguos

WebGL puede ser pesado en hardware antiguo. En esos casos, la animación podría no ser fluida (menos de 60fps).

### Distribución de Aleatoriedad

`Math.random()` no es criptográficamente seguro, pero para seleccionar cartas de tarot es suficiente.

### Tamaño de Assets

Las imágenes de las cartas no están optimizadas automáticamente. En un proyecto de producción, se usaría compresión y formato moderno (WebP).

## Conclusión

Este proyecto demuestra cómo crear una experiencia web 3D interactiva sin necesidad de frameworks complejos. La combinación de Three.js para renderizado, Canvas API para texturas procedurales, y JavaScript vanilla para lógica resulta en una aplicación ligera pero visualmente atractiva.

El código incluye conceptos avanzados como animaciones con easing, manejo asíncrono de assets, y renderizado 3D en tiempo real.

De este modo, el resultado es una aplicación funcional, atractiva, y extensible.

---

**Desarrollado por Pablo Reyes Pomés**  
Estudiante de Ingeniería Civil en Computación, Universidad de Chile