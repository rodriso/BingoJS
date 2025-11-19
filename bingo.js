const TOTAL_BOLAS = 90;
const bolasExtraidas = [];
const generarNumero = () => {return Math.floor(Math.random() * TOTAL_BOLAS) + 1;} 

function extraerBola(){
if (bolasExtraidas.length == TOTAL_BOLAS){
    return "¡Juego terminado! Alguien ha tenido que cantar bingo"
}
let ultimaBola;
do{
    ultimaBola = generarNumero();

}
while(bolasExtraidas.includes(ultimaBola)) //Mientras el numero generado ya haya salido
bolasExtraidas.push(ultimaBola)
return ultimaBola;
}



const boton = document.getElementById('botonExtraer');
const displayResultado = document.getElementById('resultado');
const displayListaNumeros = document.getElementById('listaBolas');

function manejarExtraccion() {

    const mensaje = extraerBola();
    displayListaNumeros.textContent = bolasExtraidas
    

    displayResultado.textContent = mensaje;

}

boton.addEventListener('click', manejarExtraccion);
