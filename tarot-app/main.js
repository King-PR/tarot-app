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
    camera.position.z = 5;
    
    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Fondo transparente
    container.appendChild(renderer.domElement);
    
    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
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
    
    // Fondo oscuro
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde dorado exterior
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 12;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    
    // Borde dorado interior
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Patrón de estrellas
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Estrella superior
    ctx.fillText('✦', canvas.width / 2, 100);
    
    // Estrellas laterales
    ctx.font = 'bold 60px Arial';
    ctx.fillText('✧', 100, canvas.height / 2);
    ctx.fillText('✧', canvas.width - 100, canvas.height / 2);
    
    // Texto central
    ctx.font = 'bold 50px serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('TAROT', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = 'bold 35px serif';
    ctx.fillText('MATUTINO', canvas.width / 2, canvas.height / 2 + 30);
    
    // Estrella inferior
    ctx.font = 'bold 80px Arial';
    ctx.fillText('✦', canvas.width / 2, canvas.height - 100);
    
    // Decoración de esquinas
    ctx.font = 'bold 40px Arial';
    ctx.fillText('✧', 80, 80);
    ctx.fillText('✧', canvas.width - 80, 80);
    ctx.fillText('✧', 80, canvas.height - 80);
    ctx.fillText('✧', canvas.width - 80, canvas.height - 80);
    
    return new THREE.CanvasTexture(canvas);
}

// Crear textura para el frente de la carta
function createFrontTexture(cardData) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 712;
    const ctx = canvas.getContext('2d');
    
    // Fondo con el color de la carta
    ctx.fillStyle = cardData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde blanco
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Borde interno
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
    
    // Emoji central (más grande)
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del emoji
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.fillText(cardData.emoji, canvas.width / 2, canvas.height / 2 - 30);
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Nombre de la carta con borde
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(cardData.name, canvas.width / 2, canvas.height - 100);
    ctx.fillText(cardData.name, canvas.width / 2, canvas.height - 100);
    
    return new THREE.CanvasTexture(canvas);
}

// Crear la geometría de la carta
function createCard() {
    
    // Crear grupo para la carta
    cardGroup = new THREE.Group();
    
    // Geometría de la carta (un plano con grosor)
    const cardWidth = 2.5;
    const cardHeight = 3.5;
    const cardDepth = 0.05;
    
    const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    
    // Crear texturas
    const backTexture = createBackTexture();
    
    // Materiales para cada cara
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // lado derecho
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // lado izquierdo
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // arriba
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }), // abajo
        new THREE.MeshPhongMaterial({ 
            map: backTexture,
            shininess: 30
        }), // frente (dorso visible inicialmente)
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e }) // atrás (frente de la carta)
    ];
    
    const card = new THREE.Mesh(geometry, materials);
    cardGroup.add(card);
    
    // Rotar para mostrar el dorso
    cardGroup.rotation.y = 0;
    
    scene.add(cardGroup);
}

// Actualizar textura del frente cuando se voltea
function updateCardFront(cardData) {
    const frontTexture = createFrontTexture(cardData);
    
    // Aplicar textura al lado trasero (índice 5)
    cardGroup.children[0].material[5].map = frontTexture;
    cardGroup.children[0].material[5].needsUpdate = true;
}

// Manejar click en la carta
function handleCardClick() {
    if (isAnimating || isFlipped) return;
    
    isAnimating = true;
    autoRotate = false; // Detener rotación automática
    
    // Obtener carta aleatoria
    currentCard = getRandomCard();
    
    // Actualizar el frente de la carta antes de voltear
    updateCardFront(currentCard);
    
    // Animar volteo
    flipCard();
}

// Animar el volteo de la carta
function flipCard() {
    const duration = 1500; // 1.5 segundos
    const startRotation = cardGroup.rotation.y;
    
    // Normalizar el ángulo actual a un rango de 0 a 2π
    const normalizedStart = startRotation % (Math.PI * 2);
    
    // Calcular cuánto falta para completar la vuelta actual
    const remainingToComplete = (Math.PI * 2) - normalizedStart;
    
    // Hacer al menos 1 vuelta completa (2π) + lo que falta para completar + π (para voltear)
    const totalRotation = remainingToComplete + Math.PI * 2 + Math.PI;
    
    const endRotation = startRotation + totalRotation;
    const startTime = Date.now();
    
    function animateFlip() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out suave
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        cardGroup.rotation.y = startRotation + totalRotation * eased;
        
        // Efecto de escala durante el volteo
        const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
        cardGroup.scale.set(scale, scale, 1);
        
        // Movimiento sutil hacia arriba
        cardGroup.position.y = Math.sin(progress * Math.PI) * 0.3;
        
        if (progress < 1) {
            requestAnimationFrame(animateFlip);
        } else {
            // Asegurar que termina exactamente en π (mirando al frente)
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
    
    cardTitle.textContent = `${currentCard.emoji} ${currentCard.name}`;
    cardMessage.textContent = currentCard.message;
    
    // Animación de aparición
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
    const startRotation = cardGroup.rotation.y; // Debería estar en π
    
    // Hacer 1 vuelta completa desde π hasta 2π (que es equivalente a 0, dorso visible)
    const totalRotation = Math.PI * 2;
    const endRotation = startRotation + totalRotation;
    const startTime = Date.now();
    
    // Ocultar info
    const cardInfo = document.getElementById('card-info');
    const footer = document.querySelector('footer');
    cardInfo.classList.add('hidden');
    
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
            // Reiniciar exactamente a 0 (dorso visible)
            cardGroup.rotation.y = 0;
            cardGroup.scale.set(1, 1, 1);
            cardGroup.position.y = 0;
            isAnimating = false;
            isFlipped = false;
            autoRotate = true; // Reactivar rotación automática
            footer.style.display = 'block';
        }
    }
    
    animateReset();
}

// Animación continua
function animate() {
    requestAnimationFrame(animate);
    
    // Rotación sutil cuando está boca abajo y autoRotate está activo
    if (!isAnimating && !isFlipped && autoRotate) {
        cardGroup.rotation.y += 0.003;
        // Movimiento flotante sutil
        cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    // Si está volteada (mirando al frente), mantener posición fija
    if (isFlipped) {
        cardGroup.rotation.y = Math.PI;
        cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.05; // Flotación muy sutil
    }
    
    renderer.render(scene, camera);
}

// Manejar redimensionamiento de ventana
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Iniciar la aplicación
init();