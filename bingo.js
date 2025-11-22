/**
 * BingoGame Class
 * Encapsula la lógica del juego de Bingo.
 */
class BingoGame {
    constructor(totalBolas = 90) {
        this.totalBolas = totalBolas;
        this.bolas = []; // Array que contendrá las bolas mezcladas
        this.bolasExtraidas = [];
        this.intervaloId = null;
        this.enJuego = false;

        // Callbacks para comunicar eventos a la UI
        this.onBolaExtraida = null;
        this.onJuegoTerminado = null;
        this.onEstadoCambio = null; // Para actualizar botones, etc.
    }

    /**
     * Prepara el bombo con las bolas mezcladas.
     */
    inicializar() {
        this.bolas = [];
        for (let i = 1; i <= this.totalBolas; i++) {
            this.bolas.push(i);
        }
        this.mezclarBolas();
        this.bolasExtraidas = [];
        this.enJuego = false;
        this.guardarEstado(); // Guardar estado inicial
        if (this.onEstadoCambio) this.onEstadoCambio(this.enJuego);
    }

    /**
     * Algoritmo Fisher-Yates para mezclar el array de bolas.
     */
    mezclarBolas() {
        for (let i = this.bolas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bolas[i], this.bolas[j]] = [this.bolas[j], this.bolas[i]];
        }
    }

    /**
     * Extrae una bola del array.
     * @returns {number|null} El número de la bola o null si no quedan.
     */
    extraerBola() {
        if (this.bolas.length === 0) {
            this.finalizarJuego();
            return null;
        }

        const bola = this.bolas.pop();
        this.bolasExtraidas.push(bola);
        this.guardarEstado(); // Guardar tras cada extracción

        if (this.onBolaExtraida) {
            this.onBolaExtraida(bola);
        }

        return bola;
    }

    /**
     * Inicia o continúa la extracción automática de bolas.
     * @param {number} velocidadMs Intervalo en milisegundos.
     */
    iniciar(velocidadMs = 3000) {
        if (this.intervaloId !== null) return; // Ya está corriendo

        this.enJuego = true;
        if (this.onEstadoCambio) this.onEstadoCambio(this.enJuego);

        this.intervaloId = setInterval(() => {
            const bola = this.extraerBola();
            if (bola === null) {
                this.pausar(); // Detener intervalo si se acabó
            }
        }, velocidadMs);
    }

    /**
     * Pausa la extracción automática.
     */
    pausar() {
        if (this.intervaloId) {
            clearInterval(this.intervaloId);
            this.intervaloId = null;
        }
        this.enJuego = false;
        if (this.onEstadoCambio) this.onEstadoCambio(this.enJuego);
    }

    finalizarJuego() {
        this.pausar();
        if (this.onJuegoTerminado) {
            this.onJuegoTerminado();
        }
    }

    // --- Persistencia ---

    guardarEstado() {
        const estado = {
            bolas: this.bolas,
            bolasExtraidas: this.bolasExtraidas
        };
        localStorage.setItem('bingoState', JSON.stringify(estado));
    }

    cargarEstado() {
        const estadoGuardado = localStorage.getItem('bingoState');
        if (estadoGuardado) {
            try {
                const estado = JSON.parse(estadoGuardado);
                // Validar que el estado tenga sentido
                if (Array.isArray(estado.bolas) && Array.isArray(estado.bolasExtraidas)) {
                    this.bolas = estado.bolas;
                    this.bolasExtraidas = estado.bolasExtraidas;
                    this.enJuego = false; // Siempre cargar pausado
                    return true;
                }
            } catch (e) {
                console.error("Error al cargar estado:", e);
            }
        }
        return false;
    }

    reiniciar() {
        localStorage.removeItem('bingoState');
        this.inicializar();
    }
}

// --- Lógica de UI ---

// Elementos del DOM
const elements = {
    cuadricula: document.getElementById('cuadriculaBingo'),
    resultado: document.getElementById('resultado'),
    botonIniciar: document.getElementById('botonIniciar'),
    botonPausar: document.getElementById('botonPausar'),
    botonReiniciar: document.getElementById('botonReiniciar'), // Nuevo botón
    selectorVelocidad: document.getElementById('selectorVelocidad'),
    valorVelocidad: document.getElementById('valorVelocidad')
};

// Constantes
const CARPETA_AUDIO = 'audio/';
const TOTAL_BOLAS = 90;

// Instancia del juego
const bingo = new BingoGame(TOTAL_BOLAS);

// Funciones Auxiliares de UI

function inicializarCuadriculaUI() {
    elements.cuadricula.innerHTML = ''; // Limpiar por si acaso
    for (let i = 1; i <= TOTAL_BOLAS; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        span.id = `bola-${i}`;
        elements.cuadricula.appendChild(span);
    }
}

function actualizarDisplayVelocidad() {
    const segundos = elements.selectorVelocidad.value;
    elements.valorVelocidad.textContent = `${segundos} segundos`;
}

function reproducirSonido(numero) {
    const rutaAudio = `${CARPETA_AUDIO}${numero}.mp3`;
    const audio = new Audio(rutaAudio);
    audio.play().catch(error => {
        console.warn("No se pudo reproducir el audio (posiblemente falta interacción del usuario):", error);
    });
}

function marcarBolaEnCuadricula(numero) {
    const elemento = document.getElementById(`bola-${numero}`);
    if (elemento) {
        elemento.classList.add('extraida');
    }
}


// Configuración de Eventos del Juego

bingo.onBolaExtraida = (bola) => {
    reproducirSonido(bola);
    marcarBolaEnCuadricula(bola);
    elements.resultado.textContent = bola;
};

bingo.onJuegoTerminado = () => {
    setTimeout(() => {
        elements.resultado.textContent = "Fin";
        alert("¡Se han extraído todas las bolas!");
    }, 1000); // Esperar un poco tras la última bola
};

bingo.onEstadoCambio = (enJuego) => {
    elements.botonIniciar.disabled = enJuego;
    elements.botonPausar.disabled = !enJuego;
    elements.selectorVelocidad.disabled = enJuego;
    // El botón de reiniciar se puede deshabilitar si se quiere evitar reinicios accidentales durante el juego,
    // pero por ahora lo dejaremos habilitado o podríamos deshabilitarlo si está en juego.
    elements.botonReiniciar.disabled = enJuego;

    if (enJuego) {
        elements.botonIniciar.textContent = "Continuar Bingo";
        elements.resultado.textContent = (bingo.bolasExtraidas.length > 0) ? elements.resultado.textContent : "¡BINGO EN CURSO!";
    } else {
        elements.botonIniciar.textContent = (bingo.bolasExtraidas.length > 0) ? "Continuar Bingo" : "Iniciar Bingo";
    }
};

// Event Listeners del DOM

elements.selectorVelocidad.addEventListener('input', actualizarDisplayVelocidad);

elements.botonIniciar.addEventListener('click', () => {
    const velocidadMs = parseInt(elements.selectorVelocidad.value) * 1000;

    if (bingo.bolas.length === 0 && bingo.bolasExtraidas.length === 0) {
        bingo.inicializar();
    }

    bingo.iniciar(velocidadMs);
});

elements.botonPausar.addEventListener('click', () => {
    bingo.pausar();
    elements.resultado.textContent = "BINGO PAUSADO";
});

elements.botonReiniciar.addEventListener('click', () => {
    if (confirm("¿Estás seguro de que quieres reiniciar el juego? Se perderá el progreso actual.")) {
        bingo.reiniciar();
        // Limpiar UI
        inicializarCuadriculaUI();
        elements.resultado.textContent = "---";
        actualizarDisplayVelocidad();
    }
});

// Inicialización al cargar
inicializarCuadriculaUI();
actualizarDisplayVelocidad();

// Intentar cargar estado previo
if (bingo.cargarEstado()) {
    // Restaurar UI
    bingo.bolasExtraidas.forEach(bola => marcarBolaEnCuadricula(bola));
    if (bingo.bolasExtraidas.length > 0) {
        const ultimaBola = bingo.bolasExtraidas[bingo.bolasExtraidas.length - 1];
        elements.resultado.textContent = ultimaBola;
    }
    // Asegurar estado de botones
    bingo.onEstadoCambio(false);
} else {
    bingo.inicializar(); // Estado nuevo
}