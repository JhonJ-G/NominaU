// Variables globales
let asignaturaActual = '';
let entradaEditando = null;
let asignaturas = {};
let imagenSeleccionada = null;

// Asignaturas por defecto
const asignaturasDefault = [
    { nombre: 'Matemáticas', icono: 'fas fa-calculator' },
    { nombre: 'Programación', icono: 'fas fa-code' },
    { nombre: 'Bases de Datos', icono: 'fas fa-database' },
    { nombre: 'Redes', icono: 'fas fa-network-wired' }
];

// DOM Elements
const paginaPrincipal = document.getElementById('pagina-principal');
const paginaAsignatura = document.getElementById('pagina-asignatura');
const gridAsignaturas = document.querySelector('.grid-asignaturas');
const tituloAsignatura = document.getElementById('titulo-asignatura');
const seccionFormulario = document.getElementById('seccion-formulario');
const formularioEntrada = document.getElementById('formulario-entrada');
const listaEntradas = document.getElementById('lista-entradas');
const inputFecha = document.getElementById('fecha');
const inputTipo = document.getElementById('tipo');
const inputContenido = document.getElementById('contenido');
const inputArchivo = document.getElementById('archivo-imagen');
const previewImagen = document.getElementById('preview-imagen');
const imgPreview = document.getElementById('img-preview');
const btnRemoverImagen = document.getElementById('btn-remover-imagen');
const btnVolver = document.getElementById('btn-volver');
const btnCancelar = document.getElementById('btn-cancelar');
const btnFlotanteAgregar = document.getElementById('btn-flotante-agregar');
const btnCerrarFormulario = document.getElementById('btn-cerrar-formulario');
const btnNuevaAsignatura = document.getElementById('btn-nueva-asignatura');
const modalAsignatura = document.getElementById('modal-asignatura');
const formularioAsignatura = document.getElementById('formulario-asignatura');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const inputBusqueda = document.getElementById('busqueda');
const filtroTipo = document.getElementById('filtro-tipo');

// Modal de entrada
const modalEntrada = document.getElementById('modal-entrada');
const modalEntradaTipo = document.getElementById('modal-entrada-tipo');
const modalEntradaFecha = document.getElementById('modal-entrada-fecha');
const modalEntradaContenido = document.getElementById('modal-entrada-contenido');
const modalEntradaImagen = document.getElementById('modal-entrada-imagen');
const btnCerrarModalEntrada = document.getElementById('btn-cerrar-modal-entrada');
const btnEditarModal = document.getElementById('btn-editar-modal');
const btnEliminarModal = document.getElementById('btn-eliminar-modal');

let entradaActualModal = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    configurarEventListeners();
    cargarAsignaturas();
});

// Configurar event listeners
function configurarEventListeners() {
    btnVolver.addEventListener('click', volverAPrincipal);
    btnCancelar.addEventListener('click', cancelarEdicion);
    btnFlotanteAgregar.addEventListener('click', mostrarFormulario);
    btnCerrarFormulario.addEventListener('click', ocultarFormulario);
    btnNuevaAsignatura.addEventListener('click', abrirModalAsignatura);
    btnCerrarModal.addEventListener('click', cerrarModalAsignatura);
    btnCerrarModalEntrada.addEventListener('click', cerrarModalEntrada);
    btnEditarModal.addEventListener('click', editarDesdeModal);
    btnEliminarModal.addEventListener('click', eliminarDesdeModal);
    formularioEntrada.addEventListener('submit', manejarSubmitEntrada);
    formularioAsignatura.addEventListener('submit', manejarSubmitAsignatura);
    inputBusqueda.addEventListener('input', filtrarEntradas);
    filtroTipo.addEventListener('change', filtrarEntradas);
    inputArchivo.addEventListener('change', manejarSeleccionImagen);
    btnRemoverImagen.addEventListener('click', removerImagen);
    
    // Cerrar modales al hacer click fuera
    modalAsignatura.addEventListener('click', (e) => {
        if (e.target === modalAsignatura) {
            cerrarModalAsignatura();
        }
    });

    modalEntrada.addEventListener('click', (e) => {
        if (e.target === modalEntrada) {
            cerrarModalEntrada();
        }
    });
}

// Inicializar aplicación
function inicializarApp() {
    actualizarFecha();
    setInterval(actualizarFecha, 60000); // Actualizar cada minuto
}

// Actualizar fecha automáticamente
function actualizarFecha() {
    const now = new Date();
    const fechaFormateada = formatearFecha(now);
    inputFecha.value = fechaFormateada;
}

// Formatear fecha
function formatearFecha(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Cargar asignaturas desde Firebase
async function cargarAsignaturas() {
    try {
        const snapshot = await firebaseDB.ref('asignaturas').once('value');
        const data = snapshot.val();
        
        if (data) {
            asignaturas = data;
        } else {
            // Si no hay asignaturas, crear las por defecto
            await crearAsignaturasDefault();
        }
        
        mostrarAsignaturas();
    } catch (error) {
        console.error('Error al cargar asignaturas:', error);
        mostrarError('Error al cargar las asignaturas');
    }
}

// Crear asignaturas por defecto
async function crearAsignaturasDefault() {
    try {
        for (const asignatura of asignaturasDefault) {
            const key = limpiarNombreAsignatura(asignatura.nombre);
            asignaturas[key] = {
                nombre: asignatura.nombre,
                icono: asignatura.icono,
                entradas: {}
            };
        }
        
        await firebaseDB.ref('asignaturas').set(asignaturas);
    } catch (error) {
        console.error('Error al crear asignaturas por defecto:', error);
    }
}

// Mostrar asignaturas en la grilla
function mostrarAsignaturas() {
    gridAsignaturas.innerHTML = '';
    
    Object.keys(asignaturas).forEach(key => {
        const asignatura = asignaturas[key];
        const cantidadEntradas = asignatura.entradas ? Object.keys(asignatura.entradas).length : 0;
        
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-asignatura';
        tarjeta.innerHTML = `
            <button class="btn-eliminar-asignatura" onclick="eliminarAsignatura('${key}')">
                <i class="fas fa-times"></i>
            </button>
            <i class="${asignatura.icono}"></i>
            <h3>${asignatura.nombre}</h3>
            <p class="contador">${cantidadEntradas} ${cantidadEntradas === 1 ? 'entrada' : 'entradas'}</p>
        `;
        
        tarjeta.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-eliminar-asignatura')) {
                abrirAsignatura(key);
            }
        });
        
        gridAsignaturas.appendChild(tarjeta);
    });
}

// Abrir asignatura
function abrirAsignatura(keyAsignatura) {
    asignaturaActual = keyAsignatura;
    const asignatura = asignaturas[keyAsignatura];
    
    tituloAsignatura.textContent = asignatura.nombre;
    paginaPrincipal.classList.add('oculto');
    paginaAsignatura.classList.remove('oculto');
    
    cargarEntradas();
    limpiarFormulario();
    ocultarFormulario();
}

// Mostrar formulario
function mostrarFormulario() {
    seccionFormulario.classList.remove('oculto');
    btnFlotanteAgregar.style.display = 'none';
    inputContenido.focus();
}

// Ocultar formulario
function ocultarFormulario() {
    seccionFormulario.classList.add('oculto');
    btnFlotanteAgregar.style.display = 'flex';
    cancelarEdicion();
}

// Manejar selección de imagen
function manejarSeleccionImagen(e) {
    const archivo = e.target.files[0];
    if (archivo) {
        if (archivo.size > 5 * 1024 * 1024) { // 5MB límite
            mostrarError('La imagen es demasiado grande. Máximo 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imagenSeleccionada = e.target.result;
            imgPreview.src = imagenSeleccionada;
            previewImagen.classList.remove('oculto');
        };
        reader.readAsDataURL(archivo);
    }
}

// Remover imagen seleccionada
function removerImagen() {
    imagenSeleccionada = null;
    inputArchivo.value = '';
    previewImagen.classList.add('oculto');
    imgPreview.src = '';
}

// Mostrar imagen en modal
function mostrarImagenCompleta(src) {
    const modal = document.createElement('div');
    modal.className = 'modal-imagen oculto';
    modal.innerHTML = `
        <img src="${src}" alt="Imagen completa">
        <button class="btn-cerrar-imagen">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => modal.classList.remove('oculto'), 10);
    
    // Cerrar modal
    const cerrarModal = () => {
        modal.classList.add('oculto');
        setTimeout(() => document.body.removeChild(modal), 300);
    };
    
    modal.addEventListener('click', cerrarModal);
    modal.querySelector('.btn-cerrar-imagen').addEventListener('click', cerrarModal);
}

// Volver a página principal
function volverAPrincipal() {
    paginaAsignatura.classList.add('oculto');
    paginaPrincipal.classList.remove('oculto');
    asignaturaActual = '';
    entradaEditando = null;
    limpiarFormulario();
    ocultarFormulario();
    inputBusqueda.value = '';
    filtroTipo.value = '';
}

// Cargar entradas de la asignatura actual
async function cargarEntradas() {
    try {
        const snapshot = await firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas`).once('value');
        const entradas = snapshot.val() || {};
        
        mostrarEntradas(entradas);
    } catch (error) {
        console.error('Error al cargar entradas:', error);
        mostrarError('Error al cargar las entradas');
    }
}

// Mostrar entradas en la lista
function mostrarEntradas(entradas, filtro = '') {
    listaEntradas.innerHTML = '';
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    const entradasArray = Object.entries(entradas).map(([id, entrada]) => ({
        id,
        ...entrada
    }));
    
    entradasArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Obtener filtro de tipo
    const tipoFiltro = filtroTipo ? filtroTipo.value : '';
    
    // Filtrar si hay búsqueda o filtro de tipo
    const entradasFiltradas = entradasArray.filter(entrada => {
        const coincideBusqueda = !filtro || 
            entrada.contenido.toLowerCase().includes(filtro.toLowerCase()) ||
            entrada.tipo.toLowerCase().includes(filtro.toLowerCase());
        
        const coincideTipo = !tipoFiltro || entrada.tipo === tipoFiltro;
        
        return coincideBusqueda && coincideTipo;
    });
    
    if (entradasFiltradas.length === 0) {
        listaEntradas.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-sticky-note"></i>
                <p>${filtro || tipoFiltro ? 'No se encontraron entradas que coincidan con los filtros.' : 'No hay entradas aún. ¡Agrega tu primera anotación!'}</p>
            </div>
        `;
        return;
    }
    
    entradasFiltradas.forEach(entrada => {
        const entradaElement = crearElementoEntrada(entrada);
        listaEntradas.appendChild(entradaElement);
    });
}

// Crear elemento de entrada
function crearElementoEntrada(entrada) {
    const div = document.createElement('div');
    div.className = `entrada-item ${entrada.tipo === 'Actividad pendiente' ? 'actividad-pendiente' : ''}`;
    div.dataset.id = entrada.id;
    
    const fechaEntrada = new Date(entrada.fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora - fechaEntrada) / (1000 * 60 * 60 * 24));
    
    let tiempoTexto = '';
    if (diferenciaDias === 0) {
        tiempoTexto = 'Hoy';
    } else if (diferenciaDias === 1) {
        tiempoTexto = 'Hace 1 día';
    } else if (diferenciaDias > 1) {
        tiempoTexto = `Hace ${diferenciaDias} días`;
    }

    // Obtener emoji para el tipo
    const emojiTipo = obtenerEmojiTipo(entrada.tipo);
    
    // Contenido truncado para la vista de tarjeta
    const contenidoTruncado = entrada.contenido.length > 150 
        ? entrada.contenido.substring(0, 150) + '...' 
        : entrada.contenido;
    
    div.innerHTML = `
        <div class="entrada-header">
            <div class="entrada-meta">
                <div class="entrada-fecha">${entrada.fecha}</div>
                <span class="entrada-tipo ${entrada.tipo === 'Actividad pendiente' ? 'actividad-pendiente' : ''}">${emojiTipo} ${entrada.tipo}</span>
                ${tiempoTexto && `<div class="entrada-tiempo">${tiempoTexto}</div>`}
            </div>
            <div class="entrada-botones">
                <button class="btn-editar" onclick="event.stopPropagation(); editarEntrada('${entrada.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-eliminar" onclick="event.stopPropagation(); eliminarEntrada('${entrada.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="entrada-contenido">
            ${contenidoTruncado}
            ${entrada.imagen ? `
                <div class="entrada-imagen">
                    <img src="${entrada.imagen}" alt="Imagen adjunta" onclick="event.stopPropagation(); mostrarImagenCompleta('${entrada.imagen}')">
                </div>
            ` : ''}
            ${entrada.contenido.length > 150 ? `
                <div class="ver-mas">
                    <i class="fas fa-expand-alt"></i> Click para ver completo
                </div>
            ` : ''}
        </div>
    `;
    
    // Agregar evento click para abrir modal
    div.addEventListener('click', () => abrirModalEntrada(entrada));
    
    return div;
}

// Abrir modal de entrada
function abrirModalEntrada(entrada) {
    entradaActualModal = entrada;
    const emojiTipo = obtenerEmojiTipo(entrada.tipo);
    
    modalEntradaTipo.textContent = `${emojiTipo} ${entrada.tipo}`;
    modalEntradaFecha.textContent = entrada.fecha;
    modalEntradaContenido.textContent = entrada.contenido;
    
    // Mostrar imagen si existe
    if (entrada.imagen) {
        modalEntradaImagen.innerHTML = `
            <img src="${entrada.imagen}" alt="Imagen adjunta" onclick="mostrarImagenCompleta('${entrada.imagen}')">
        `;
        modalEntradaImagen.style.display = 'block';
    } else {
        modalEntradaImagen.innerHTML = '';
        modalEntradaImagen.style.display = 'none';
    }
    
    modalEntrada.classList.remove('oculto');
}

// Cerrar modal de entrada
function cerrarModalEntrada() {
    modalEntrada.classList.add('oculto');
    entradaActualModal = null;
}

// Editar desde modal
function editarDesdeModal() {
    if (entradaActualModal) {
        cerrarModalEntrada();
        editarEntrada(entradaActualModal.id);
    }
}

// Eliminar desde modal
function eliminarDesdeModal() {
    if (entradaActualModal) {
        cerrarModalEntrada();
        eliminarEntrada(entradaActualModal.id);
    }
}

// Obtener emoji para tipo de entrada
function obtenerEmojiTipo(tipo) {
    const emojis = {
        'Anotación': '📝',
        'Tema tratado': '📚',
        'Definición del docente': '👨‍🏫',
        'Actividad pendiente': '⏰',
        'Recurso': '📎',
        'Examen': '📋'
    };
    return emojis[tipo] || '📄';
}

// Manejar submit del formulario de entrada
async function manejarSubmitEntrada(e) {
    e.preventDefault();
    
    const fecha = inputFecha.value.trim();
    const tipo = inputTipo.value.trim();
    const contenido = inputContenido.value.trim();
    
    if (!tipo || !contenido) {
        mostrarError('Por favor completa todos los campos obligatorios');
        return;
    }
    
    try {
        const datosEntrada = { fecha, tipo, contenido };
        
        // Agregar imagen si existe
        if (imagenSeleccionada) {
            datosEntrada.imagen = imagenSeleccionada;
        }
        
        if (entradaEditando) {
            await actualizarEntrada(entradaEditando, datosEntrada);
            mostrarExito('Entrada actualizada correctamente');
        } else {
            await agregarEntrada(datosEntrada);
            mostrarExito('Entrada guardada correctamente');
        }
        
        limpiarFormulario();
        ocultarFormulario();
        cargarEntradas();
    } catch (error) {
        console.error('Error al guardar entrada:', error);
        mostrarError('Error al guardar la entrada');
    }
}

// Agregar nueva entrada
async function agregarEntrada(datos) {
    const id = Date.now().toString();
    await firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas/${id}`).set(datos);
}

// Actualizar entrada existente
async function actualizarEntrada(id, datos) {
    await firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas/${id}`).update(datos);
}

// Editar entrada
async function editarEntrada(id) {
    try {
        const snapshot = await firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas/${id}`).once('value');
        const entrada = snapshot.val();
        
        if (!entrada) {
            mostrarError('Entrada no encontrada');
            return;
        }
        
        // Mostrar formulario si está oculto
        mostrarFormulario();
        
        inputFecha.value = entrada.fecha;
        inputTipo.value = entrada.tipo;
        inputContenido.value = entrada.contenido;
        
        // Cargar imagen si existe
        if (entrada.imagen) {
            imagenSeleccionada = entrada.imagen;
            imgPreview.src = entrada.imagen;
            previewImagen.classList.remove('oculto');
        } else {
            removerImagen();
        }
        
        entradaEditando = id;
        btnCancelar.classList.remove('oculto');
        
        // Resaltar entrada siendo editada
        document.querySelectorAll('.entrada-item').forEach(item => {
            item.classList.remove('editando');
        });
        const entradaElement = document.querySelector(`[data-id="${id}"]`);
        if (entradaElement) {
            entradaElement.classList.add('editando');
        }
        
        // Scroll al formulario
        seccionFormulario.scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        inputContenido.focus();
        
    } catch (error) {
        console.error('Error al cargar entrada para editar:', error);
        mostrarError('Error al cargar la entrada');
    }
}

// Eliminar entrada
async function eliminarEntrada(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
        return;
    }
    
    try {
        await firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas/${id}`).remove();
        cargarEntradas();
        mostrarExito('Entrada eliminada correctamente');
        
        // Si estaba editando esta entrada, cancelar edición
        if (entradaEditando === id) {
            cancelarEdicion();
        }
    } catch (error) {
        console.error('Error al eliminar entrada:', error);
        mostrarError('Error al eliminar la entrada');
    }
}

// Cancelar edición
function cancelarEdicion() {
    entradaEditando = null;
    btnCancelar.classList.add('oculto');
    limpiarFormulario();
    
    // Quitar resaltado de edición
    document.querySelectorAll('.entrada-item').forEach(item => {
        item.classList.remove('editando');
    });
}

// Limpiar formulario
function limpiarFormulario() {
    inputTipo.value = '';
    inputContenido.value = '';
    removerImagen();
    actualizarFecha();
}

// Abrir modal para nueva asignatura
function abrirModalAsignatura() {
    modalAsignatura.classList.remove('oculto');
    document.getElementById('nombre-asignatura').focus();
}

// Cerrar modal de asignatura
function cerrarModalAsignatura() {
    modalAsignatura.classList.add('oculto');
    formularioAsignatura.reset();
}

// Manejar submit del formulario de asignatura
async function manejarSubmitAsignatura(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-asignatura').value.trim();
    const icono = document.getElementById('icono-asignatura').value;
    
    if (!nombre) {
        mostrarError('Por favor ingresa el nombre de la asignatura');
        return;
    }
    
    const key = limpiarNombreAsignatura(nombre);
    
    // Verificar si ya existe
    if (asignaturas[key]) {
        mostrarError('Ya existe una asignatura con ese nombre');
        return;
    }
    
    try {
        const nuevaAsignatura = {
            nombre,
            icono,
            entradas: {}
        };
        
        await firebaseDB.ref(`asignaturas/${key}`).set(nuevaAsignatura);
        asignaturas[key] = nuevaAsignatura;
        
        cerrarModalAsignatura();
        mostrarAsignaturas();
        mostrarExito('Asignatura creada correctamente');
    } catch (error) {
        console.error('Error al crear asignatura:', error);
        mostrarError('Error al crear la asignatura');
    }
}

// Eliminar asignatura
async function eliminarAsignatura(key) {
    const asignatura = asignaturas[key];
    const cantidadEntradas = asignatura.entradas ? Object.keys(asignatura.entradas).length : 0;
    
    let mensaje = `¿Estás seguro de que quieres eliminar la asignatura "${asignatura.nombre}"?`;
    if (cantidadEntradas > 0) {
        mensaje += `\n\nEsto eliminará también ${cantidadEntradas} ${cantidadEntradas === 1 ? 'entrada' : 'entradas'}.`;
    }
    
    if (!confirm(mensaje)) {
        return;
    }
    
    try {
        await firebaseDB.ref(`asignaturas/${key}`).remove();
        delete asignaturas[key];
        mostrarAsignaturas();
        mostrarExito('Asignatura eliminada correctamente');
        
        // Si estaba en esta asignatura, volver a principal
        if (asignaturaActual === key) {
            volverAPrincipal();
        }
    } catch (error) {
        console.error('Error al eliminar asignatura:', error);
        mostrarError('Error al eliminar la asignatura');
    }
}

// Limpiar nombre de asignatura para usar como key
function limpiarNombreAsignatura(nombre) {
    return nombre
        .toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50);
}

// Filtrar entradas por búsqueda
function filtrarEntradas() {
    const filtro = inputBusqueda.value.trim();
    cargarEntradas().then(() => {
        if (filtro) {
            const snapshot = firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas`).once('value');
            snapshot.then(result => {
                const entradas = result.val() || {};
                mostrarEntradas(entradas, filtro);
            });
        }
    });
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const toast = crearToast(mensaje, 'error');
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Mostrar mensaje de éxito
function mostrarExito(mensaje) {
    const toast = crearToast(mensaje, 'success');
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Crear toast notification
function crearToast(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    // Agregar animación CSS
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    return toast;
}

// Manejar errores de conexión
window.addEventListener('online', () => {
    mostrarExito('Conexión restablecida');
});

window.addEventListener('offline', () => {
    mostrarError('Sin conexión a internet');
});

// Escuchar cambios en tiempo real (opcional)
function escucharCambios() {
    if (asignaturaActual) {
        firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas`).on('value', (snapshot) => {
            const entradas = snapshot.val() || {};
            mostrarEntradas(entradas, inputBusqueda.value.trim());
        });
    }
}

// Detener escucha de cambios
function detenerEscucha() {
    if (asignaturaActual) {
        firebaseDB.ref(`asignaturas/${asignaturaActual}/entradas`).off();
    }
}
