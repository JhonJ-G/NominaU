document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de simulación de nómina inicializado');
    
    // Inicializar la aplicación
    inicializarValidaciones();
    
    // Verificar si hay soporte para localStorage para guardar profesores
    if (typeof(Storage) !== "undefined") {
        // Cargar profesores almacenados localmente (en una versión futura)
        // cargarProfesoresGuardados();
    } else {
        console.warn('El navegador no soporta almacenamiento local. No se podrán guardar los datos entre sesiones.');
    }
});

function inicializarValidaciones() {
    // Validar campos numéricos para que no acepten valores negativos
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}
