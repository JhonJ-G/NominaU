document.getElementById('salary-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Obtener los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const experiencia = parseInt(document.getElementById('experiencia').value);
    const titulo = document.getElementById('titulo').value;
    
    // Calcular el salario basado en los datos de entrada
    let salarioBase = 0;
    let puntosExperiencia = 0;
    let puntosTitulo = 0;
    
    // Asignar salario base según la categoría
    switch (categoria) {
        case 'instructor':
            salarioBase = 3000000;
            break;
        case 'asistente':
            salarioBase = 4000000;
            break;
        case 'asociado':
            salarioBase = 5000000;
            break;
        case 'titular':
            salarioBase = 6000000;
            break;
    }
    
    // Calcular puntos por experiencia
    puntosExperiencia = experiencia * 4; // Ejemplo: 4 puntos por año de experiencia
    
    // Calcular puntos por título
    switch (titulo) {
        case 'pregrado':
            puntosTitulo = 178;
            break;
        case 'medicina':
            puntosTitulo = 183;
            break;
        case 'especializacion':
            puntosTitulo = calcularPuntosEspecializacion(experiencia);
            break;
        case 'maestria':
            puntosTitulo = 40;
            break;
        case 'doctorado':
            puntosTitulo = calcularPuntosDoctorado(experiencia, puntosTitulo);
            break;
    }
    
    // Calcular el salario total
    const salarioTotal = salarioBase + (puntosExperiencia * 10000) + (puntosTitulo * 10000);
    
    // Mostrar los resultados
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `
        <p>Nombre: ${nombre}</p>
        <p>Categoría: ${categoria}</p>
        <p>Años de Experiencia: ${experiencia}</p>
        <p>Título Universitario: ${titulo}</p>
        <p><strong>Salario Total: $${salarioTotal.toLocaleString()}</strong></p>
    `;
});

function calcularPuntosEspecializacion(experiencia) {
    // Calcular puntos por especialización según el acuerdo 006 de 2018
    let puntos = 0;
    if (experiencia >= 1 && experiencia <= 2) {
        puntos = 20;
    } else if (experiencia > 2) {
        puntos = 30;
    }
    return puntos;
}

function calcularPuntosDoctorado(experiencia, puntosTitulo) {
    // Calcular puntos por doctorado según el decreto 1279
    if (puntosTitulo > 0) {
        return 80;
    } else {
        return 120;
    }
}
