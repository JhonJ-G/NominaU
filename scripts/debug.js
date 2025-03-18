// Script para ayudar con la depuración de problemas

// Verificar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado completamente');
    
    // Registrar los event listeners
    const btnAgregarPlanta = document.getElementById('agregar-profesor-resultado');
    if (btnAgregarPlanta) {
        console.log('Button agregar-profesor-resultado encontrado');
    } else {
        console.error('Button agregar-profesor-resultado NO encontrado');
    }
    
    // Verificar si la función modal está disponible
    if (typeof mostrarModalConfirmacion === 'function') {
        console.log('Función mostrarModalConfirmacion disponible');
    } else {
        console.error('Función mostrarModalConfirmacion NO disponible');
    }
    
    // Probar la función modal
    window.testModal = function() {
        console.log('Probando modal...');
        mostrarModalConfirmacion({
            nombre: "Profesor de Prueba",
            tipo: "planta",
            categoria: "titular",
            salario: 5000000
        });
    };
    
    console.log('Para probar el modal, ejecuta window.testModal() en la consola');
});

// Sobreescribir agregarProfesorANomina temporalmente para debug
const originalAgregarProfesor = window.agregarProfesorANomina;

window.agregarProfesorANomina = function(profesor) {
    console.log("Agregando profesor a nómina:", profesor.datos.nombre);
    
    if (typeof originalAgregarProfesor === 'function') {
        originalAgregarProfesor(profesor);
    } else {
        console.error("Función original agregarProfesorANomina no encontrada");
    }
};
