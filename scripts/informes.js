// Módulo para la generación de informes en PDF y Excel

// Función para generar un informe en PDF
function generarInformePDF() {
    // Verificar que hay profesores en la nómina
    if (profesoresEnNomina.length === 0) {
        mostrarMensaje('No hay profesores en la nómina para generar el informe', 'error');
        return;
    }
    
    // Para generar PDFs, usaríamos una librería como jsPDF
    // Como no podemos incluir librerías externas, simularemos la funcionalidad
    
    // En una implementación real, aquí iría el código para crear el PDF
    console.log('Generando informe PDF...');
    console.log('Datos para el informe:', obtenerDatosParaInforme());
    
    // Información que se incluiría en el PDF
    const informacion = {
        titulo: 'Informe de Nómina - Universidad Popular del Cesar',
        fecha: new Date().toLocaleDateString('es-CO'),
        totalProfesores: profesoresEnNomina.length,
        resumen: calcularResumenNomina(),
    };
    
    // Simulamos la generación del PDF
    mostrarMensaje('El informe PDF se está generando...', 'info');
    
    // Simulamos una descarga después de un pequeño retraso
    setTimeout(() => {
        mostrarMensaje('Informe PDF generado correctamente', 'success');
        
        // En una implementación real con jsPDF, aquí se guardaría el PDF:
        // pdf.save('informe-nomina-upc.pdf');
        
        // Como es una simulación, mostramos una previsualización del informe
        mostrarVistaPrevia('pdf');
    }, 1500);
}

// Función para generar un informe en Excel
function generarInformeExcel() {
    // Verificar que hay profesores en la nómina
    if (profesoresEnNomina.length === 0) {
        mostrarMensaje('No hay profesores en la nómina para generar el informe', 'error');
        return;
    }
    
    // Para generar Excel usaríamos una librería como SheetJS/xlsx
    // Como no podemos incluir librerías externas, simularemos la funcionalidad
    
    console.log('Generando informe Excel...');
    console.log('Datos para el informe:', obtenerDatosParaInforme());
    
    // Datos que se incluirían en el Excel
    const datos = profesoresEnNomina.map(profesor => {
        const tipo = profesor.tipo;
        const resultado = profesor.resultado;
        
        if (tipo === 'planta') {
            return {
                'Nombre': profesor.datos.nombre,
                'Tipo': 'Planta',
                'Categoría': profesor.datos.categoria,
                'Puntos Totales': resultado.puntos,
                'Salario Mensual': resultado.salarioMensual,
                'Salario Trimestral': resultado.salarioTrimestral,
                'Salario Semestral': resultado.salarioSemestral,
                'Salario Anual': resultado.salarioAnual
            };
        } else {
            return {
                'Nombre': profesor.datos.nombre,
                'Tipo': 'Ocasional',
                'Nivel de Formación': profesor.datos.nivelFormacion,
                'Dedicación': profesor.datos.dedicacion === 'tiempo_completo' ? 'Tiempo Completo' : 'Medio Tiempo',
                'Puntos Totales': resultado.puntos,
                'Salario Mensual': resultado.salarioMensual,
                'Salario Trimestral': resultado.salarioTrimestral,
                'Salario Semestral': resultado.salarioSemestral,
                'Salario Anual': resultado.salarioAnual
            };
        }
    });
    
    // Simulamos la generación del Excel
    mostrarMensaje('El informe Excel se está generando...', 'info');
    
    // Simulamos una descarga después de un pequeño retraso
    setTimeout(() => {
        mostrarMensaje('Informe Excel generado correctamente', 'success');
        
        // En una implementación real con SheetJS, aquí se guardaría el archivo:
        // XLSX.writeFile(wb, 'informe-nomina-upc.xlsx');
        
        // Como es una simulación, mostramos una previsualización del informe
        mostrarVistaPrevia('excel');
    }, 1500);
}

// Función para mostrar una vista previa del informe (simulación)
function mostrarVistaPrevia(tipo) {
    const modalId = `modal-vista-previa-${tipo}`;
    
    // Verificar si ya existe un modal y eliminarlo
    const modalExistente = document.getElementById(modalId);
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Crear un modal para la vista previa
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-vista-previa';
    
    // Contenido del modal según el tipo de informe
    let contenidoModal = '';
    if (tipo === 'pdf') {
        contenidoModal = `
            <div class="modal-contenido">
                <span class="cerrar-modal">&times;</span>
                <h2>Vista Previa del Informe PDF</h2>
                <div class="preview-pdf">
                    <h3>UNIVERSIDAD POPULAR DEL CESAR</h3>
                    <h4>Informe de Nómina Docente</h4>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
                    
                    <table class="tabla-informe">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Categoría</th>
                                <th>Puntos</th>
                                <th>Salario Mensual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profesoresEnNomina.map(p => `
                                <tr>
                                    <td>${p.datos.nombre}</td>
                                    <td>${p.tipo === 'planta' ? 'Planta' : 'Ocasional'}</td>
                                    <td>${p.tipo === 'planta' ? p.datos.categoria : p.datos.nivelFormacion}</td>
                                    <td>${p.resultado.puntos}</td>
                                    <td>$${p.resultado.salarioMensual.toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="resumen-informe">
                        <h4>Resumen</h4>
                        <p><strong>Total Profesores:</strong> ${profesoresEnNomina.length}</p>
                        <p><strong>Nómina Mensual:</strong> $${calcularSumaSalarios('mensual').toLocaleString('es-CO')}</p>
                        <p><strong>Nómina Anual:</strong> $${calcularSumaSalarios('anual').toLocaleString('es-CO')}</p>
                    </div>
                </div>
                <p class="nota-simulacion">Esta es una simulación de vista previa. En una implementación real, se generaría un archivo PDF descargable.</p>
                <button id="cerrar-vista-previa" class="primary-button">Cerrar Vista Previa</button>
            </div>
        `;
    } else if (tipo === 'excel') {
        contenidoModal = `
            <div class="modal-contenido">
                <span class="cerrar-modal">&times;</span>
                <h2>Vista Previa del Informe Excel</h2>
                <div class="preview-excel">
                    <table class="tabla-informe">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Categoría/Nivel</th>
                                <th>Puntos</th>
                                <th>Salario Mensual</th>
                                <th>Salario Anual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profesoresEnNomina.map(p => `
                                <tr>
                                    <td>${p.datos.nombre}</td>
                                    <td>${p.tipo === 'planta' ? 'Planta' : 'Ocasional'}</td>
                                    <td>${p.tipo === 'planta' ? p.datos.categoria : p.datos.nivelFormacion}</td>
                                    <td>${p.resultado.puntos}</td>
                                    <td>$${p.resultado.salarioMensual.toLocaleString('es-CO')}</td>
                                    <td>$${p.resultado.salarioAnual.toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4"><strong>TOTALES</strong></td>
                                <td><strong>$${calcularSumaSalarios('mensual').toLocaleString('es-CO')}</strong></td>
                                <td><strong>$${calcularSumaSalarios('anual').toLocaleString('es-CO')}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <p class="nota-simulacion">Esta es una simulación de vista previa. En una implementación real, se generaría un archivo Excel descargable.</p>
                <button id="cerrar-vista-previa" class="primary-button">Cerrar Vista Previa</button>
            </div>
        `;
    }
    
    modal.innerHTML = contenidoModal;
    document.body.appendChild(modal);
    
    // Agregar funcionalidad para cerrar el modal
    document.querySelectorAll(`#${modalId} .cerrar-modal, #${modalId} #cerrar-vista-previa`).forEach(elem => {
        elem.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// Función auxiliar para calcular la suma de salarios según el período
function calcularSumaSalarios(periodo) {
    let suma = 0;
    
    profesoresEnNomina.forEach(profesor => {
        switch (periodo) {
            case 'mensual':
                suma += profesor.resultado.salarioMensual;
                break;
            case 'trimestral':
                suma += profesor.resultado.salarioTrimestral;
                break;
            case 'semestral':
                suma += profesor.resultado.salarioSemestral;
                break;
            case 'anual':
                suma += profesor.resultado.salarioAnual;
                break;
        }
    });
    
    return suma;
}

// Inicializar los controles de informes cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Configurar los botones de generación de informes
    const btnGenerarPDF = document.getElementById('generar-pdf');
    const btnGenerarExcel = document.getElementById('generar-excel');
    
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', generarInformePDF);
    }
    
    if (btnGenerarExcel) {
        btnGenerarExcel.addEventListener('click', generarInformeExcel);
    }
});
