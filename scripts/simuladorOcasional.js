// Simulación para profesores ocasionales según normativa vigente

// Constantes específicas para profesores ocasionales - Factores SMMLV por categoría
const FACTORES_SMMLV_OCASIONAL = {
    tiempo_completo: {
        auxiliar: 2.645,
        asistente: 3.125,
        asociado: 3.606,
        titular: 3.918
    },
    medio_tiempo: {
        auxiliar: 1.509,
        asistente: 1.749,
        asociado: 1.990,
        titular: 2.146
    }
};

// Valores por defecto
const SMMLV_DEFAULT = 1423500; // Valor SMMLV 2025

// Bonificaciones por nivel de posgrado
const BONIFICACION_POSGRADO = {
    ninguno: 0,
    especializacion: 0.1,
    maestria: 0.2,
    doctorado: 0.3,
    postdoctorado: 0.4
};

// Bonificaciones por grupo de investigación
const BONIFICACION_GRUPO_INVESTIGACION = {
    ninguno: 0,
    a1: 0.5,
    a: 0.4,
    b: 0.3,
    c: 0.2,
    reconocido: 0.1,
    semillero: 0.05
};

function calcularSalarioOcasional(datosOcasional, smmlv) {
    const { 
        dedicacion, 
        categoria,
        nivelPosgrado,
        grupoInvestigacion,
        esInvestigadorActivo,
        tieneProyectoActivo
    } = datosOcasional;
    
    // 1. Salario base según categoría y dedicación
    const factorBase = FACTORES_SMMLV_OCASIONAL[dedicacion][categoria] || 0;
    let factorTotal = factorBase;
    
    // 2. Bonificación por posgrado (solo el más alto)
    const factorPosgrado = BONIFICACION_POSGRADO[nivelPosgrado] || 0;
    factorTotal += factorPosgrado;
    
    // 3. Bonificación por grupo de investigación (solo si está activo y tiene proyecto)
    if (esInvestigadorActivo && tieneProyectoActivo && grupoInvestigacion !== 'ninguno') {
        const factorGrupo = BONIFICACION_GRUPO_INVESTIGACION[grupoInvestigacion] || 0;
        factorTotal += factorGrupo;
    }
    
    // Calcular salario total en pesos
    const salarioBase = factorBase * smmlv;
    const salarioPosgrado = factorPosgrado * smmlv;
    const salarioGrupo = (esInvestigadorActivo && tieneProyectoActivo) ? 
        (BONIFICACION_GRUPO_INVESTIGACION[grupoInvestigacion] || 0) * smmlv : 0;
    const salarioMensual = factorTotal * smmlv;
    
    return {
        factorBase,
        factorPosgrado,
        factorGrupoInvestigacion: (esInvestigadorActivo && tieneProyectoActivo && grupoInvestigacion !== 'ninguno') ? 
            BONIFICACION_GRUPO_INVESTIGACION[grupoInvestigacion] || 0 : 0,
        factorTotal,
        salarioBase,
        salarioPosgrado,
        salarioGrupo,
        salarioMensual,
        salarioTrimestral: salarioMensual * 3,
        salarioSemestral: salarioMensual * 6,
        salarioAnual: salarioMensual * 10
    };
}

// Esta función se ha actualizado para usar el nuevo cálculo basado en SMMLV
document.addEventListener('DOMContentLoaded', function() {
    const tabOcasional = document.getElementById('ocasional-tab');
    
    if (tabOcasional) {
        // Crear formulario actualizado para profesores ocasionales
        const formularioHTML = `
            <form id="salary-form-ocasional" class="salary-form">
                <div class="form-group">
                    <label for="nombre-ocasional">Nombre del Profesor:</label>
                    <input type="text" id="nombre-ocasional" required>
                </div>
                
                <div class="form-group">
                    <label for="dedicacion">Dedicación:</label>
                    <select id="dedicacion" required>
                        <option value="tiempo_completo">Tiempo Completo</option>
                        <option value="medio_tiempo">Medio Tiempo</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="categoria-ocasional">Categoría:</label>
                    <select id="categoria-ocasional" required>
                        <option value="auxiliar">Profesor Auxiliar</option>
                        <option value="asistente">Profesor Asistente</option>
                        <option value="asociado">Profesor Asociado</option>
                        <option value="titular">Profesor Titular</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="nivel-posgrado">Nivel de Posgrado:</label>
                    <select id="nivel-posgrado" required>
                        <option value="ninguno">Ninguno</option>
                        <option value="especializacion">Especialización</option>
                        <option value="maestria">Maestría</option>
                        <option value="doctorado">Doctorado</option>
                        <option value="postdoctorado">Postdoctorado</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="grupo-investigacion">Grupo de Investigación:</label>
                    <select id="grupo-investigacion" required>
                        <option value="ninguno">Ninguno</option>
                        <option value="a1">Grupo A1</option>
                        <option value="a">Grupo A</option>
                        <option value="b">Grupo B</option>
                        <option value="c">Grupo C</option>
                        <option value="reconocido">Reconocido</option>
                        <option value="semillero">Semillero</option>
                    </select>
                </div>
                
                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" id="investigador-activo">
                        Investigador Activo en los últimos 2 años
                    </label>
                </div>
                
                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" id="proyecto-activo">
                        Proyecto de Investigación Activo
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="smmlv">SMMLV:</label>
                    <div class="smmlv-container">
                        <input type="number" id="smmlv" value="${SMMLV_DEFAULT}" required>
                        <button type="button" id="actualizar-smmlv">Actualizar SMMLV</button>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="primary-button">Calcular Salario</button>
                    <button type="button" onclick="limpiarFormularioOcasional()" class="secondary-button">Limpiar</button>
                </div>
            </form>
            <div id="resultados-ocasional">
                <div class="resultados-content"></div>
            </div>
        `;
        
        // Insertar el formulario en el contenedor correcto
        tabOcasional.innerHTML = formularioHTML;
        
        // Obtener referencia al formulario después de insertarlo
        const formularioOcasional = document.getElementById('salary-form-ocasional');
        
        // Evento para actualizar SMMLV y recalcular automáticamente
        document.getElementById('actualizar-smmlv').addEventListener('click', function() {
            const smmlvInput = document.getElementById('smmlv');
            const nuevoSMMLV = parseInt(smmlvInput.value);
            
            if (nuevoSMMLV > 0) {
                // Si hay un cálculo previo, recalcular con el nuevo SMMLV
                if (window.profesorOcasionalTemporal) {
                    const datosOcasional = window.profesorOcasionalTemporal.datos;
                    const resultado = calcularSalarioOcasional(datosOcasional, nuevoSMMLV);
                    
                    // Actualizar los resultados
                    mostrarResultadosOcasional(datosOcasional, resultado);
                    
                    // Actualizar el objeto temporal
                    window.profesorOcasionalTemporal.resultado = resultado;
                    
                    mostrarMensaje('SMMLV actualizado y salario recalculado correctamente', 'success');
                } else {
                    mostrarMensaje('SMMLV actualizado correctamente', 'info');
                }
            } else {
                mostrarMensaje('El valor del SMMLV debe ser mayor que cero', 'error');
            }
        });
        
        // Agregar event listener al formulario
        formularioOcasional.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const datosOcasional = {
                nombre: document.getElementById('nombre-ocasional').value,
                dedicacion: document.getElementById('dedicacion').value,
                categoria: document.getElementById('categoria-ocasional').value,
                nivelPosgrado: document.getElementById('nivel-posgrado').value,
                grupoInvestigacion: document.getElementById('grupo-investigacion').value,
                esInvestigadorActivo: document.getElementById('investigador-activo').checked,
                tieneProyectoActivo: document.getElementById('proyecto-activo').checked
            };
            
            const smmlv = parseInt(document.getElementById('smmlv').value);
            
            const resultado = calcularSalarioOcasional(datosOcasional, smmlv);
            
            mostrarResultadosOcasional(datosOcasional, resultado);
            
            window.profesorOcasionalTemporal = {
                tipo: 'ocasional',
                datos: datosOcasional,
                resultado: resultado,
                smmlv: smmlv
            };
            
            // Desplazar a la sección de resultados
            document.querySelector('#resultados-ocasional').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    // Mejora los checkboxes cuando se cargue la página
    mejorarCheckboxesOcasionales();
    
    // Buscar todos los botones "Agregar a Nómina" para profesores ocasionales
    document.body.addEventListener('click', function(event) {
        if ((event.target.classList.contains('agregar-nomina-ocasional-btn') || 
            event.target.closest('.agregar-nomina-ocasional-btn'))) {
                
            const button = event.target.classList.contains('agregar-nomina-ocasional-btn') 
                ? event.target 
                : event.target.closest('.agregar-nomina-ocasional-btn');
                
            // Extraer datos del profesor desde el botón o resultados
            const resultados = button.closest('.resultados');
            const datosDiv = resultados.querySelector('.resultados-content');
            
            // Obtener datos del profesor
            const nombreElement = datosDiv.querySelector('[data-nombre]');
            const categoriaElement = datosDiv.querySelector('[data-categoria]');
            const puntosElement = datosDiv.querySelector('[data-puntos-totales]');
            const salarioElement = datosDiv.querySelector('[data-salario-mensual]');
            
            if (!nombreElement || !categoriaElement || !puntosElement || !salarioElement) {
                showNotification('error', 'Error', 'No se pudieron obtener todos los datos del profesor.');
                return;
            }
            
            const nombre = nombreElement.getAttribute('data-nombre');
            const categoria = categoriaElement.getAttribute('data-categoria');
            const puntos = puntosElement.getAttribute('data-puntos-totales');
            const salario = salarioElement.getAttribute('data-salario-mensual');
            const tipo = 'Ocasional'; // Para profesores ocasionales
            
            // Verificar si el profesor ya existe en la nómina
            if (profesorExisteEnNomina(nombre, categoria, tipo)) {
                showNotification('warning', 'Profesor Duplicado', 
                    `${nombre} ya ha sido agregado a la nómina con la misma categoría.`);
                return;
            }
            
            // Continuar con el código para agregar el profesor a la nómina
            const profesor = {
                nombre,
                categoria,
                tipo,
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
                actualizarTablaProfesores();
            }
        }
    });
});

// Función para limpiar el formulario de profesores ocasionales
function limpiarFormularioOcasional() {
    // Limpiar los campos de texto
    document.getElementById('nombre-ocasional').value = '';
    
    // Restablecer selects a sus valores predeterminados
    document.getElementById('dedicacion').selectedIndex = 0;
    document.getElementById('categoria-ocasional').selectedIndex = 0;
    document.getElementById('nivel-posgrado').selectedIndex = 0;
    document.getElementById('grupo-investigacion').selectedIndex = 0;
    
    // Desactivar bonificaciones
    const permitirBonificaciones = document.getElementById('permitir-bonificaciones');
    permitirBonificaciones.checked = false;
    document.getElementById('seccion-bonificaciones').style.display = 'none';
    
    // Restablecer checkboxes de bonificaciones
    document.getElementById('investigador-activo').checked = false;
    document.getElementById('proyecto-activo').checked = false;
    
    // Poner el foco en el campo de nombre para facilitar la entrada de un nuevo profesor
    document.getElementById('nombre-ocasional').focus();
}

function mostrarResultadosOcasional(datosOcasional, resultado) {
    const contenedor = document.querySelector('#resultados-ocasional .resultados-content');
    const smmlv = parseInt(document.getElementById('smmlv').value);
    
    let html = `
        <h3>Profesor Ocasional: ${datosOcasional.nombre}</h3>
        <div class="profesor-info">
            <p><strong>Categoría:</strong> ${mapearCategoria(datosOcasional.categoria)}</p>
            <p><strong>Dedicación:</strong> ${datosOcasional.dedicacion === 'tiempo_completo' ? 'Tiempo Completo' : 'Medio Tiempo'}</p>
            <p><strong>Nivel de Posgrado:</strong> ${datosOcasional.nivelPosgrado}</p>
            <p><strong>Grupo de Investigación:</strong> ${datosOcasional.grupoInvestigacion}</p>
            <p><strong>Investigador Activo:</strong> ${datosOcasional.esInvestigadorActivo ? 'Sí' : 'No'}</p>
            <p><strong>Proyecto Activo:</strong> ${datosOcasional.tieneProyectoActivo ? 'Sí' : 'No'}</p>
            <p><strong>Factor SMMLV Base:</strong> ${resultado.factorBase.toFixed(3)}</p>
            <p><strong>Factor SMMLV Total:</strong> ${resultado.factorTotal.toFixed(3)}</p>
            <p><strong>SMMLV:</strong> $${smmlv.toLocaleString()}</p>
        </div>
        
        <div class="salary-details">
            <div class="salary-period">
                <h4>Salario Base Mensual</h4>
                <p>$${resultado.salarioBase.toLocaleString()}</p>
            </div>
            <div class="salary-period">
                <h4>Salario Total Mensual</h4>
                <p>$${resultado.salarioMensual.toLocaleString()}</p>
            </div>
            <div class="salary-period">
                <h4>Salario Trimestral</h4>
                <p>$${resultado.salarioTrimestral.toLocaleString()}</p>
            </div>
            <div class="salary-period">
                <h4>Salario Semestral</h4>
                <p>$${resultado.salarioSemestral.toLocaleString()}</p>
            </div>
            <div class="salary-period">
                <h4>Salario Anual</h4>
                <p>$${resultado.salarioAnual.toLocaleString()}</p>
            </div>
        </div>
        
        <div class="salary-breakdown">
            <h4>Desglose del Salario</h4>
            <ul>
                <li><span>Salario Base (${resultado.factorBase.toFixed(3)} × SMMLV):</span> <span>$${resultado.salarioBase.toLocaleString()}</span></li>
                <li><span>Bonificación por Posgrado (${resultado.factorPosgrado.toFixed(3)} × SMMLV):</span> <span>$${resultado.salarioPosgrado.toLocaleString()}</span></li>
                <li><span>Bonificación por Grupo de Investigación (${resultado.factorGrupoInvestigacion.toFixed(3)} × SMMLV):</span> <span>$${resultado.salarioGrupo.toLocaleString()}</span></li>
                <li class="total-salary"><span>Salario Total Mensual:</span> <span>$${resultado.salarioMensual.toLocaleString()}</span></li>
            </ul>
        </div>
        
        <div class="result-actions">
            <button id="agregar-ocasional-resultado" class="primary-button">Agregar a Nómina</button>
            <button id="calcular-nuevo-ocasional" class="secondary-button">Calcular Nuevo Profesor</button>
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    // Añadir evento al botón de agregar profesor desde los resultados
    document.getElementById('agregar-ocasional-resultado').addEventListener('click', function() {
        if (window.profesorOcasionalTemporal) {
            // Obtener datos del profesor antes de agregarlo a la nómina
            const datos = window.profesorOcasionalTemporal.datos;
            const nombre = datos.nombre;
            const categoria = datos.categoria;
            const dedicacion = datos.dedicacion;
            const salario = window.profesorOcasionalTemporal.resultado.salarioMensual;
            
            // Agregar a la nómina
            agregarProfesorANomina(window.profesorOcasionalTemporal);
            console.log("Profesor ocasional agregado a nómina:", nombre);
            
            // Mostrar el modal de confirmación DESPUÉS de agregarlo
            mostrarModalConfirmacion({
                nombre: nombre,
                tipo: 'ocasional',
                categoria: categoria,
                dedicacion: dedicacion,
                salario: salario
            });
            
            // Limpiar el objeto temporal y los resultados
            window.profesorOcasionalTemporal = null;
            document.querySelector('#resultados-ocasional .resultados-content').innerHTML = 
                '<p class="success-mensaje">Profesor agregado a la nómina correctamente.</p>';
        } else {
            mostrarMensaje('Error: No hay datos del profesor para agregar', 'error');
        }
    });
    
    // Añadir evento al botón de calcular nuevo profesor
    document.getElementById('calcular-nuevo-ocasional').addEventListener('click', function() {
        limpiarFormularioOcasional();
        document.querySelector('#resultados-ocasional .resultados-content').innerHTML = 
            '<p class="info-mensaje">Complete el formulario para calcular un nuevo salario.</p>';
        document.getElementById('nombre-ocasional').focus();
    });
}

// Función para mapear la categoría a un formato más legible
function mapearCategoria(categoria) {
    const mapeo = {
        'auxiliar': 'Profesor Auxiliar',
        'asistente': 'Profesor Asistente',
        'asociado': 'Profesor Asociado',
        'titular': 'Profesor Titular'
    };
    return mapeo[categoria] || categoria;
}

function mostrarModalEvaluacion(datos) {
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content evaluacion';
    
    // Añadir clase según resultado
    if (datos.aprobado) {
        modalContent.classList.add('aprobado');
    } else {
        modalContent.classList.add('rechazado');
    }
    
    // Contenido del modal según el resultado
    const titulo = datos.aprobado ? 
        'Bonificación Aprobada' : 
        'Bonificación Rechazada';
    
    const mensaje = datos.aprobado ?
        `El comité académico ha aprobado la bonificación para ${datos.nombre} por un total de ${datos.puntosTotales} puntos, equivalente a $${datos.valorMonetario.toLocaleString()}.` :
        `El comité académico ha rechazado la bonificación para ${datos.nombre}.<br><strong>Motivo:</strong> ${datos.motivoRechazo}`;
    
    const icono = datos.aprobado ? 
        '<i class="fas fa-check-circle"></i>' : 
        '<i class="fas fa-times-circle"></i>';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            ${icono}
            <h3>${titulo}</h3>
            <span class="close">&times;</span>
        </div>
        <div class="modal-body">
            <p>${mensaje}</p>
        </div>
        <div class="modal-footer">
            <button class="primary-button" id="modal-ok">Aceptar</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 100);
    
    // Cerrar el modal
    const closeBtn = modal.querySelector('.close');
    const okBtn = modal.querySelector('#modal-ok');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    okBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
}

// Funciones auxiliares para mapeo de valores
function mapearEscalafon(escalafon) {
    const mapeo = {
        'titular': 'Profesor Titular',
        'asociado': 'Profesor Asociado',
        'asistente': 'Profesor Asistente',
        'auxiliar': 'Profesor Auxiliar',
        'instructor': 'Instructor Asociado'
    };
    return mapeo[escalafon] || escalafon;
}

function mapearActividad(tipoActividad) {
    const mapeo = {
        'video_cientifico': 'Trabajo científico/técnico/artístico',
        'video_documental': 'Trabajo documental',
        'ponencia_internacional': 'Ponencia Internacional',
        'ponencia_nacional': 'Ponencia Nacional',
        'ponencia_regional': 'Ponencia Regional',
        'publicacion_impresa': 'Publicación Impresa Universitaria',
        'estudio_posdoctoral': 'Estudio Posdoctoral',
        'tesis_maestria': 'Dirección de Tesis de Maestría',
        'tesis_doctorado': 'Dirección de Tesis de Doctorado'
    };
    return mapeo[tipoActividad] || tipoActividad;
}

// Busca los checkboxes existentes y reemplázalos con versiones mejoradas
function mejorarCheckboxesOcasionales() {
    // Checkbox de investigador activo
    const checkboxInvestigador = document.getElementById('investigador-activo');
    if (checkboxInvestigador) {
        const parentDiv = checkboxInvestigador.closest('.form-group');
        if (parentDiv) {
            parentDiv.className = "form-group checkbox-container";
            parentDiv.innerHTML = `
                <input type="checkbox" id="investigador-activo" name="investigador-activo">
                <label for="investigador-activo">
                    <i class="fas fa-flask"></i>
                    Investigador Activo en los últimos 2 años
                </label>
            `;
        }
    }

    // Checkbox de proyecto activo
    const checkboxProyecto = document.getElementById('proyecto-activo');
    if (checkboxProyecto) {
        const parentDiv = checkboxProyecto.closest('.form-group');
        if (parentDiv) {
            parentDiv.className = "form-group checkbox-container";
            parentDiv.innerHTML = `
                <input type="checkbox" id="proyecto-activo" name="proyecto-activo">
                <label for="proyecto-activo">
                    <i class="fas fa-chart-line"></i>
                    Proyecto de Investigación Activo
                </label>
            `;
        }
    }
}
