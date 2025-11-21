

// Elementos de HTML
const displayCuadricula = document.getElementById('cuadriculaBingo');
const boton = document.getElementById('botonExtraer');
const displayResultado = document.getElementById('resultado');
const displayListaNumeros = document.getElementById('listaBolas');
const botonIniciar = document.getElementById('botonIniciar');
const botonPausar = document.getElementById('botonPausar');

//Variables 
const TOTAL_BOLAS = 90;
const bolasExtraidas = [];
const VELOCIDAD = 3000;
let intervaloId = null;
const CARPETA_AUDIO = 'audio/';

//Funciones 

//Generar un numero random del 1 al 90
const generarNumero = () => {return Math.floor(Math.random() * TOTAL_BOLAS) + 1;} 

//Extraer la siguiente bola del bombo 
function extraerBola(){
if (bolasExtraidas.length == TOTAL_BOLAS){
    return null
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
    if (bola != null){
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

function iniciarBingo() {
    // 1. Verificar si ya está corriendo para evitar múltiples temporizadores
    if (intervaloId !== null) return; 

    //Iniciar el temporizador
    intervaloId = setInterval(manejarExtraccion, VELOCIDAD);
    
    //Actualizar la interfaz
    accionesSobreBotones(); // Activar Pausar
    displayResultado.textContent = "¡BINGO EN CURSO!";

    function accionesSobreBotones() {
        botonIniciar.disabled = true; // Desactivar Iniciar
        botonPausar.disabled = false;
    }
}

function pausarBingo() {
   
    clearInterval(intervaloId);
    botonIniciar.textContent = "Continuar Bingo"

    intervaloId = null; 

    accionesSobreBotones(); // Desactivar Pausar
    displayResultado.textContent = "BINGO PAUSADO. Revisando cartones...";

    function accionesSobreBotones() {
        botonIniciar.disabled = false; // Activar Iniciar
        botonPausar.disabled = true;
    }
}

botonIniciar.addEventListener('click', iniciarBingo);
botonPausar.disabled = true;
botonPausar.addEventListener('click', pausarBingo);
inicializarCuadricula();