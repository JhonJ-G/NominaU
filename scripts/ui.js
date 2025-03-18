document.addEventListener('DOMContentLoaded', function() {
    // Manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
});

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'info') {
    // Si se proporciona un elemento específico, mostrar el mensaje ahí
    if (arguments.length > 2 && arguments[2]) {
        const contenedor = arguments[2];
        contenedor.innerHTML = `<p class="${tipo}-mensaje">${mensaje}</p>`;
        return;
    }
    
    // Si no, crear un mensaje flotante temporal
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje ${tipo}-mensaje`;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '20px';
    mensajeDiv.style.left = '50%';
    mensajeDiv.style.transform = 'translateX(-50%)';
    mensajeDiv.style.zIndex = '9999';
    mensajeDiv.style.padding = '15px 25px';
    mensajeDiv.style.borderRadius = '5px';
    mensajeDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(mensajeDiv);
    
    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
        mensajeDiv.style.opacity = '0';
        mensajeDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => mensajeDiv.remove(), 500);
    }, 3000);
}

// Función para formatear valores monetarios
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

// Función para mostrar un modal de confirmación cuando se agrega un profesor
function mostrarModalConfirmacion(profesor) {
    // Crear un modal desde cero sin depender de clases CSS que pueden fallar
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '10000';  // Asegurar que esté por encima de todo
    
    // El contenido del modal
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    
    // Determinar tipo de profesor y descripción
    let tipoDescripcion = '';
    if (profesor.tipo === 'planta') {
        tipoDescripcion = `Profesor de Planta - ${profesor.categoria.charAt(0).toUpperCase() + profesor.categoria.slice(1)}`;
    } else {
        let dedicacionTexto = profesor.dedicacion === 'tiempo_completo' ? 'Tiempo Completo' : 'Medio Tiempo';
        tipoDescripcion = `Profesor Ocasional (${dedicacionTexto}) - ${profesor.categoria.charAt(0).toUpperCase() + profesor.categoria.slice(1)}`;
    }
    
    // Contenido HTML del modal
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #2c3e50;">Profesor Agregado a la Nómina</h2>
            <button id="cerrar-x" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        
        <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #2c3e50; font-size: 1.5rem;">${profesor.nombre}</h3>
            <p style="margin: 8px 0; color: #6c757d;">${tipoDescripcion}</p>
            <p style="font-size: 1.2rem; font-weight: bold; color: #28a745; margin-top: 10px;">
                Salario mensual: $${profesor.salario.toLocaleString('es-CO')}
            </p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <button id="btn-aceptar" style="background-color: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; margin-right: 10px; cursor: pointer;">Aceptar</button>
            <button id="btn-ver-nomina" style="background-color: #95a5a6; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Ver Nómina</button>
        </div>
    `;
    
    // Agregar el modal al DOM
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    console.log("Modal de confirmación creado para:", profesor.nombre);
    
    // Agregar los event listeners
    document.getElementById('cerrar-x').addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
        console.log("Modal cerrado por X");
    });
    
    document.getElementById('btn-aceptar').addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
        console.log("Modal cerrado por botón Aceptar");
    });
    
    document.getElementById('btn-ver-nomina').addEventListener('click', function() {
        // Cambiar a la pestaña de nómina
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-tab') === 'nomina') {
                button.classList.add('active');
            }
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const nominaTab = document.getElementById('nomina-tab');
        nominaTab.classList.add('active');
        nominaTab.scrollIntoView({ behavior: 'smooth' });
        
        // Cerrar el modal
        document.body.removeChild(modalOverlay);
        console.log("Modal cerrado e ir a nómina");
    });
    
    // También permitir cerrar el modal al hacer clic fuera
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            console.log("Modal cerrado por clic fuera");
        }
    });
}

function displayResults(results, container) {
    const html = `
        <div class="salary-results">
            <div class="result-group">
                <h4>Tipo de Profesor</h4>
                <p>${results.details.tipoProfesor === 'planta' ? 'Profesor de Planta' : 'Profesor Ocasional'}</p>
                <small>${results.mesesContrato} meses de contrato al año</small>
            </div>
            <div class="result-group">
                <h4>Salario Base Mensual</h4>
                <p>${formatearMoneda(results.salarioMensual)}</p>
            </div>
            <div class="result-group">
                <h4>Salario Trimestral</h4>
                <p>${formatearMoneda(results.salarioTrimestral)}</p>
            </div>
            <div class="result-group">
                <h4>Salario Semestral</h4>
                <p>${formatearMoneda(results.salarioSemestral)}</p>
            </div>
            <div class="result-group total">
                <h4>Salario Anual</h4>
                <p>${formatearMoneda(results.salarioAnual)}</p>
                <small>(Calculado con ${results.mesesContrato} meses de contrato: ${results.details.tipoProfesor === 'planta' ? '12 meses' : '10 meses'})</small>
            </div>
            <div class="result-details">
                <h4>Desglose de Puntos</h4>
                <p>Puntos Totales: ${results.basePoints}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Actualizar gráfico
    const chartData = {
        labels: ['Mensual', 'Trimestral', 'Semestral', 'Anual'],
        data: [
            results.salarioMensual,
            results.salarioTrimestral,
            results.salarioSemestral,
            results.salarioAnual
        ]
    };
    
    createSalaryChart(container, chartData);
}

function createSalaryChart(container, data) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: ['#4CAF50', '#2196F3', '#9C27B0']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
