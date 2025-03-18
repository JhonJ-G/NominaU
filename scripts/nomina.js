// Asegurar que profesoresEnNomina sea global y persistente
window.profesoresEnNomina = window.profesoresEnNomina || [];

function agregarProfesorANomina(profesor) {
    if (!profesor) {
        console.error('No hay datos del profesor para agregar');
        return;
    }

    try {
        const profesorConId = {
            ...profesor,
            id: Date.now() + Math.floor(Math.random() * 1000)
        };

        window.profesoresEnNomina.push(profesorConId);
        console.log('Profesor agregado:', profesorConId);
        console.log('Total profesores en nómina:', window.profesoresEnNomina.length);
        
        actualizarTablaProfesores();
        actualizarResumenNomina();
        
    } catch (error) {
        console.error('Error al agregar profesor:', error);
    }
}

function eliminarProfesorDeNomina(id) {
    window.profesoresEnNomina = window.profesoresEnNomina.filter(profesor => profesor.id !== id);
    actualizarTablaProfesores();
    actualizarResumenNomina();
}

function actualizarTablaProfesores() {
    const tbody = document.querySelector('#tabla-profesores tbody');
    if (!tbody) return;
    
    // Limpiar la tabla
    tbody.innerHTML = '';
    
    // Si no hay profesores, mostrar un mensaje
    if (window.profesoresEnNomina.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align: center;">No hay profesores en la nómina</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Agregar cada profesor a la tabla
    window.profesoresEnNomina.forEach(profesor => {
        const tr = document.createElement('tr');
        
        // Obtener el nombre y categoría
        let nombre, categoria, tipo, puntos, salarioMensual;
        
        if (profesor.tipo === 'planta') {
            nombre = profesor.datos.nombre;
            categoria = profesor.datos.categoria.charAt(0).toUpperCase() + profesor.datos.categoria.slice(1);
            tipo = 'Planta';
            puntos = profesor.resultado.puntos;
            salarioMensual = profesor.resultado.salarioMensual;
        } else {
            nombre = profesor.datos.nombre;
            categoria = profesor.datos.categoria.charAt(0).toUpperCase() + profesor.datos.categoria.slice(1);
            tipo = 'Ocasional (' + (profesor.datos.dedicacion === 'tiempo_completo' ? 'TC' : 'MT') + ')';
            puntos = profesor.resultado.factorTotal.toFixed(3);
            salarioMensual = profesor.resultado.salarioMensual;
        }
        
        tr.innerHTML = `
            <td>${nombre}</td>
            <td>${categoria}</td>
            <td>${tipo}</td>
            <td>${puntos}</td>
            <td>$${salarioMensual.toLocaleString()}</td>
            <td>
                <button class="delete-button" data-id="${profesor.id}">Eliminar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            eliminarProfesorDeNomina(id);
        });
    });
    
    // Actualizar el resumen de la nómina
    actualizarResumenNomina();
}

function obtenerProfesoresNomina() {
    return window.profesoresEnNomina.map(profesor => ({
        tipo: profesor.tipo,
        nombre: profesor.datos.nombre,
        categoria: profesor.datos.categoria,
        salario: profesor.resultado.salarioMensual
    }));
}

function actualizarResumenNomina() {
    console.log('Actualizando resumen de nómina...');
    console.log('Profesores actuales:', window.profesoresEnNomina);

    // Calcular totales
    const totalProfesores = window.profesoresEnNomina.length;
    const profesoresPlanta = window.profesoresEnNomina.filter(p => p.tipo === 'planta').length;
    const profesoresOcasionales = window.profesoresEnNomina.filter(p => p.tipo === 'ocasional').length;

    // Calcular salarios
    const calculoSalarios = window.profesoresEnNomina.reduce((acc, profesor) => {
        const salarioMensual = profesor.resultado.salarioMensual || 0;
        acc.mensual += salarioMensual;
        acc.semestral += salarioMensual * 6;
        acc.anual += salarioMensual * (profesor.tipo === 'planta' ? 12 : 10);
        return acc;
    }, { mensual: 0, semestral: 0, anual: 0 });

    // Actualizar el DOM
    const elementos = {
        'total-profesores': totalProfesores,
        'distribucion-profesores': `Planta: ${profesoresPlanta}, Ocasionales: ${profesoresOcasionales}`,
        'nomina-mensual': formatearMoneda(calculoSalarios.mensual),
        'nomina-semestral': formatearMoneda(calculoSalarios.semestral),
        'nomina-anual': formatearMoneda(calculoSalarios.anual)
    };

    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            console.log(`Actualizado ${id}:`, valor);
        }
    });

    actualizarIndicadorRiesgo(calculoSalarios.anual);
}

function actualizarIndicadorRiesgo(nominaAnual) {
    const riesgoIndicator = document.querySelector('.risk-indicator');
    const riesgoValue = document.querySelector('.metric-value');
    
    if (nominaAnual < 2000000000) { // 2 mil millones
        riesgoIndicator.className = 'risk-indicator low';
        riesgoIndicator.textContent = 'Riesgo Bajo';
        riesgoValue.textContent = '< 2MM';
    } else {
        riesgoIndicator.className = 'risk-indicator high';
        riesgoIndicator.textContent = 'Riesgo Alto';
        riesgoValue.textContent = '> 2MM';
    }
}

document.addEventListener('DOMContentLoaded', actualizarResumenNomina);

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function analizarRiesgoFinanciero(nominaAnual) {
    // Ejemplo simplificado: análisis basado en la nómina anual total
    if (nominaAnual > 5000000000) { // 5 mil millones
        return '<strong style="color: red;">Alto Riesgo:</strong> La nómina anual supera los 5 mil millones de pesos, lo que podría representar un impacto significativo en el presupuesto de la universidad.';
    } else if (nominaAnual > 2000000000) { // 2 mil millones
        return '<strong style="color: orange;">Riesgo Moderado:</strong> La nómina anual está entre 2 y 5 mil millones de pesos. Es necesario monitorear su crecimiento.';
    } else {
        return '<strong style="color: green;">Riesgo Bajo:</strong> La nómina anual está por debajo de 2 mil millones de pesos, lo que representa una carga financiera manejable para la institución.';
    }
}

// Botón para calcular la nómina completa
document.getElementById('calcular-nomina').addEventListener('click', function() {
    actualizarTablaProfesores();
    
    // Cambiar a la pestaña de nómina
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    const nominaTab = document.getElementById('nomina-tab');
    nominaTab.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    nominaTab.classList.add('active');
});

// Funcionalidades para exportar
document.getElementById('exportar-excel').addEventListener('click', generarInformeExcel);
document.getElementById('exportar-pdf').addEventListener('click', generarInformePDF);

// Exportar gráfico como imagen
document.getElementById('exportar-grafico').addEventListener('click', exportarGraficoComoImagen);
