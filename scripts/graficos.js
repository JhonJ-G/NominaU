// Módulo para la generación de gráficos dinámicos de la nómina de profesores

// Utilizaremos Chart.js para los gráficos
// Referencia a los contenedores de gráficos
let graficosContainer;
let graficosGenerados = {};

// Inicializar el módulo de gráficos
function inicializarGraficos() {
    graficosContainer = document.getElementById('graficos-container');
    
    // Configurar los eventos para los botones de tipo de gráfico
    document.querySelectorAll('.tipo-grafico-btn').forEach(boton => {
        boton.addEventListener('click', function() {
            const tipoGrafico = this.getAttribute('data-tipo');
            generarGrafico(tipoGrafico);
            
            // Marcar el botón activo
            document.querySelectorAll('.tipo-grafico-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Configurar el período de tiempo para los gráficos
    document.getElementById('periodo-grafico').addEventListener('change', function() {
        const tipoGraficoActivo = document.querySelector('.tipo-grafico-btn.active');
        if (tipoGraficoActivo) {
            generarGrafico(tipoGraficoActivo.getAttribute('data-tipo'));
        }
    });
}

// Función principal para generar gráficos según el tipo
function generarGrafico(tipo) {
    if (profesoresEnNomina.length === 0) {
        mostrarMensajeEnGraficos('No hay profesores en la nómina para generar gráficos');
        return;
    }
    
    // Limpiar el contenedor de gráficos previos
    limpiarGraficos();
    
    // Crear un canvas para el gráfico
    const canvasId = `grafico-${tipo}`;
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    graficosContainer.appendChild(canvas);
    
    // Obtener el período seleccionado
    const periodoSelect = document.getElementById('periodo-grafico');
    const periodo = periodoSelect ? periodoSelect.value : 'mensual';
    
    // Generar el gráfico según el tipo
    switch (tipo) {
        case 'barras':
            generarGraficoBarras(canvasId, periodo);
            break;
        case 'lineas':
            generarGraficoLineas(canvasId, periodo);
            break;
        case 'circular':
            generarGraficoCircular(canvasId, periodo);
            break;
        default:
            mostrarMensajeEnGraficos('Tipo de gráfico no soportado');
    }
}

// Generar gráfico de barras comparativo entre profesores
function generarGraficoBarras(canvasId, periodo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Preparar datos para el gráfico
    const datos = profesoresEnNomina.map(profesor => {
        let nombre = profesor.datos.nombre;
        let salario = 0;
        
        // Determinar el salario según el período
        switch (periodo) {
            case 'mensual':
                salario = profesor.resultado.salarioMensual;
                break;
            case 'trimestral':
                salario = profesor.resultado.salarioTrimestral;
                break;
            case 'semestral':
                salario = profesor.resultado.salarioSemestral;
                break;
            case 'anual':
                salario = profesor.resultado.salarioAnual;
                break;
        }
        
        return {
            nombre: nombre,
            salario: salario,
            tipo: profesor.tipo,
            categoria: profesor.tipo === 'planta' ? profesor.datos.categoria : profesor.datos.nivelFormacion
        };
    });
    
    // Ordenar datos por salario (opcional)
    datos.sort((a, b) => b.salario - a.salario);
    
    // Crear dataset para Chart.js
    const labels = datos.map(d => `${d.nombre} (${d.tipo === 'planta' ? 'P' : 'O'})`);
    const values = datos.map(d => d.salario);
    const colores = datos.map(d => d.tipo === 'planta' ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 99, 132, 0.8)');
    
    // Título según período
    let titulo = `Salario ${periodo.charAt(0).toUpperCase() + periodo.slice(1)} por Profesor`;
    
    // Crear gráfico
    graficosGenerados.barras = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Salario ${periodo}`,
                data: values,
                backgroundColor: colores,
                borderColor: colores.map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-CO');
                        }
                    },
                    title: {
                        display: true,
                        text: 'Salario (COP)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: titulo,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw.toLocaleString('es-CO')}`;
                        }
                    }
                }
            }
        }
    });
}

// Generar gráfico de líneas para la evolución salarial
function generarGraficoLineas(canvasId, periodo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Para este gráfico vamos a simular una evolución salarial
    // con incrementos proyectados en 5 años
    const profesoresPorCategoria = {
        'instructor': {label: 'Instructor', color: 'rgba(255, 99, 132, 0.8)'},
        'asistente': {label: 'Asistente', color: 'rgba(54, 162, 235, 0.8)'},
        'asociado': {label: 'Asociado', color: 'rgba(255, 206, 86, 0.8)'},
        'titular': {label: 'Titular', color: 'rgba(75, 192, 192, 0.8)'}
    };
    
    // Preparar datos agrupados por categoría para profesores de planta
    const profesoresPlanta = profesoresEnNomina.filter(p => p.tipo === 'planta');
    
    if (profesoresPlanta.length === 0) {
        mostrarMensajeEnGraficos('No hay profesores de planta en la nómina para generar la evolución salarial');
        return;
    }
    
    const datosAgrupados = {};
    
    // Agrupar profesores por categoría
    profesoresPlanta.forEach(profesor => {
        const categoria = profesor.datos.categoria;
        if (!datosAgrupados[categoria]) {
            datosAgrupados[categoria] = [];
        }
        
        let salarioBase;
        switch (periodo) {
            case 'mensual':
                salarioBase = profesor.resultado.salarioMensual;
                break;
            case 'trimestral':
                salarioBase = profesor.resultado.salarioTrimestral;
                break;
            case 'semestral':
                salarioBase = profesor.resultado.salarioSemestral;
                break;
            case 'anual':
                salarioBase = profesor.resultado.salarioAnual;
                break;
        }
        
        datosAgrupados[categoria].push(salarioBase);
    });
    
    // Calcular promedios por categoría
    const promediosPorCategoria = {};
    for (const categoria in datosAgrupados) {
        const salarios = datosAgrupados[categoria];
        const promedio = salarios.reduce((a, b) => a + b, 0) / salarios.length;
        promediosPorCategoria[categoria] = promedio;
    }
    
    // Crear dataset para Chart.js
    const datasets = [];
    const años = ['2023', '2024', '2025', '2026', '2027', '2028'];
    
    for (const categoria in promediosPorCategoria) {
        const salarioBase = promediosPorCategoria[categoria];
        const evolucion = años.map((año, index) => {
            // Simulamos un incremento anual del 5%
            return salarioBase * Math.pow(1.05, index);
        });
        
        datasets.push({
            label: profesoresPorCategoria[categoria].label,
            data: evolucion,
            borderColor: profesoresPorCategoria[categoria].color,
            backgroundColor: profesoresPorCategoria[categoria].color.replace('0.8', '0.1'),
            tension: 0.1,
            fill: true
        });
    }
    
    // Título según período
    let titulo = `Evolución Proyectada del Salario ${periodo.charAt(0).toUpperCase() + periodo.slice(1)} por Categoría`;
    
    // Crear gráfico
    graficosGenerados.lineas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: años,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-CO');
                        }
                    },
                    title: {
                        display: true,
                        text: 'Salario (COP)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: titulo,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toLocaleString('es-CO')}`;
                        }
                    }
                }
            }
        }
    });
}

// Generar gráfico circular para distribución del presupuesto
function generarGraficoCircular(canvasId, periodo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Analizamos la distribución del presupuesto por tipos de profesores
    const tiposProfesores = {
        'planta': { label: 'Profesores de Planta', color: 'rgba(54, 162, 235, 0.8)' },
        'ocasional': { label: 'Profesores Ocasionales', color: 'rgba(255, 99, 132, 0.8)' }
    };
    
    // Calcular total por tipo
    const totalPorTipo = {};
    let totalGeneral = 0;
    
    profesoresEnNomina.forEach(profesor => {
        const tipo = profesor.tipo;
        if (!totalPorTipo[tipo]) {
            totalPorTipo[tipo] = 0;
        }
        
        let salario;
        switch (periodo) {
            case 'mensual':
                salario = profesor.resultado.salarioMensual;
                break;
            case 'trimestral':
                salario = profesor.resultado.salarioTrimestral;
                break;
            case 'semestral':
                salario = profesor.resultado.salarioSemestral;
                break;
            case 'anual':
                salario = profesor.resultado.salarioAnual;
                break;
        }
        
        totalPorTipo[tipo] += salario;
        totalGeneral += salario;
    });
    
    // Crear dataset para Chart.js
    const labels = [];
    const data = [];
    const colors = [];
    
    for (const tipo in totalPorTipo) {
        if (totalPorTipo[tipo] > 0) {
            labels.push(tiposProfesores[tipo].label);
            data.push(totalPorTipo[tipo]);
            colors.push(tiposProfesores[tipo].color);
        }
    }
    
    // Título según período
    let titulo = `Distribución del Presupuesto ${periodo.charAt(0).toUpperCase() + periodo.slice(1)} por Tipo de Profesor`;
    
    // Crear gráfico
    graficosGenerados.circular = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: titulo,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalGeneral) * 100).toFixed(1);
                            return `${context.label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Limpiar los gráficos existentes
function limpiarGraficos() {
    // Destruir gráficos existentes
    for (const key in graficosGenerados) {
        if (graficosGenerados[key]) {
            graficosGenerados[key].destroy();
            delete graficosGenerados[key];
        }
    }
    
    // Limpiar el contenedor
    if (graficosContainer) {
        graficosContainer.innerHTML = '';
    }
}

// Mostrar mensaje en el contenedor de gráficos
function mostrarMensajeEnGraficos(mensaje) {
    limpiarGraficos();
    
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'mensaje-graficos';
    mensajeElement.textContent = mensaje;
    
    graficosContainer.appendChild(mensajeElement);
}

// Actualizar gráficos cuando cambia la nómina
function actualizarGraficos() {
    const tipoGraficoActivo = document.querySelector('.tipo-grafico-btn.active');
    if (tipoGraficoActivo) {
        generarGrafico(tipoGraficoActivo.getAttribute('data-tipo'));
    } else if (document.querySelector('.tipo-grafico-btn')) {
        // Si no hay ningún botón activo pero existen los botones, activar el primero
        const primerBoton = document.querySelector('.tipo-grafico-btn');
        primerBoton.classList.add('active');
        generarGrafico(primerBoton.getAttribute('data-tipo'));
    }
}

// Exportar el gráfico actual como imagen
function exportarGraficoComoImagen() {
    const graficoActivo = document.querySelector('canvas');
    if (!graficoActivo) {
        mostrarMensaje('No hay gráfico para exportar', 'error');
        return;
    }
    
    try {
        const imagen = graficoActivo.toDataURL('image/png');
        const enlace = document.createElement('a');
        enlace.href = imagen;
        enlace.download = 'grafico-nomina-upc.png';
        enlace.click();
    } catch (error) {
        console.error('Error al exportar el gráfico:', error);
        mostrarMensaje('Error al exportar el gráfico', 'error');
    }
}

// Exportar todos los datos para el informe
function obtenerDatosParaInforme() {
    return {
        profesores: profesoresEnNomina,
        resumen: calcularResumenNomina(),
        fecha: new Date().toLocaleString('es-CO')
    };
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializamos los gráficos cuando la pestaña de nómina esté activa
    const nominaTab = document.getElementById('nomina-tab');
    if (nominaTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && 
                    nominaTab.classList.contains('active') && 
                    document.getElementById('graficos-container')) {
                    inicializarGraficos();
                    actualizarGraficos();
                }
            });
        });
        
        observer.observe(nominaTab, { attributes: true });
    }
});
