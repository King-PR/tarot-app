import * as THREE from 'three';
import { getRandomCard } from './cards.js';

// Variables globales
let scene, camera, renderer, cardGroup;
let isFlipped = false;
let isAnimating = false;
let currentCard = null;
let autoRotate = true;

// Inicializar la escena
function init() {
    // Crear escena
    scene = new THREE.Scene();
    
    // Configurar cámara
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4.8;
    
    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xffffff, 0.4);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Crear la carta
    createCard();
    
    // Event listeners
    renderer.domElement.addEventListener('click', handleCardClick);
    document.getElementById('reset-btn').addEventListener('click', resetCard);
    window.addEventListener('resize', onWindowResize);
    
    // Iniciar animación
    animate();
}

// Crear textura para el dorso de la carta
function createBackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 712;
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente místico
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, '#2d1b69');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Patrón de fondo sutil
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            20 + i * 15,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
    
    // Borde exterior doble
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Borde interior decorativo
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Luna y estrellas decorativas superiores
    ctx.fillStyle = '#FFD700';
    
    // Luna creciente
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 10, 100, 25, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.arc(canvas.width / 2 + 5, 100, 20, 1.8 * Math.PI, 0.2 * Math.PI, true);
    ctx.fill();
    
    // Estrellas alrededor de la luna
    const drawStar = (x, y, size) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(0, -size);
            ctx.translate(0, -size);
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, -size * 0.4);
            ctx.translate(0, -size * 0.4);
            ctx.rotate(Math.PI / 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };
    
    // Estrellas decorativas
    drawStar(canvas.width / 2 - 60, 80, 8);
    drawStar(canvas.width / 2 + 50, 90, 6);
    drawStar(canvas.width / 2 - 70, 120, 5);
    drawStar(canvas.width / 2 + 60, 110, 7);
    
    // Texto central con sombra
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.font = 'bold 60px serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ TAROT ✦', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = 'italic 40px serif';
    ctx.fillStyle = '#FFA500';
    ctx.fillText('Matutino', canvas.width / 2, canvas.height / 2 + 20);
    
    // Resetear sombra
    ctx.shadowBlur = 0;
    
    // Símbolos místicos en las esquinas
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('☽', 70, 70);
    ctx.fillText('☾', canvas.width - 70, 70);
    ctx.fillText('✧', 70, canvas.height - 70);
    ctx.fillText('✧', canvas.width - 70, canvas.height - 70);
    
    // Sol decorativo inferior
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 100, 30, 0, Math.PI * 2);
    
    // Rayos del sol
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = canvas.width / 2 + Math.cos(angle) * 35;
        const y1 = canvas.height - 100 + Math.sin(angle) * 35;
        const x2 = canvas.width / 2 + Math.cos(angle) * 50;
        const y2 = canvas.height - 100 + Math.sin(angle) * 50;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
}

// Crear la geometría de la carta
function createCard() {
    cardGroup = new THREE.Group();
    
    const cardWidth = 2.5;
    const cardHeight = 3.5;
    const cardDepth = 0.05;
    
    const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    
    // Crear textura del dorso
    const backTexture = createBackTexture();
    
    // AMBOS LADOS tienen la misma textura inicialmente
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // lado derecho
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // lado izquierdo
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // arriba
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // abajo
        new THREE.MeshPhongMaterial({ map: backTexture, shininess: 30 }), // frente
        new THREE.MeshPhongMaterial({ map: backTexture, shininess: 30 }) // atrás
    ];
    
    const card = new THREE.Mesh(geometry, materials);
    cardGroup.add(card);
    cardGroup.rotation.y = 0;
    
    scene.add(cardGroup);
}

// Cargar imagen de la carta y aplicarla DESPUÉS del volteo
function loadCardImage(cardData) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 712;
        const ctx = canvas.getContext('2d');
        
        // Dibujar la imagen
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Borde blanco elegante
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 5;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Aplicar la textura al frente (cara 5)
        const texture = new THREE.CanvasTexture(canvas);
        cardGroup.children[0].material[5].map = texture;
        cardGroup.children[0].material[5].needsUpdate = true;
        
        console.log('✅ Imagen cargada:', cardData.image);
    };
    
    img.onerror = () => {
        console.error('❌ Error al cargar:', cardData.image);
    };
    
    img.src = cardData.image;
}

// Manejar click en la carta
function handleCardClick() {
    if (isAnimating || isFlipped) return;
    
    isAnimating = true;
    autoRotate = false;
    
    // Obtener carta aleatoria
    currentCard = getRandomCard();
    console.log('🎴 Carta seleccionada:', currentCard.name);
    
    // Animar volteo
    flipCard();
}

// Animar el volteo de la carta
function flipCard() {
    const duration = 1500;
    const startRotation = cardGroup.rotation.y;
    const normalizedStart = startRotation % (Math.PI * 2);
    const remainingToComplete = (Math.PI * 2) - normalizedStart;
    const totalRotation = remainingToComplete + Math.PI * 2 + Math.PI;
    const endRotation = startRotation + totalRotation;
    const startTime = Date.now();
    
    let imageLoaded = false;
    
    function animateFlip() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        cardGroup.rotation.y = startRotation + totalRotation * eased;
        
        const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
        cardGroup.scale.set(scale, scale, 1);
        cardGroup.position.y = Math.sin(progress * Math.PI) * 0.3;
        
        // Cargar imagen cuando esté a mitad de la animación
        if (progress > 0.5 && !imageLoaded) {
            imageLoaded = true;
            loadCardImage(currentCard);
        }
        
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
    }
    
    animateFlip();
}

// Mostrar información de la carta
function showCardInfo() {
    const cardInfo = document.getElementById('card-info');
    const cardTitle = document.getElementById('card-title');
    const cardMessage = document.getElementById('card-message');
    const footer = document.querySelector('footer');
    const canvas = document.getElementById('canvas-container');
    
    cardTitle.textContent = `${currentCard.emoji} ${currentCard.name}`;
    cardMessage.textContent = currentCard.message;
    
    canvas.classList.add('clicked');
    
    setTimeout(() => {
        cardInfo.classList.remove('hidden');
        footer.style.display = 'none';
    }, 300);
}

// Resetear la carta
function resetCard() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    const duration = 1500;
    const startRotation = cardGroup.rotation.y;
    const totalRotation = Math.PI * 2;
    const endRotation = startRotation + totalRotation;
    const startTime = Date.now();
    
    const cardInfo = document.getElementById('card-info');
    const footer = document.querySelector('footer');
    const canvas = document.getElementById('canvas-container');
    
    cardInfo.classList.add('hidden');
    canvas.classList.remove('clicked');
    
    // Restaurar textura del dorso en ambas caras
    const backTexture = createBackTexture();
    cardGroup.children[0].material[5].map = backTexture;
    cardGroup.children[0].material[5].needsUpdate = true;
    
    function animateReset() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        cardGroup.rotation.y = startRotation + totalRotation * eased;
        
        const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
        cardGroup.scale.set(scale, scale, 1);
        cardGroup.position.y = Math.sin(progress * Math.PI) * 0.3;
        
        if (progress < 1) {
            requestAnimationFrame(animateReset);
        } else {
            cardGroup.rotation.y = 0;
            cardGroup.scale.set(1, 1, 1);
            cardGroup.position.y = 0;
            isAnimating = false;
            isFlipped = false;
            autoRotate = true;
            footer.style.display = 'block';
        }
    }
    
    animateReset();
}

// Animación continua
function animate() {
    requestAnimationFrame(animate);
    
    if (!isAnimating && !isFlipped && autoRotate) {
        cardGroup.rotation.y += 0.003;
        cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    if (isFlipped) {
        cardGroup.rotation.y = Math.PI;
        cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
    
    renderer.render(scene, camera);
}

// Manejar redimensionamiento
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Iniciar
init();