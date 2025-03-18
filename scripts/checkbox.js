document.addEventListener('DOMContentLoaded', () => {
    const maestriasSelect = document.getElementById('maestrias');
    const doctoradoCheckbox = document.getElementById('doctorado-post-1998');

    if (maestriasSelect && doctoradoCheckbox) {
        const actualizarEstadoCheckbox = () => {
            const numMaestrias = parseInt(maestriasSelect.value) || 0;

            // Deshabilitar el checkbox si hay al menos una maestría
            if (numMaestrias > 0) {
                doctoradoCheckbox.disabled = true;
                doctoradoCheckbox.checked = false; // Desmarcar si está deshabilitado
            } else {
                doctoradoCheckbox.disabled = false; // Habilitar si no hay maestrías
            }
        };

        // Agregar evento para actualizar el estado del checkbox al cambiar la selección
        maestriasSelect.addEventListener('change', actualizarEstadoCheckbox);

        // Ejecutar la función al cargar la página para establecer el estado inicial
        actualizarEstadoCheckbox();
    }
});