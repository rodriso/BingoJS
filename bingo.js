

// Elementos de HTML
const displayCuadricula = document.getElementById('cuadriculaBingo');
const boton = document.getElementById('botonExtraer');
const displayResultado = document.getElementById('resultado');
const displayListaNumeros = document.getElementById('listaBolas');
const botonIniciar = document.getElementById('botonIniciar');
const botonPausar = document.getElementById('botonPausar');
const selectorVelocidad = document.getElementById('selectorVelocidad');
const valorVelocidadDisplay = document.getElementById('valorVelocidad');

//Variables 
const TOTAL_BOLAS = 90;
const bolasExtraidas = [];
const VELOCIDAD = 3000;
let intervaloId = null;
const CARPETA_AUDIO = 'audio/';

//Funciones 

//Generar un numero random del 1 al 90
const generarNumero = () => {return Math.floor(Math.random() * TOTAL_BOLAS) + 1;} 

function actualizarDisplayVelocidad() {
    // Lee el valor del selector (que está en segundos)
    const segundos = selectorVelocidad.value;
    valorVelocidadDisplay.textContent = `${segundos} segundos`;
}

selectorVelocidad.addEventListener('input', actualizarDisplayVelocidad);

//Extraer la siguiente bola del bombo 
function extraerBola(){
if (bolasExtraidas.length == TOTAL_BOLAS){
    return false
}
let ultimaBola;
do{
    ultimaBola = generarNumero();

}
while(bolasExtraidas.includes(ultimaBola)) //Mientras el numero generado ya haya salido
bolasExtraidas.push(ultimaBola)
return ultimaBola;
}


// Inicializar cuadricula

function inicializarCuadricula(){
    for (let i = 1; i <= TOTAL_BOLAS; i++){
        // Creamos un elemento de tipo span
        const numeroElemento = document.createElement('span');

        // A este elemento se le mete el número de la lista
        numeroElemento.textContent = i;

        //Se le asigna una id 
        numeroElemento.id = `bola-${i}`;

        //Se le añade al div padre
        displayCuadricula.appendChild(numeroElemento);

    }
}

// Edición de los elementos del html al extraer una bola.
function manejarExtraccion() {
    const bola = extraerBola();
    if (bola != false){
        displayResultado.textContent = bola;
        const elementoAMarcar = document.getElementById(`bola-${bola}`);
        elementoAMarcar.classList.add('extraida');
        reproducirSonido(bola);
    }
    else{
        pausarBingo();
        displayResultado.textContent = "Fin";
    }
}

function reproducirSonido(numero) {

    const rutaAudio = `${CARPETA_AUDIO}${numero}.mp3`;
    const audio = new Audio(rutaAudio);
    audio.play().catch(error => {
        console.error("Error al intentar reproducir el audio:", error);
    });
}

function actualizarControles(iniciarDesactivado) {
    botonIniciar.disabled = iniciarDesactivado;
    botonPausar.disabled = !iniciarDesactivado; // Pausar es lo opuesto a Iniciar
}

function iniciarBingo() {
    if (intervaloId !== null) return; 

    const velocidadMilisegundos = obtenerVelocidadUsuario(); // Convertir a ms

    // Iniciar el temporizador usando el valor dinámico
    intervaloId = setInterval(manejarExtraccion, velocidadMilisegundos);

    actualizarControles(true);

    botonIniciar.textContent = "Continuar Bingo"; //Cambio texto de botón de iniciar a continuar
    displayResultado.textContent = "¡BINGO EN CURSO!";

    // Desactivar el selector de velocidad mientras el juego está activo
    selectorVelocidad.disabled = true; 
}


function obtenerVelocidadUsuario() {
    const segundosSeleccionados = parseInt(selectorVelocidad.value); // Obtiene el valor (3-10)
    const velocidadMilisegundos = segundosSeleccionados * 1000; // Convertir a ms
    return velocidadMilisegundos;
}

function pausarBingo() {
   
    clearInterval(intervaloId);
    botonIniciar.textContent = "Continuar Bingo"
    intervaloId = null; 
    actualizarControles(false); // Desactivar Pausar
    displayResultado.textContent = "BINGO PAUSADO. Revisando cartones...";
}



botonIniciar.addEventListener('click', iniciarBingo);
botonPausar.addEventListener('click', pausarBingo);
inicializarCuadricula();
actualizarControles(false);