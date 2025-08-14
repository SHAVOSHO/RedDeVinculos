// elements.js - Manejo de elementos en la cuadrícula

// Lista de iconos disponibles organizados por categorías
const availableIcons = [
    // === PERSONAS ===
    { name: 'hombre', class: 'fas fa-male', category: 'personas' },
    { name: 'mujer', class: 'fas fa-female', category: 'personas' },
    { name: 'usuario', class: 'fas fa-user', category: 'personas' },
    { name: 'usuarios', class: 'fas fa-users', category: 'personas' },
    { name: 'familia', class: 'fas fa-user-friends', category: 'personas' },
    { name: 'niño', class: 'fas fa-child', category: 'personas' },
    { name: 'anciano', class: 'fas fa-user-clock', category: 'personas' },
    { name: 'hombre-traje', class: 'fas fa-user-tie', category: 'personas' },
    { name: 'mujer-empresaria', class: 'fas fa-user-graduate', category: 'personas' },
    { name: 'detective', class: 'fas fa-user-secret', category: 'personas' },
    { name: 'soldado', class: 'fas fa-user-shield', category: 'personas' },
    { name: 'doctor', class: 'fas fa-user-md', category: 'personas' },
    { name: 'ingeniero', class: 'fas fa-user-cog', category: 'personas' },
    { name: 'persona-eliminada', class: 'fas fa-user-times', category: 'personas' },
    { name: 'persona-herida', class: 'fas fa-user-injured', category: 'personas' },
    { name: 'sospechoso', class: 'fas fa-user-ninja', category: 'personas' },
    { name: 'criminal', class: 'fas fa-mask', category: 'personas' },
    
    // === EMPRESAS Y ORGANIZACIONES ===
    { name: 'empresa', class: 'fas fa-building', category: 'empresas' },
    { name: 'oficina', class: 'fas fa-briefcase', category: 'empresas' },
    { name: 'banco', class: 'fas fa-university', category: 'empresas' },
    { name: 'hospital', class: 'fas fa-hospital', category: 'empresas' },
    { name: 'escuela', class: 'fas fa-school', category: 'empresas' },
    { name: 'fabrica', class: 'fas fa-industry', category: 'empresas' },
    { name: 'tienda', class: 'fas fa-store', category: 'empresas' },
    { name: 'restaurante', class: 'fas fa-utensils', category: 'empresas' },
    { name: 'hotel', class: 'fas fa-bed', category: 'empresas' },
    { name: 'gobierno', class: 'fas fa-landmark', category: 'empresas' },
    { name: 'iglesia', class: 'fas fa-church', category: 'empresas' },
    
    // === POLICÍA Y SEGURIDAD ===
    { name: 'policia', class: 'fas fa-shield-alt', category: 'policia' },
    { name: 'oficial-policia', class: 'fas fa-user-shield', category: 'policia' },
    { name: 'detective-policia', class: 'fas fa-user-secret', category: 'policia' },
    { name: 'sheriff', class: 'fas fa-star', category: 'policia' },
    { name: 'guardia', class: 'fas fa-shield-alt', category: 'policia' },
    { name: 'seguridad', class: 'fas fa-user-lock', category: 'policia' },
    { name: 'swat', class: 'fas fa-user-ninja', category: 'policia' },
    { name: 'fbi', class: 'fas fa-user-tie', category: 'policia' },
    { name: 'agente-federal', class: 'fas fa-id-badge', category: 'policia' },
    { name: 'policia-militar', class: 'fas fa-user-cog', category: 'policia' },
    { name: 'esposas', class: 'fas fa-handcuffs', category: 'policia' },
    { name: 'placa-policia', class: 'fas fa-certificate', category: 'policia' },
    { name: 'radio-policia', class: 'fas fa-walkie-talkie', category: 'policia' },
    { name: 'patrulla-policia', class: 'fas fa-car-side', category: 'policia' },
    { name: 'moto-policia', class: 'fas fa-motorcycle', category: 'policia' },
    { name: 'helicoptero-policia', class: 'fas fa-helicopter', category: 'policia' },
    { name: 'perro-policia', class: 'fas fa-dog', category: 'policia' },
    { name: 'barricada', class: 'fas fa-road-barrier', category: 'policia' },
    { name: 'cinta-policial', class: 'fas fa-tape', category: 'policia' },
    { name: 'camara-seguridad', class: 'fas fa-video', category: 'policia' },
    { name: 'alarma', class: 'fas fa-bell', category: 'policia' },

    // === JUSTICIA Y LEGAL ===
    { name: 'tribunal', class: 'fas fa-gavel', category: 'justicia' },
    { name: 'carcel', class: 'fas fa-lock', category: 'justicia' },
    { name: 'juez', class: 'fas fa-gavel', category: 'justicia' },
    { name: 'abogado', class: 'fas fa-balance-scale', category: 'justicia' },
    { name: 'fiscal', class: 'fas fa-clipboard-list', category: 'justicia' },
    { name: 'testigo', class: 'fas fa-eye', category: 'justicia' },
    { name: 'jurado', class: 'fas fa-users', category: 'justicia' },
    { name: 'orden-arresto', class: 'fas fa-file-invoice', category: 'justicia' },
    { name: 'sentencia', class: 'fas fa-stamp', category: 'justicia' },
    { name: 'multa', class: 'fas fa-receipt', category: 'justicia' },
    { name: 'libertad-condicional', class: 'fas fa-user-clock', category: 'justicia' },
    { name: 'cadena-perpetua', class: 'fas fa-infinity', category: 'justicia' },
    { name: 'pena-muerte', class: 'fas fa-skull', category: 'justicia' },
    { name: 'inocente', class: 'fas fa-dove', category: 'justicia' },
    { name: 'culpable', class: 'fas fa-user-times', category: 'justicia' },
    
    // === ARMAS Y OBJETOS PELIGROSOS ===
    { name: 'pistola', class: 'fas fa-gun', category: 'armas' },
    { name: 'bomba', class: 'fas fa-bomb', category: 'armas' },
    { name: 'cuchillo', class: 'fas fa-knife-kitchen', category: 'armas' },
    { name: 'espada', class: 'fas fa-sword', category: 'armas' },
    { name: 'escudo', class: 'fas fa-shield', category: 'armas' },
    { name: 'granada', class: 'fas fa-grenade', category: 'armas' },
    { name: 'rifle', class: 'fas fa-rifle', category: 'armas' },
    { name: 'metralleta', class: 'fas fa-gun', category: 'armas' },
    { name: 'francotirador', class: 'fas fa-crosshairs', category: 'armas' },
    { name: 'balas', class: 'fas fa-bullet', category: 'armas' },
    { name: 'municion', class: 'fas fa-box', category: 'armas' },
    { name: 'explosivos', class: 'fas fa-fire-extinguisher', category: 'armas' },
    { name: 'gas-lacrimogeno', class: 'fas fa-spray-can', category: 'armas' },
    { name: 'taser', class: 'fas fa-bolt', category: 'armas' },
    { name: 'baston-policia', class: 'fas fa-gavel', category: 'armas' },
    { name: 'escudo-antimotines', class: 'fas fa-shield-virus', category: 'armas' },

    // === CRIMEN Y DELINCUENCIA ===
    { name: 'ladron', class: 'fas fa-mask', category: 'crimen' },
    { name: 'asesino', class: 'fas fa-skull-crossbones', category: 'crimen' },
    { name: 'secuestrador', class: 'fas fa-user-slash', category: 'crimen' },
    { name: 'estafador', class: 'fas fa-user-times', category: 'crimen' },
    { name: 'hacker', class: 'fas fa-user-secret', category: 'crimen' },
    { name: 'contrabandista', class: 'fas fa-boxes', category: 'crimen' },
    { name: 'pandilla', class: 'fas fa-users-cog', category: 'crimen' },
    { name: 'mafia', class: 'fas fa-crown', category: 'crimen' },
    { name: 'sicario', class: 'fas fa-crosshairs', category: 'crimen' },
    { name: 'extorsion', class: 'fas fa-hand-holding-usd', category: 'crimen' },
    { name: 'corrupcion', class: 'fas fa-hand-holding-heart', category: 'crimen' },
    { name: 'lavado-dinero', class: 'fas fa-hand-holding-water', category: 'crimen' },
    { name: 'prision', class: 'fas fa-dungeon', category: 'crimen' },
    { name: 'fugitivo', class: 'fas fa-running', category: 'crimen' },
    { name: 'rehenes', class: 'fas fa-users-slash', category: 'crimen' },
    
    // === VEHÍCULOS ===
    { name: 'carro', class: 'fas fa-car', category: 'vehiculos' },
    { name: 'moto', class: 'fas fa-motorcycle', category: 'vehiculos' },
    { name: 'camion', class: 'fas fa-truck', category: 'vehiculos' },
    { name: 'autobus', class: 'fas fa-bus', category: 'vehiculos' },
    { name: 'avion', class: 'fas fa-plane', category: 'vehiculos' },
    { name: 'helicoptero', class: 'fas fa-helicopter', category: 'vehiculos' },
    { name: 'barco', class: 'fas fa-ship', category: 'vehiculos' },
    { name: 'tren', class: 'fas fa-train', category: 'vehiculos' },
    { name: 'bicicleta', class: 'fas fa-bicycle', category: 'vehiculos' },
    { name: 'ambulancia', class: 'fas fa-ambulance', category: 'vehiculos' },
    { name: 'patrulla', class: 'fas fa-car-side', category: 'vehiculos' },
    { name: 'taxi', class: 'fas fa-taxi', category: 'vehiculos' },

    // === COMUNICACIONES ===
    { name: 'telefono', class: 'fas fa-phone', category: 'comunicaciones' },
    { name: 'celular', class: 'fas fa-mobile-alt', category: 'comunicaciones' },
    { name: 'email', class: 'fas fa-envelope', category: 'comunicaciones' },
    { name: 'mensaje', class: 'fas fa-sms', category: 'comunicaciones' },
    { name: 'chat', class: 'fas fa-comments', category: 'comunicaciones' },
    { name: 'radio', class: 'fas fa-broadcast-tower', category: 'comunicaciones' },
    { name: 'satelite', class: 'fas fa-satellite', category: 'comunicaciones' },
    { name: 'antena', class: 'fas fa-wifi', category: 'comunicaciones' },

    // === DINERO Y FINANZAS ===
    { name: 'dinero', class: 'fas fa-dollar-sign', category: 'dinero' },
    { name: 'euros', class: 'fas fa-euro-sign', category: 'dinero' },
    { name: 'pesos', class: 'fas fa-peso-sign', category: 'dinero' },
    { name: 'monedas', class: 'fas fa-coins', category: 'dinero' },
    { name: 'billete', class: 'fas fa-money-bill', category: 'dinero' },
    { name: 'tarjeta', class: 'fas fa-credit-card', category: 'dinero' },
    { name: 'cajero', class: 'fas fa-atm', category: 'dinero' },
    { name: 'banco-dinero', class: 'fas fa-piggy-bank', category: 'dinero' },
    { name: 'inversion', class: 'fas fa-chart-line', category: 'dinero' },

    // === DROGAS Y SUSTANCIAS ===
    { name: 'pastillas', class: 'fas fa-pills', category: 'drogas' },
    { name: 'jeringa', class: 'fas fa-syringe', category: 'drogas' },
    { name: 'cannabis', class: 'fas fa-cannabis', category: 'drogas' },
    { name: 'botella', class: 'fas fa-wine-bottle', category: 'drogas' },
    { name: 'cigarro', class: 'fas fa-smoking', category: 'drogas' },
    { name: 'laboratorio', class: 'fas fa-flask', category: 'drogas' },
    { name: 'dealer', class: 'fas fa-user-ninja', category: 'drogas' },
    { name: 'cartel', class: 'fas fa-crown', category: 'drogas' },
    { name: 'narcotrafico', class: 'fas fa-truck-loading', category: 'drogas' },

    // === LUGARES Y UBICACIONES ===
    { name: 'casa', class: 'fas fa-home', category: 'lugares' },
    { name: 'apartamento', class: 'fas fa-building', category: 'lugares' },
    { name: 'calle', class: 'fas fa-road', category: 'lugares' },
    { name: 'ciudad', class: 'fas fa-city', category: 'lugares' },
    { name: 'pais', class: 'fas fa-globe', category: 'lugares' },
    { name: 'mapa', class: 'fas fa-map', category: 'lugares' },
    { name: 'ubicacion', class: 'fas fa-map-marker-alt', category: 'lugares' },
    { name: 'frontera', class: 'fas fa-border-style', category: 'lugares' },
    { name: 'puerto', class: 'fas fa-anchor', category: 'lugares' },
    { name: 'aeropuerto', class: 'fas fa-plane-departure', category: 'lugares' },

    // === TECNOLOGÍA ===
    { name: 'computadora', class: 'fas fa-desktop', category: 'tecnologia' },
    { name: 'laptop', class: 'fas fa-laptop', category: 'tecnologia' },
    { name: 'servidor', class: 'fas fa-server', category: 'tecnologia' },
    { name: 'base-datos', class: 'fas fa-database', category: 'tecnologia' },
    { name: 'red', class: 'fas fa-network-wired', category: 'tecnologia' },
    { name: 'internet', class: 'fas fa-globe-americas', category: 'tecnologia' },
    { name: 'camara', class: 'fas fa-camera', category: 'tecnologia' },
    { name: 'vigilancia', class: 'fas fa-video', category: 'tecnologia' },

    // === DOCUMENTOS Y EVIDENCIA ===
    { name: 'documento', class: 'fas fa-file', category: 'documentos' },
    { name: 'contrato', class: 'fas fa-file-contract', category: 'documentos' },
    { name: 'reporte', class: 'fas fa-file-alt', category: 'documentos' },
    { name: 'foto', class: 'fas fa-image', category: 'documentos' },
    { name: 'video', class: 'fas fa-film', category: 'documentos' },
    { name: 'audio', class: 'fas fa-microphone', category: 'documentos' },
    { name: 'huella', class: 'fas fa-fingerprint', category: 'documentos' },
    { name: 'dna', class: 'fas fa-dna', category: 'documentos' },
    { name: 'evidencia', class: 'fas fa-search', category: 'documentos' },

    // === ESTADOS Y MARCADORES ===
    { name: 'alerta', class: 'fas fa-exclamation-triangle', category: 'estados' },
    { name: 'peligro', class: 'fas fa-skull-crossbones', category: 'estados' },
    { name: 'importante', class: 'fas fa-star', category: 'estados' },
    { name: 'secreto', class: 'fas fa-eye-slash', category: 'estados' },
    { name: 'activo', class: 'fas fa-check-circle', category: 'estados' },
    { name: 'inactivo', class: 'fas fa-times-circle', category: 'estados' },
    { name: 'sospechoso-marca', class: 'fas fa-question-circle', category: 'estados' },
    { name: 'confirmado', class: 'fas fa-check', category: 'estados' },
    { name: 'negado', class: 'fas fa-times', category: 'estados' },
    { name: 'tiempo', class: 'fas fa-clock', category: 'estados' },
    { name: 'calendario', class: 'fas fa-calendar', category: 'estados' },

    // === OTROS ===
    { name: 'llave', class: 'fas fa-key', category: 'otros' },
    { name: 'candado', class: 'fas fa-lock', category: 'otros' },
    { name: 'fuego', class: 'fas fa-fire', category: 'otros' },
    { name: 'explosion', class: 'fas fa-burst', category: 'otros' },
    { name: 'cadena', class: 'fas fa-link', category: 'otros' },
    { name: 'conexion', class: 'fas fa-project-diagram', category: 'otros' },
    { name: 'grupo', class: 'fas fa-layer-group', category: 'otros' }
];

// Variables para elementos
let elements = [];
let selectedIcon = null;
let elementIdCounter = 0;
let isAddingElement = false;

// Inicializar funcionalidad de elementos
function initializeElements() {
    setupElementEventListeners();
    loadIconsInModal();
}

// Configurar event listeners para elementos
function setupElementEventListeners() {
    // Botón agregar elemento
    document.getElementById('add-element-btn').addEventListener('click', openIconModal);
    
    // Cerrar modal
    document.getElementById('close-modal').addEventListener('click', closeIconModal);
    
    // Click fuera del modal para cerrar
    document.getElementById('icon-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeIconModal();
        }
    });
    
    // Buscador de iconos
    document.getElementById('icon-search').addEventListener('input', filterIcons);
    
    // Selector de categorías
    document.getElementById('category-select').addEventListener('change', filterIcons);
    
    // Click en la cuadrícula para agregar elemento
    document.querySelector('.grid-viewport').addEventListener('click', handleGridClick);
}

// Abrir modal de selección de iconos
function openIconModal() {
    document.getElementById('icon-modal').style.display = 'block';
    document.getElementById('icon-search').focus();
}

// Cerrar modal de selección de iconos
function closeIconModal() {
    document.getElementById('icon-modal').style.display = 'none';
    selectedIcon = null;
    isAddingElement = false;
    document.querySelector('.grid-viewport').style.cursor = 'grab';
}

// Cargar iconos en el modal
function loadIconsInModal() {
    const iconGrid = document.getElementById('icon-grid');
    iconGrid.innerHTML = '';
    
    availableIcons.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        iconItem.dataset.category = icon.category; // Agregar categoría como data attribute
        iconItem.innerHTML = `
            <i class="${icon.class}"></i>
            <span class="icon-name">${icon.name}</span>
        `;
        
        iconItem.addEventListener('click', function() {
            selectIcon(icon);
        });
        
        iconGrid.appendChild(iconItem);
    });
}

// Seleccionar un icono
function selectIcon(icon) {
    selectedIcon = icon;
    isAddingElement = true;
    closeIconModal();
    document.querySelector('.grid-viewport').style.cursor = 'crosshair';
    
    // Feedback visual
    showNotification(`Icono seleccionado: ${icon.name}. Click en la cuadrícula para colocar.`);
}

// Filtrar iconos según búsqueda y categoría
function filterIcons() {
    const searchTerm = document.getElementById('icon-search').value.toLowerCase();
    const selectedCategory = document.getElementById('category-select').value;
    const iconItems = document.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        const iconName = item.querySelector('.icon-name').textContent.toLowerCase();
        const iconCategory = item.dataset.category;
        
        const matchesSearch = iconName.includes(searchTerm);
        const matchesCategory = !selectedCategory || iconCategory === selectedCategory;
        
        if (matchesSearch && matchesCategory) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Manejar click en la cuadrícula
function handleGridClick(e) {
    if (!isAddingElement || !selectedIcon) return;
    if (isDragging) return;
    
    e.stopPropagation();
    
    // Obtener posición relativa al viewport (no al grid-container)
    const viewport = document.querySelector('.grid-viewport');
    const rect = viewport.getBoundingClientRect();
    
    // Calcular posición considerando el zoom y desplazamiento
    const clickX = (e.clientX - rect.left - translateX) / currentZoom;
    const clickY = (e.clientY - rect.top - translateY) / currentZoom;
    
    // Ajustar a la cuadrícula (snap to grid)
    const gridSize = 20; // Tamaño de la cuadrícula
    const snappedX = Math.round(clickX / gridSize) * gridSize;
    const snappedY = Math.round(clickY / gridSize) * gridSize;
    
    // Crear elemento
    createElement(snappedX, snappedY, selectedIcon);
    
    // Resetear selección
    selectedIcon = null;
    isAddingElement = false;
    document.querySelector('.grid-viewport').style.cursor = 'grab';
}

// Crear un elemento en la cuadrícula
function createElement(x, y, icon) {
    const element = {
        id: ++elementIdCounter,
        x: x,
        y: y,
        icon: icon,
        connections: []
    };
    
    elements.push(element);
    renderElement(element);
    
    console.log('Elemento creado:', element);
}

// Renderizar un elemento en el DOM
function renderElement(element) {
    const gridContainer = document.getElementById('grid-container');
    
    const elementDiv = document.createElement('div');
    elementDiv.className = 'grid-element';
    elementDiv.id = `element-${element.id}`;
    elementDiv.innerHTML = `<i class="${element.icon.class}"></i>`;
    
    // Posicionar elemento considerando el zoom
    elementDiv.style.left = `calc(50% + ${element.x * currentZoom}px)`;
    elementDiv.style.top = `calc(50% + ${element.y * currentZoom}px)`;
    elementDiv.style.transform = 'translate(-50%, -50%)';
    
    // Event listeners para el elemento
    elementDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        selectElement(element.id);
    });
    
    elementDiv.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        startElementDrag(e, element.id);
    });
    
    gridContainer.appendChild(elementDiv);
}

// Seleccionar un elemento
function selectElement(elementId) {
    // Deseleccionar todos
    document.querySelectorAll('.grid-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Seleccionar el actual
    document.getElementById(`element-${elementId}`).classList.add('selected');
    
    console.log('Elemento seleccionado:', elementId);
}

// Inicializar arrastre de elemento
function startElementDrag(e, elementId) {
    // Implementar arrastre de elementos (placeholder)
    console.log('Iniciando arrastre del elemento:', elementId);
}

// Mostrar notificación temporal
function showNotification(message) {
    // Crear notificación simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #007bff;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 3000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Limpiar todos los elementos
function clearAllElements() {
    elements = [];
    document.querySelectorAll('.grid-element').forEach(el => el.remove());
    console.log('Todos los elementos eliminados');
}

// Actualizar posición de elementos cuando cambia el zoom
function updateElementsPosition() {
    elements.forEach(element => {
        const elementDiv = document.getElementById(`element-${element.id}`);
        if (elementDiv) {
            elementDiv.style.left = `calc(50% + ${element.x * currentZoom}px)`;
            elementDiv.style.top = `calc(50% + ${element.y * currentZoom}px)`;
        }
    });
}

// Exportar funciones para uso en main (script.js)
window.initializeElements = initializeElements;
window.clearAllElements = clearAllElements;