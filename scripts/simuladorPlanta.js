function calcularTotalPuntos(datosProfesor) {
    let puntos = 0;
    let desglose = {};

    // Títulos de pregrado
    if (datosProfesor.tipoPregrado === 'Medicina Humana' || datosProfesor.tipoPregrado === 'Composición Musical') {
        puntos += 183;
        desglose.titulo = 183;
    } else {
        puntos += 178;
        desglose.titulo = 178;
    }

    // Títulos de posgrado
    let puntosPosgrado = 0;
    if (datosProfesor.numEspecializaciones > 0) {
        if (datosProfesor.tipoPregrado === 'Medicina Humana') {
            puntosPosgrado += Math.min(datosProfesor.duracionEspecializacion * 15, 75);
            desglose.especializacion = puntosPosgrado;
        } else {
            puntosPosgrado += datosProfesor.numEspecializaciones > 1 ? 30 : 20;
            desglose.especializacion = puntosPosgrado;
        }
    }

    if (datosProfesor.numMaestrias > 0) {
        puntosPosgrado += datosProfesor.numMaestrias > 1 ? 60 : 40;
        desglose.maestria = puntosPosgrado;
    }

    if (datosProfesor.numDoctorados > 0) {
        puntosPosgrado += datosProfesor.numDoctorados > 1 ? 120 : 80;
        desglose.doctorado = puntosPosgrado;
    }

    if (datosProfesor.numDoctorados > 0 && datosProfesor.doctoradoPost1998 && datosProfesor.numMaestrias === 0) {
        puntos += 40; // Agregar 40 puntos si el doctorado es post 1998 y no hay maestrías
        desglose.doctoradoPost1998 = 40;
    } else {
        desglose.doctoradoPost1998 = 0;
    }

    puntos += Math.min(puntosPosgrado, 140);
    desglose.posgradosTotal = puntosPosgrado;

    // Escalafón docente
    const escalafonPuntos = {
        'instructor': 37,
        'instructorUNAL': 44,
        'asistente': 58,
        'asociado': 74,
        'titular': 96
    };
    puntos += escalafonPuntos[datosProfesor.categoria] || 0;
    desglose.escalafon = escalafonPuntos[datosProfesor.categoria] || 0;

    // Experiencia calificada
    let puntosDocencia = datosProfesor.aniosDocencia * 4;
    let puntosInvestigacion = datosProfesor.aniosInvestigacion * 6;
    let puntosDireccion = datosProfesor.aniosDireccion * 4;
    let puntosProfesional = datosProfesor.aniosProfesional * 3;
    let puntosExperiencia = puntosDocencia + puntosInvestigacion + puntosDireccion + puntosProfesional;

    // Tope según categoría (asegúrate de usar minúsculas)
    const topesExperiencia = {
        'instructor': 20,
        'instructorunal': 20,
        'asistente': 45,
        'asociado': 90,
        'titular': 120
    };
    // Normaliza la categoría a minúsculas y sin espacios para el tope
    const categoriaKey = (datosProfesor.categoria || '').toLowerCase().replace(/\s+/g, '');
    const tope = topesExperiencia[categoriaKey] || 0;
    const experienciaCalificada = Math.min(puntosExperiencia, tope);

    // Desglose de experiencia
    desglose.experienciaCalificada = experienciaCalificada;
    desglose.experiencia = {
        docencia: puntosDocencia,
        investigacion: puntosInvestigacion,
        direccion: puntosDireccion,
        profesional: puntosProfesional
    };

    puntos += experienciaCalificada;

    // Productividad académica: artículos, obras y libros (NO tesis)
    let puntosArticulos = 0;
    ['a1', 'a2', 'b', 'c'].forEach(categoria => {
        const numArticulos = parseInt(datosProfesor[`articulos${categoria.toUpperCase()}`]) || 0;
        for (let i = 1; i <= numArticulos; i++) {
            const puntajeArticulo = parseFloat(document.getElementById(`puntaje-${categoria}-${i}`)?.textContent || '0');
            puntosArticulos += puntajeArticulo;
        }
    });
    desglose.articulos = puntosArticulos;

    let puntosObras = 0;
    for (let i = 1; i <= (parseInt(datosProfesor.obrasInternacional) || 0); i++) {
        const puntajeObra = parseFloat(document.getElementById(`puntaje-obra-inter-${i}`)?.textContent || '20');
        puntosObras += puntajeObra;
    }
    for (let i = 1; i <= (parseInt(datosProfesor.obrasNacional) || 0); i++) {
        const puntajeObra = parseFloat(document.getElementById(`puntaje-obra-nac-${i}`)?.textContent || '14');
        puntosObras += puntajeObra;
    }
    desglose.obras = puntosObras;

    let puntosLibros = 0;
    const numLibros = parseInt(datosProfesor.numLibros) || 0;
    for (let i = 1; i <= numLibros; i++) {
        const puntajeLibro = parseFloat(document.getElementById(`puntaje-libro-${i}`)?.textContent || '0');
        puntosLibros += puntajeLibro;
    }
    desglose.libros = puntosLibros;

    // Sumar artículos + obras + libros para el tope de productividad académica
    let sumaProductividad = puntosArticulos + puntosObras + puntosLibros;

    // Tope máximo de productividad académica según categoría docente (aplica a la suma, no a cada rubro)
    const topesProductividad = {
        'instructor': 80,
        'instructorunal': 80,
        'asistente': 160,
        'asociado': 320,
        'titular': 540
    };
    // Normaliza la categoría a minúsculas y sin espacios
    const categoriaKeyProd = (datosProfesor.categoria || '').toLowerCase().replace(/\s+/g, '');
    const topeProductividad = topesProductividad[categoriaKeyProd] || 0;
    const puntosProductividad = Math.min(sumaProductividad, topeProductividad);

    desglose.productividad = puntosProductividad;

    // Calcular puntos por tesis dirigidas (fuera del tope de productividad académica)
    let puntosTesis = 0;

    // Tesis de maestría
    const numTesisMaestria = parseInt(datosProfesor.numTesisMaestria) || 0;
    const numTesisMultipleDirectoresMaestria = parseInt(document.getElementById('num-tesis-multiple-maestria')?.value || '0');
    const numTesisIndividualesMaestria = numTesisMaestria - numTesisMultipleDirectoresMaestria;

    puntosTesis += numTesisIndividualesMaestria * 36; // Puntos para tesis individuales de maestría

    for (let i = 1; i <= numTesisMultipleDirectoresMaestria; i++) {
        const numDirectores = parseInt(document.getElementById(`directores-maestria-${i}`)?.value || '1');
        puntosTesis += 36 / numDirectores; // Puntos para tesis con múltiples directores de maestría
    }

    // Tesis de doctorado
    const numTesisDoctorado = parseInt(datosProfesor.numTesisDoctorado) || 0;
    const numTesisMultipleDirectoresDoctorado = parseInt(document.getElementById('num-tesis-multiple-doctorado')?.value || '0');
    const numTesisIndividualesDoctorado = numTesisDoctorado - numTesisMultipleDirectoresDoctorado;

    puntosTesis += numTesisIndividualesDoctorado * 72; // Puntos para tesis individuales de doctorado

    for (let i = 1; i <= numTesisMultipleDirectoresDoctorado; i++) {
        const numDirectores = parseInt(document.getElementById(`directores-doctorado-${i}`)?.value || '1');
        puntosTesis += 72 / numDirectores; // Puntos para tesis con múltiples directores de doctorado
    }

    desglose.tesis = puntosTesis;

    // Sumar todos los puntos al total
    puntos += puntosProductividad + puntosTesis;

    return { total: puntos, desglose: desglose };
}



// Función para inicializar los event listeners de los campos de posgrado
function initializarControlPosgrados() {
    const doctoradosSelect = document.getElementById('doctorados');
    const maestriasSelect = document.getElementById('maestrias');
    const checkboxPost1998 = document.getElementById('doctorado-post-1998');

    if (doctoradosSelect && maestriasSelect && checkboxPost1998) {
        function actualizarEstadoCheckbox() {
            const numDoctorados = parseInt(doctoradosSelect.value) || 0;
            const numMaestrias = parseInt(maestriasSelect.value) || 0;

            // Habilitar solo si hay doctorados y no hay maestrías
            checkboxPost1998.disabled = !(numDoctorados > 0 && numMaestrias === 0);

            if (checkboxPost1998.disabled) {
                checkboxPost1998.checked = false; // Desmarcar si está deshabilitado
            }
        }

        // Agregar eventos para actualizar el estado del checkbox
        doctoradosSelect.addEventListener('change', actualizarEstadoCheckbox);
        maestriasSelect.addEventListener('change', actualizarEstadoCheckbox);

        // Ejecutar al cargar la página
        actualizarEstadoCheckbox();
    }
}

// Inicializar cuando se carga la pestaña de profesores de planta
document.addEventListener('DOMContentLoaded', function() {
    const plantaTab = document.getElementById('planta-tab');
    if (plantaTab) {
        initializarControlPosgrados();
    }
});

function calcularSalarioPlanta(datosProfesor, valorPunto) {
    datosProfesor.tipoProfesor = 'planta';
    const resultado = calcularTotalPuntos(datosProfesor);

    // El total de puntos YA incluye el tope de productividad académica, no sumar artículos aparte
    const totalPuntos = resultado.total;

    const salarioMensual = totalPuntos * valorPunto; // Calcular el salario con el total ajustado

    return {
        puntos: totalPuntos, // Total ajustado
        puntosProductividad: resultado.desglose.productividad || 0, // Incluir puntos de productividad en el resultado
        desglosePuntos: resultado.desglose,
        salarioMensual: salarioMensual,
        salarioTrimestral: salarioMensual * 3,
        salarioSemestral: salarioMensual * 6,
        salarioAnual: salarioMensual * 12
    };
}

// Primero verificar si el elemento existe
const formPlanta = document.getElementById('salary-form-planta');

if (formPlanta) {
    formPlanta.addEventListener('submit', function(event) {
        event.preventDefault();
    
        // Obtener todos los valores del formulario
        const datosProfesor = {
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value, // Debe ser: instructor, asistente, asociado, titular
            tipoPregrado: document.getElementById('titulo-pregrado').value,
            numEspecializaciones: parseInt(document.getElementById('especializaciones').value),
            duracionEspecializacion: parseInt(document.getElementById('duracion-especializacion').value),
            numMaestrias: parseInt(document.getElementById('maestrias').value),
            numDoctorados: parseInt(document.getElementById('doctorados').value),
            doctoradoPost1998: document.getElementById('doctorado-post-1998').checked,
            aniosDocencia: parseInt(document.getElementById('experiencia-docencia').value) || 0,
            aniosInvestigacion: parseInt(document.getElementById('experiencia-investigacion').value) || 0,
            aniosDireccion: parseInt(document.getElementById('experiencia-direccion').value) || 0,
            aniosProfesional: parseInt(document.getElementById('experiencia-profesional').value) || 0,
            cargo: document.getElementById('cargo').value,
            aniosCargo: parseInt(document.getElementById('anios-cargo').value),
            obrasInternacional: parseInt(document.getElementById('obras-artisticas-inter').value),
            obrasNacional: parseInt(document.getElementById('obras-artisticas-nac').value),
            articulosA1: parseInt(document.getElementById('articulos-a1').value),
            articulosA2: parseInt(document.getElementById('articulos-a2').value),
            articulosB: parseInt(document.getElementById('articulos-b').value),
            articulosC: parseInt(document.getElementById('articulos-c').value),
            numLibros: parseInt(document.getElementById('libros').value),
            numTesisMaestria: parseInt(document.getElementById('tesis-maestria').value) || 0,
            numTesisDoctorado: parseInt(document.getElementById('tesis-doctorado').value) || 0,
        };
        
        const valorPunto = parseInt(document.getElementById('valor-punto').value);
        
        // Calcular el salario
        const resultado = calcularSalarioPlanta(datosProfesor, valorPunto);
        
        // Mostrar la sección de resultados
        const seccionResultados = document.getElementById('resultados-planta');
        seccionResultados.classList.add('visible');
        
        // Mostrar los resultados
        mostrarResultadosPlanta(datosProfesor, resultado);
        
        // Guardar el profesor temporalmente para poder agregarlo a la nómina
        window.profesorTemporal = {
            tipo: 'planta',
            datos: datosProfesor,
            resultado: resultado
        };
        
        // Limpiar el formulario excepto el valor del punto que permanece constante
        limpiarFormularioPlanta();
    
        // Desplazar a la sección de resultados
        document.querySelector('#resultados-planta').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
} else {
    console.error('ERROR: No se encontró el formulario con ID "salary-form-planta"');
    // Intentar con otro posible ID
    const alternativeForm = document.querySelector('#planta-tab form') || 
                           document.querySelector('form[id*="planta"]');
    
    if (alternativeForm) {
        console.log('Se encontró un formulario alternativo:', alternativeForm.id);
        alternativeForm.addEventListener('submit', function(event) {
            event.preventDefault();
    
            // Obtener todos los valores del formulario
            const datosProfesor = {
                nombre: document.getElementById('nombre').value,
                categoria: document.getElementById('categoria').value, // Debe ser: instructor, asistente, asociado, titular
                tipoPregrado: document.getElementById('titulo-pregrado').value,
                numEspecializaciones: parseInt(document.getElementById('especializaciones').value),
                duracionEspecializacion: parseInt(document.getElementById('duracion-especializacion').value),
                numMaestrias: parseInt(document.getElementById('maestrias').value),
                numDoctorados: parseInt(document.getElementById('doctorados').value),
                doctoradoPost1998: document.getElementById('doctorado-post-1998').checked,
                aniosDocencia: parseInt(document.getElementById('experiencia-docencia').value) || 0,
                aniosInvestigacion: parseInt(document.getElementById('experiencia-investigacion').value) || 0,
                aniosDireccion: parseInt(document.getElementById('experiencia-direccion').value) || 0,
                aniosProfesional: parseInt(document.getElementById('experiencia-profesional').value) || 0,
                cargo: document.getElementById('cargo').value,
                aniosCargo: parseInt(document.getElementById('anios-cargo').value),
                obrasInternacional: parseInt(document.getElementById('obras-artisticas-inter').value),
                obrasNacional: parseInt(document.getElementById('obras-artisticas-nac').value),
                articulosA1: parseInt(document.getElementById('articulos-a1').value),
                articulosA2: parseInt(document.getElementById('articulos-a2').value),
                articulosB: parseInt(document.getElementById('articulos-b').value),
                articulosC: parseInt(document.getElementById('articulos-c').value),
                numLibros: parseInt(document.getElementById('libros').value),
                numTesisMaestria: parseInt(document.getElementById('tesis-maestria').value) || 0,
                numTesisDoctorado: parseInt(document.getElementById('tesis-doctorado').value) || 0,
            };
            
            const valorPunto = parseInt(document.getElementById('valor-punto').value);
            
            // Calcular el salario
            const resultado = calcularSalarioPlanta(datosProfesor, valorPunto);
            
            // Mostrar la sección de resultados
            const seccionResultados = document.getElementById('resultados-planta');
            seccionResultados.classList.add('visible');
            
            // Mostrar los resultados
            mostrarResultadosPlanta(datosProfesor, resultado);
            
            // Guardar el profesor temporalmente para poder agregarlo a la nómina
            window.profesorTemporal = {
                tipo: 'planta',
                datos: datosProfesor,
                resultado: resultado
            };
            
            // Limpiar el formulario excepto el valor del punto que permanece constante
            limpiarFormularioPlanta();
        
            // Desplazar a la sección de resultados
            document.querySelector('#resultados-planta').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}

// Asegurarnos que profesoresEnNomina existe
if (typeof profesoresEnNomina === 'undefined') {
    var profesoresEnNomina = [];
}

// Modificar la función mostrarResultadosPlanta para corregir el problema de scope
function mostrarResultadosPlanta(datosProfesor, resultado) {
    console.log('Iniciando mostrarResultadosPlanta');
    console.log('Datos del profesor:', datosProfesor);
    console.log('Resultado del cálculo:', resultado);
    
    // Primero asegurarnos que existe el contenedor principal
    let resultadosPlanta = document.getElementById('resultados-planta');
    if (!resultadosPlanta) {
        console.error('ERROR: No existe el elemento #resultados-planta en el HTML');
        // Crear el contenedor si no existe
        resultadosPlanta = document.createElement('div');
        resultadosPlanta.id = 'resultados-planta';
        document.body.appendChild(resultadosPlanta);
        console.log('Se ha creado el elemento #resultados-planta');
    }
    
    // Asegurarnos que existe el contenedor de resultados
    let contenedor = document.querySelector('#resultados-planta .resultados-content');
    if (!contenedor) {
        console.log('Creando el contenedor .resultados-content');
        contenedor = document.createElement('div');
        contenedor.className = 'resultados-content';
        resultadosPlanta.appendChild(contenedor);
    }

    // A partir de aquí el código es similar
    const valorPunto = parseInt(document.getElementById('valor-punto').value);
    
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }

    let html = `
        <div class="resultados-card">
            <div class="resultados-header">
                <h3>Resultados del Cálculo</h3>
                <p class="profesor-nombre" data-nombre="${datosProfesor.nombre}">Profesor: ${datosProfesor.nombre}</p>
            </div>
            
            <div class="salary-details">
                <div class="salary-period">
                    <h4>Salario Mensual</h4>
                    <p class="amount" data-salario-mensual="${resultado.salarioMensual}">$${formatearMoneda(resultado.salarioMensual)}</p>
                </div>
                <div class="salary-period">
                    <h4>Salario Trimestral</h4>
                    <p class="amount">$${formatearMoneda(resultado.salarioTrimestral)}</p>
                </div>
                <div class="salary-period">
                    <h4>Salario Semestral</h4>
                    <p class="amount">$${formatearMoneda(resultado.salarioSemestral)}</p>
                </div>
                <div class="salary-period">
                    <h4>Salario Anual</h4>
                    <p class="amount">$${formatearMoneda(resultado.salarioAnual)}</p>
                </div>
            </div>
            
            <div class="points-breakdown">
                <h4>Desglose de Puntos</h4>
                <div class="points-grid">
                    <div class="point-item">
                        <span>Categoría (<span data-categoria="${datosProfesor.categoria}">${datosProfesor.categoria}</span>)</span>
                        <span class="point-value">${resultado.desglosePuntos.escalafon || 0}</span>
                    </div>
                    <div class="point-item">
                        <span>Título de Pregrado</span>
                        <span class="point-value">${resultado.desglosePuntos.titulo || 0}</span>
                    </div>
                    <div class="point-item">
                        <span>Total Posgrados</span>
                        <span class="point-value">${Math.min(resultado.desglosePuntos.posgradosTotal || 0, 140)}</span>
                    </div>

<div class="point-item">
                        <span>Puntaje por Doctorado Post-1998</span>
                        <span class="point-value">${resultado.desglosePuntos.doctoradoPost1998 || 0}</span>
                        <small>${resultado.desglosePuntos.razonDoctoradoPost1998 || ''}</small>
                    </div>

                    <div class="point-item">
                        <span>Experiencia</span>
                        <span class="point-value">${resultado.desglosePuntos.experienciaCalificada || 0}</span>
                    </div>
                 
                    <div class="point-item">
                        <span>Puntaje por Artículos</span>
                        <span class="point-value">${resultado.desglosePuntos.articulos || 0}</span>
                    </div>
        
                    <div class="point-item">
                        <span>Obras Artísticas</span>
                        <span class="point-value">${resultado.desglosePuntos.obras || 0}</span>
                    </div>

                    <div class="point-item">
    <span>Puntaje por Libros Publicados</span>
    <span class="point-value">${resultado.desglosePuntos.libros || 0}</span>
</div>

                    <div class="point-item">
                        <span>Tesis Dirigidas</span>
                        <span class="point-value">${resultado.desglosePuntos.tesis || 0}</span>
                    </div>
                    <div class="point-item total">
                        <span>TOTAL PUNTOS</span>
                        <span class="point-value" data-puntos-totales="${resultado.puntos}">
    ${resultado.puntos}
</span>
                    </div>
                    
                </div>
                <p class="valor-punto">Valor del punto: $${formatearMoneda(valorPunto)}</p>
            </div>
            
            <div class="result-actions">
                <button type="button" class="primary-button agregar-nomina-btn" onclick="agregarProfesorANomina(window.profesorTemporal)">
                    Agregar a Nómina
                </button>
                <button type="button" class="secondary-button" onclick="limpiarFormularioPlanta()">
                    Calcular Nuevo
                </button>
            </div>
        </div>
    `;
    
    // Establecer el contenido
    contenedor.innerHTML = html;
    
    // Asegurar que la sección de resultados sea visible
    resultadosPlanta.style.display = 'block';
    
    console.log('Resultados mostrados correctamente');
}

// Función para limpiar el formulario de profesores de planta
function limpiarFormularioPlanta() {
    // Limpiar los campos de texto
    document.getElementById('nombre').value = '';
    
    // Restablecer los campos numéricos a 0
    document.getElementById('experiencia-docencia').value = '0';
    document.getElementById('experiencia-investigacion').value = '0';
    document.getElementById('experiencia-direccion').value = '0';
    document.getElementById('experiencia-profesional').value = '0';
    document.getElementById('duracion-especializacion').value = '0';
    document.getElementById('obras-artisticas-inter').value = '0';
    document.getElementById('obras-artisticas-nac').value = '0';
    document.getElementById('articulos-a1').value = '0';
    document.getElementById('articulos-a2').value = '0';
    document.getElementById('articulos-b').value = '0';
    document.getElementById('articulos-c').value = '0';
    document.getElementById('libros').value = '0';
    document.getElementById('tesis-maestria').value = '0';
    document.getElementById('tesis-doctorado').value = '0';
    document.getElementById('anios-cargo').value = '0';
    
    // Restablecer selects a sus valores predeterminados
    document.getElementById('categoria').selectedIndex = 0;
    document.getElementById('titulo-pregrado').selectedIndex = 0;
    document.getElementById('especializaciones').selectedIndex = 0;
    document.getElementById('maestrias').selectedIndex = 0;
    document.getElementById('doctorados').selectedIndex = 0;
    document.getElementById('cargo').selectedIndex = 0;
    
    // Limpiar los campos dinámicos de productividad académica
    // Artículos
    ['a1', 'a2', 'b', 'c'].forEach(cat => {
        const autoresContainer = document.getElementById(`autores-${cat}-container`);
        if (autoresContainer) autoresContainer.innerHTML = '';
    });
    // Libros
    const librosContainer = document.getElementById('libros-container');
    if (librosContainer) librosContainer.innerHTML = '';
    // Obras artísticas
    const obrasInterContainer = document.getElementById('obras-inter-container');
    if (obrasInterContainer) obrasInterContainer.innerHTML = '';
    const obrasNacContainer = document.getElementById('obras-nac-container');
    if (obrasNacContainer) obrasNacContainer.innerHTML = '';
    // Directores de tesis
    const directoresMaestriaContainer = document.getElementById('directores-maestria-container');
    if (directoresMaestriaContainer) directoresMaestriaContainer.innerHTML = '';
    const directoresDoctoradoContainer = document.getElementById('directores-doctorado-container');
    if (directoresDoctoradoContainer) directoresDoctoradoContainer.innerHTML = '';

    // Restablecer los campos de múltiples directores de tesis
    if (document.getElementById('num-tesis-multiple-maestria')) {
        document.getElementById('num-tesis-multiple-maestria').value = '0';
    }
    if (document.getElementById('num-tesis-multiple-doctorado')) {
        document.getElementById('num-tesis-multiple-doctorado').value = '0';
    }
    if (document.getElementById('multiple-directores-maestria')) {
        document.getElementById('multiple-directores-maestria').checked = false;
        document.getElementById('multiple-directores-maestria-container').style.display = 'none';
    }
    if (document.getElementById('multiple-directores-doctorado')) {
        document.getElementById('multiple-directores-doctorado').checked = false;
        document.getElementById('multiple-directores-doctorado-container').style.display = 'none';
    }
    
    // Poner el foco en el campo de nombre para facilitar la entrada de un nuevo profesor
    document.getElementById('nombre').focus();
    
    // Ocultar resultados al limpiar
    const seccionResultados = document.getElementById('resultados-planta');
    seccionResultados.classList.remove('visible');
}

function agregarProfesorANomina(profesorTemporal) {
    if (!profesorTemporal) {
        console.error('No hay datos del profesor para agregar');
        return;
    }

    // Usar la función global de nomina.js
    if (typeof window.agregarProfesorANomina === 'function') {
        window.agregarProfesorANomina(profesorTemporal);
        
        // Limpiar el formulario y los resultados después de agregar
        limpiarFormularioPlanta();
        document.querySelector('#resultados-planta .resultados-content').innerHTML = 
            '<p class="success-mensaje">Profesor agregado a la nómina correctamente.</p>';
            
        // Cambiar a la pestaña de nómina
        const nominaTab = document.querySelector('[data-tab="nomina"]');
        if (nominaTab) {
            nominaTab.click();
        }
    } else {
        console.error('La función agregarProfesorANomina no está disponible');
    }
}

// Configuración inicial al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Inicializando simulador de profesores de planta');
    
    // Inicializar control de posgrados
    initializarControlPosgrados();
    
    // Ocultar resultados inicialmente
    const seccionResultados = document.getElementById('resultados-planta');
    if (seccionResultados) {
        seccionResultados.classList.remove('visible');
        seccionResultados.style.display = 'none';
    }
    
    // Buscar el formulario de profesores de planta
    const formPlanta = document.getElementById('salary-form-planta') || 
                       document.querySelector('#planta-tab form') || 
                       document.querySelector('form[id*="planta"]');
    
    if (formPlanta) {
        console.log('Formulario de profesores de planta encontrado:', formPlanta.id);
        
        // Eliminar cualquier event listener previo (por si acaso)
        const newForm = formPlanta.cloneNode(true);
        formPlanta.parentNode.replaceChild(newForm, formPlanta);
        
        // Agregar el event listener al formulario
        newForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Formulario de profesores de planta enviado');
            
            try {
                // Obtener todos los valores del formulario
                const datosProfesor = {
                    nombre: document.getElementById('nombre').value,
                    categoria: document.getElementById('categoria').value, // Debe ser: instructor, asistente, asociado, titular
                    tipoPregrado: document.getElementById('titulo-pregrado').value,
                    numEspecializaciones: parseInt(document.getElementById('especializaciones').value) || 0,
                    duracionEspecializacion: parseInt(document.getElementById('duracion-especializacion').value) || 0,
                    numMaestrias: parseInt(document.getElementById('maestrias').value) || 0,
                    numDoctorados: parseInt(document.getElementById('doctorados').value) || 0,
                    doctoradoPost1998: document.getElementById('doctorado-post-1998').checked,
                    aniosDocencia: parseInt(document.getElementById('experiencia-docencia').value) || 0,
                    aniosInvestigacion: parseInt(document.getElementById('experiencia-investigacion').value) || 0,
                    aniosDireccion: parseInt(document.getElementById('experiencia-direccion').value) || 0,
                    aniosProfesional: parseInt(document.getElementById('experiencia-profesional').value) || 0,
                    cargo: document.getElementById('cargo').value,
                    aniosCargo: parseInt(document.getElementById('anios-cargo').value) || 0,
                    obrasInternacional: parseInt(document.getElementById('obras-artisticas-inter').value) || 0,
                    obrasNacional: parseInt(document.getElementById('obras-artisticas-nac').value) || 0,
                    articulosA1: parseInt(document.getElementById('articulos-a1').value) || 0,
                    articulosA2: parseInt(document.getElementById('articulos-a2').value) || 0,
                    articulosB: parseInt(document.getElementById('articulos-b').value) || 0,
                    articulosC: parseInt(document.getElementById('articulos-c').value) || 0,
                    numLibros: parseInt(document.getElementById('libros').value) || 0,
                    numTesisMaestria: parseInt(document.getElementById('tesis-maestria').value) || 0,
                    numTesisDoctorado: parseInt(document.getElementById('tesis-doctorado').value) || 0,
                };
                
                const valorPunto = parseInt(document.getElementById('valor-punto').value) || 0;
                
                console.log('Datos del profesor capturados:', datosProfesor);
                console.log('Valor del punto:', valorPunto);
                
                // Calcular el salario
                const resultado = calcularSalarioPlanta(datosProfesor, valorPunto);
                console.log('Resultado del cálculo:', resultado);
                
                // Mostrar la sección de resultados
                const seccionResultados = document.getElementById('resultados-planta');
                if (seccionResultados) {
                    seccionResultados.style.display = 'block';
                    seccionResultados.classList.add('visible');
                } else {
                    console.error('No se encontró la sección de resultados con ID "resultados-planta"');
                }
                
                // Mostrar los resultados
                mostrarResultadosPlanta(datosProfesor, resultado);
                
                // Guardar el profesor temporalmente para poder agregarlo a la nómina
                window.profesorTemporal = {
                    tipo: 'planta',
                    datos: datosProfesor,
                    resultado: resultado
                };
                
                // Desplazar a la sección de resultados
                document.querySelector('#resultados-planta').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } catch (error) {
                console.error('Error al procesar el formulario:', error);
                alert('Error al calcular el salario: ' + error.message);
            }
        });
    } else {
        console.error('ERROR CRÍTICO: No se encontró ningún formulario para profesores de planta');
        alert('Error: No se pudo encontrar el formulario de profesores de planta.');
    }
});

// Actualizar el código que maneja el evento de agregar a nómina
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Buscar todos los botones "Agregar a Nómina" para profesores de planta
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('agregar-nomina-btn') || 
            event.target.closest('.agregar-nomina-btn')) {
                
            const button = event.target.classList.contains('agregar-nomina-btn') 
                ? event.target 
                : event.target.closest('.agregar-nomina-btn');
                
            // Si tenemos window.profesorTemporal, usamos eso directamente porque es más confiable
            if (window.profesorTemporal) {
                const datosProfesor = window.profesorTemporal.datos;
                const resultado = window.profesorTemporal.resultado;
                
                // Verificar si el profesor ya existe en la nómina
                if (profesorExisteEnNomina(datosProfesor.nombre, datosProfesor.categoria, 'Planta')) {
                    showNotification('warning', 'Profesor Duplicado', 
                        `${datosProfesor.nombre} ya ha sido agregado a la nómina con la misma categoría.`);
                    return;
                }
                
                // Crear el profesor para la nómina
                const profesor = {
                    nombre: datosProfesor.nombre,
                    categoria: datosProfesor.categoria,
                    tipo: 'Planta',
                    puntos: resultado.puntos,
                    salario: resultado.salarioMensual
                };
                
                // Guardar en localStorage
                let profesores = JSON.parse(localStorage.getItem('profesores') || '[]');
                profesores.push(profesor);
                localStorage.setItem('profesores', JSON.stringify(profesores));
                
                // Notificar éxito
                showNotification('success', 'Profesor Agregado', 
                    `${datosProfesor.nombre} ha sido agregado exitosamente a la nómina.`);
                
                // Actualizar tabla de profesores si estamos en la pestaña de nómina
                if (document.getElementById('nomina-tab').classList.contains('active')) {
                    if (typeof actualizarTablaProfesores === 'function') {
                        actualizarTablaProfesores();
                    }
                }
                
                // Limpiar el profesor temporal para evitar duplicados
                window.profesorTemporal = null;
                
                // Limpiar el formulario
                limpiarFormularioPlanta();
                
                return;
            }
            
            // Extraer datos del profesor desde el botón o resultados como respaldo
            const resultados = button.closest('.resultados');
            const datosDiv = resultados.querySelector('.resultados-content');
            
            // Obtener datos del profesor con mejor manejo de errores
            const nombreElement = datosDiv.querySelector('[data-nombre]');
            const categoriaElement = datosDiv.querySelector('[data-categoria]');
            const puntosElement = datosDiv.querySelector('[data-puntos-totales]');
            const salarioElement = datosDiv.querySelector('[data-salario-mensual]');
            
            if (!nombreElement || !categoriaElement || !puntosElement || !salarioElement) {
                showNotification('error', 'Error', 'No se pudieron obtener todos los datos del profesor.');
                console.error('Elementos faltantes:', {
                    nombre: nombreElement, 
                    categoria: categoriaElement,
                    puntos: puntosElement,
                    salario: salarioElement
                });
                return;
            }
            
            const nombre = nombreElement.getAttribute('data-nombre');
            const categoria = categoriaElement.getAttribute('data-categoria');
            const puntos = puntosElement.getAttribute('data-puntos-totales');
            const salario = salarioElement.getAttribute('data-salario-mensual');
            
            if (!nombre || !categoria || !puntos || !salario) {
                showNotification('error', 'Error', 'Faltan datos importantes del profesor.');
                console.error('Datos faltantes:', { nombre, categoria, puntos, salario });
                return;
            }
            
            // Verificar si el profesor ya existe en la nómina
            if (profesorExisteEnNomina(nombre, categoria, 'Planta')) {
                showNotification('warning', 'Profesor Duplicado', 
                    `${nombre} ya ha sido agregado a la nómina con la misma categoría.`);
                return;
            }
            
            // Continuar con el código para agregar el profesor a la nómina
            const profesor = {
                nombre,
                categoria,
                tipo: 'Planta',
                puntos,
                salario
            };
            
            // Guardar en localStorage
            let profesores = JSON.parse(localStorage.getItem('profesores') || '[]');
            profesores.push(profesor);
            localStorage.setItem('profesores', JSON.stringify(profesores));
            
            // Notificar éxito
            showNotification('success', 'Profesor Agregado', 
                `${nombre} ha sido agregado exitosamente a la nómina.`);
            
            // Actualizar tabla de profesores si estamos en la pestaña de nómina
            if (document.getElementById('nomina-tab').classList.contains('active')) {
                if (typeof actualizarTablaProfesores === 'function') {
                    actualizarTablaProfesores();
                }
            }
        }
    });
    
    // ...existing code...
});
