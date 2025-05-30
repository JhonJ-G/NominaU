// Al inicio del archivo
console.log('Utils loaded');

// Funciones de utilidad para la aplicación

// Agregar función de debug
function debug(message) {
    console.log(`[Debug] ${message}`);
}

// Formatear números como moneda colombiana
function formatMoney(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Validar que un campo tenga un valor numérico válido
function validarNumero(valor, minimo = 0) {
    const num = parseInt(valor);
    return !isNaN(num) && num >= minimo;
}

// Obtener el valor de un campo, con validación
function obtenerValorNumerico(idCampo, valorPorDefecto = 0) {
    const campo = document.getElementById(idCampo);
    if (!campo) return valorPorDefecto;
    
    const valor = parseInt(campo.value);
    return isNaN(valor) ? valorPorDefecto : valor;
}

// Calcular porcentaje de incremento entre dos valores
function calcularPorcentajeIncremento(valorInicial, valorFinal) {
    if (valorInicial === 0) return 100;
    return ((valorFinal - valorInicial) / valorInicial) * 100;
}

/**
 * Muestra un mensaje temporal en pantalla
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
 */
function mostrarMensaje(texto, tipo = 'info') {
    // Crear el elemento del mensaje
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje ${tipo}`;
    mensaje.textContent = texto;
    
    // Añadir al DOM
    document.body.appendChild(mensaje);
    
    // Mostrar con animación
    setTimeout(() => {
        mensaje.classList.add('visible');
    }, 10);
    
    // Ocultar después de un tiempo
    setTimeout(() => {
        mensaje.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 500);
    }, 3000);
}

function actualizarCamposAutores(categoria) {
    const numArticulos = parseInt(document.getElementById(`articulos-${categoria}`).value);
    const container = document.getElementById(`autores-${categoria}-container`);
    container.innerHTML = ''; // Limpiar campos existentes

    for (let i = 1; i <= numArticulos; i++) {
        const articleContainer = document.createElement('div');
        articleContainer.className = 'article-container';
        articleContainer.innerHTML = `
            <div class="author-field">
                <label for="autores-${categoria}-${i}">Artículo ${categoria.toUpperCase()} #${i}:</label>
                <div class="article-details">
                    <div class="input-group">
                        <label>Número de autores:</label>
                        <input type="number" 
                            id="autores-${categoria}-${i}" 
                            name="autores-${categoria}-${i}" 
                            min="1" 
                            value="1" 
                            class="author-input"
                            data-article-index="${i}"
                            data-category="${categoria}">
                    </div>
                    <div class="input-group">
                        <label>Tipo de publicación:</label>
                        <select id="tipo-${categoria}-${i}" name="tipo-${categoria}-${i}">
                            <option value="regular">Artículo Regular</option>
                            <option value="comunicacion">Comunicación Corta</option>
                            <option value="reporte">Reporte de Caso/Carta al Editor</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Puntaje calculado:</label>
                        <span id="puntaje-${categoria}-${i}" class="puntaje-calculado">0</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(articleContainer);

        // Agregar evento para calcular puntaje dinámicamente
        const autoresInput = document.getElementById(`autores-${categoria}-${i}`);
        const tipoSelect = document.getElementById(`tipo-${categoria}-${i}`);
        autoresInput.addEventListener('input', () => calcularPuntajeArticulo(categoria, i));
        tipoSelect.addEventListener('change', () => calcularPuntajeArticulo(categoria, i));

        // Calcular puntaje inicial para 1 autor y tipo regular
        calcularPuntajeArticulo(categoria, i);
    }
}

/**
 * Función para actualizar los campos de libros según la cantidad ingresada
 */
function actualizarCamposLibros() {
    const numLibros = parseInt(document.getElementById('libros').value);
    const container = document.getElementById('libros-container');
    container.innerHTML = ''; // Limpiar campos existentes

    for (let i = 1; i <= numLibros; i++) {
        const libroContainer = document.createElement('div');
        libroContainer.className = 'libro-container';
        libroContainer.innerHTML = `
            <div class="libro-field">
                <label for="autores-libro-${i}">Libro #${i}:</label>
                <div class="libro-details">
                    <div class="input-group">
                        <label>Número de autores:</label>
                        <input type="number" 
                            id="autores-libro-${i}" 
                            name="autores-libro-${i}" 
                            min="1" 
                            value="1" 
                            class="author-input"
                            data-libro-index="${i}">
                    </div>
                    <div class="input-group">
                        <label>Tipo de libro:</label>
                        <select id="tipo-libro-${i}" name="tipo-libro-${i}" class="tipo-libro">
                            <option value="investigacion">Resultado de Investigación (20 puntos)</option>
                            <option value="texto">Libro de Texto (15 puntos)</option>
                            <option value="ensayo">Ensayo Académico (15 puntos)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Puntaje calculado:</label>
                        <span id="puntaje-libro-${i}" class="puntaje-calculado">0</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(libroContainer);

        // Agregar eventos para calcular puntaje dinámicamente
        const autoresInput = document.getElementById(`autores-libro-${i}`);
        const tipoSelect = document.getElementById(`tipo-libro-${i}`);
        autoresInput.addEventListener('input', () => calcularPuntajeLibro(i));
        tipoSelect.addEventListener('change', () => calcularPuntajeLibro(i));

        // Calcular puntaje inicial para 1 autor y tipo investigación
        calcularPuntajeLibro(i);
    }
}

function actualizarCamposObras(tipo) {
    const numObras = parseInt(document.getElementById(`obras-artisticas-${tipo}`).value);
    const container = document.getElementById(`obras-${tipo}-container`);
    container.innerHTML = ''; // Limpiar campos existentes

    for (let i = 1; i <= numObras; i++) {
        // Siempre mostrar el puntaje base para 1 autor al crear el campo
        const puntajeBase = tipo === 'inter' ? 20 : 14;
        const puntajeInicial = puntajeBase.toFixed(2);

        const obraContainer = document.createElement('div');
        obraContainer.className = 'obra-container';
        obraContainer.innerHTML = `
            <div class="obra-field">
                <label for="autores-obra-${tipo}-${i}">Obra ${tipo === 'inter' ? 'Internacional' : 'Nacional'} #${i}:</label>
                <div class="obra-details">
                    <div class="input-group">
                        <label>Número de autores:</label>
                        <input type="number" 
                            id="autores-obra-${tipo}-${i}" 
                            name="autores-obra-${tipo}-${i}" 
                            min="1" 
                            value="1" 
                            class="author-input"
                            data-obra-index="${i}">
                    </div>
                    <div class="input-group">
                        <label>Puntaje calculado:</label>
                        <span id="puntaje-obra-${tipo}-${i}" class="puntaje-calculado">${puntajeInicial}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(obraContainer);

        // Agregar evento para calcular puntaje dinámicamente
        const autoresInput = document.getElementById(`autores-obra-${tipo}-${i}`);
        autoresInput.addEventListener('input', () => calcularPuntajeObra(tipo, i));

        // No recalcular aquí, el puntaje inicial siempre es el base para 1 autor
    }
}

function calcularPuntajeArticulo(categoria, index) {
    const autoresInput = document.getElementById(`autores-${categoria}-${index}`);
    const tipoSelect = document.getElementById(`tipo-${categoria}-${index}`);
    const puntajeSpan = document.getElementById(`puntaje-${categoria}-${index}`);

    const numAutores = parseInt(autoresInput.value) || 1;
    const tipoArticulo = tipoSelect.value;

    // Puntos base según categoría y tipo de publicación
    const puntosBase = {
        regular: { A1: 15, A2: 12, B: 8, C: 3 },
        comunicacion: { A1: 4.5, A2: 3.6, B: 2.4, C: 0.9 },
        reporte: { A1: 9, A2: 7.2, B: 4.8, C: 1.8 }
    };

    const puntosPorCategoria = puntosBase[tipoArticulo][categoria.toUpperCase()] || 0;

    // Ajustar puntaje según el número de autores
    let puntajeFinal = puntosPorCategoria;
    if (numAutores >= 1 && numAutores <= 3) {
        // El puntaje permanece igual, no se realiza ninguna modificación
    } else if (numAutores >= 4 && numAutores <= 6) {
        puntajeFinal /= 2; // Dividir entre 2
    } else if (numAutores > 6) {
        puntajeFinal /= numAutores; // Dividir entre el número de autores
    }

    // Actualizar el puntaje calculado en el formulario
    puntajeSpan.textContent = puntajeFinal.toFixed(2);
}

function calcularPuntajeLibro(index) {
    const autoresInput = document.getElementById(`autores-libro-${index}`);
    const tipoSelect = document.getElementById(`tipo-libro-${index}`);
    const puntajeSpan = document.getElementById(`puntaje-libro-${index}`);

    const numAutores = parseInt(autoresInput.value) || 1;
    const tipoLibro = tipoSelect.value;

    // Puntos base según el tipo de libro
    const puntosBase = {
        investigacion: 20,
        texto: 15,
        ensayo: 15
    };

    let puntajeFinal = puntosBase[tipoLibro] || 0;

    // Ajustar puntaje según el número de autores
    if (numAutores >= 1 && numAutores <= 3) {
        // El puntaje permanece igual, no se realiza ninguna modificación
    } else if (numAutores >= 4 && numAutores <= 6) {
        puntajeFinal /= 2; // Dividir entre 2
    } else if (numAutores > 6) {
        puntajeFinal /= numAutores; // Dividir entre el número de autores
    }

    // Actualizar el puntaje calculado en el formulario
    puntajeSpan.textContent = puntajeFinal.toFixed(2);
}

function calcularPuntajeObra(tipo, index) {
    const autoresInput = document.getElementById(`autores-obra-${tipo}-${index}`);
    const puntajeSpan = document.getElementById(`puntaje-obra-${tipo}-${index}`);

    const numAutores = parseInt(autoresInput.value) || 1;
    const puntosBase = tipo === 'inter' ? 20 : 14; // Puntaje base para obras

    // Ajustar puntaje según el número de autores (regla generalizada)
    let puntajeFinal = puntosBase;
    if (numAutores >= 1 && numAutores <= 3) {
        // Puntaje completo
    } else if (numAutores >= 4 && numAutores <= 5) {
        puntajeFinal /= 2; // Mitad del puntaje
    } else if (numAutores >= 6) {
        puntajeFinal = puntosBase / (numAutores / 2); // Puntaje dividido por la mitad de autores
    }

    // Actualizar el puntaje calculado en el formulario
    puntajeSpan.textContent = puntajeFinal.toFixed(2);
}

function toggleMultipleDirectores(tipo) {
    const checkbox = document.getElementById(`multiple-directores-${tipo}`);
    const container = document.getElementById(`multiple-directores-${tipo}-container`);
    container.style.display = checkbox.checked ? 'block' : 'none';

    if (!checkbox.checked) {
        document.getElementById(`num-tesis-multiple-${tipo}`).value = 0;
        document.getElementById(`directores-${tipo}-container`).innerHTML = '';
    }
}

function actualizarCamposDirectores(tipo) {
    const numTesis = parseInt(document.getElementById(`num-tesis-multiple-${tipo}`).value);
    const container = document.getElementById(`directores-${tipo}-container`);
    container.innerHTML = ''; // Limpiar campos existentes

    for (let i = 1; i <= numTesis; i++) {
        const directorContainer = document.createElement('div');
        directorContainer.className = 'director-container';
        directorContainer.innerHTML = `
            <div class="director-field">
                <label for="directores-${tipo}-${i}">Número de directores para la tesis ${i}:</label>
                <input type="number" 
                    id="directores-${tipo}-${i}" 
                    name="directores-${tipo}-${i}" 
                    min="1" 
                    value="1" 
                    class="director-input">
            </div>
        `;
        container.appendChild(directorContainer);
    }
}

// Add style for the author fields
const style = document.createElement('style');
style.textContent = `
    .autores-container {
        margin-left: 20px;
        margin-top: 10px;
    }
    .article-container {
        margin: 15px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .author-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .article-details {
        display: flex;
        gap: 20px;
        align-items: center;
    }
    .input-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .author-input {
        width: 80px;
        padding: 4px;
    }
    select {
        padding: 4px;
        min-width: 200px;
    }
`;
document.head.appendChild(style);

window.formatearMoneda = function(valor) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
};

window.agregarProfesorANomina = function(profesor) {
    if (!profesor) {
        console.error('No hay datos del profesor para agregar');
        return;
    }
    
    if (typeof window.profesoresEnNomina === 'undefined') {
        window.profesoresEnNomina = [];
    }

    const profesorConId = {
        ...profesor,
        id: Date.now() + Math.floor(Math.random() * 1000)
    };

    window.profesoresEnNomina.push(profesorConId);
    
    if (typeof window.actualizarTablaProfesores === 'function') {
        window.actualizarTablaProfesores();
    }
    
    if (typeof window.actualizarResumenNomina === 'function') {
        window.actualizarResumenNomina();
    }

    console.log('Profesor agregado:', profesorConId);
};

/**
 * Sistema de notificaciones
 */
function showNotification(type, title, message, duration = 5000) {
    const container = document.getElementById('notification-container');
    
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    
    // Iconos para diferentes tipos de notificaciones
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    // HTML para la notificación
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icons[type]}"></i>
        </div>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar al contenedor
    container.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Configurar el botón de cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Autocierre después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    return notification;
}

function closeNotification(notification) {
    notification.classList.remove('show');
    
    // Eliminar el elemento después de la animación
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 400);
}

/**
 * Verifica si un profesor ya existe en la nómina
 */
function profesorExisteEnNomina(nombre, categoria, tipo) {
    let profesores = JSON.parse(localStorage.getItem('profesores') || '[]');
    
    return profesores.some(profesor => 
        profesor.nombre.toLowerCase() === nombre.toLowerCase() && 
        profesor.categoria === categoria &&
        profesor.tipo === tipo
    );
}
    

function actualizarEstadoDoctoradoPost1998() {
    const maestriasSelect = document.getElementById('maestrias');
    const doctoradosSelect = document.getElementById('doctorados');
    const doctoradoCheckbox = document.getElementById('doctorado-post-1998');

    if (!maestriasSelect || !doctoradosSelect || !doctoradoCheckbox) {
        console.error('No se encontraron los elementos necesarios para actualizar el estado del checkbox.');
        return;
    }

    const numMaestrias = parseInt(maestriasSelect.value) || 0;
    const numDoctorados = parseInt(doctoradosSelect.value) || 0;

    // Habilitar solo si hay doctorados y no hay maestrías
    doctoradoCheckbox.disabled = !(numDoctorados > 0 && numMaestrias === 0);

    if (doctoradoCheckbox.disabled) {
        doctoradoCheckbox.checked = false; // Desmarcar si está deshabilitado
    }
}

// Agregar eventos para actualizar el estado del checkbox
document.addEventListener('DOMContentLoaded', () => {
    const maestriasSelect = document.getElementById('maestrias');
    const doctoradosSelect = document.getElementById('doctorados');

    if (maestriasSelect && doctoradosSelect) {
        maestriasSelect.addEventListener('change', actualizarEstadoDoctoradoPost1998);
        doctoradosSelect.addEventListener('change', actualizarEstadoDoctoradoPost1998);
        actualizarEstadoDoctoradoPost1998(); // Ejecutar al cargar la página
    }
});

document.addEventListener('DOMContentLoaded', actualizarEstadoDoctoradoPost1998);

// Puedes usar obtenerValorNumerico('experiencia-docencia') para obtener los valores de los campos.
