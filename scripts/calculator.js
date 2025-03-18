// Función para calcular el salario anual basado en el tipo de profesor
function calcularSalarioAnual(salarioMensual, tipoProfesor) {
    // Los profesores ocasionales tienen contrato por 10 meses
    // Los profesores de planta tienen contrato por 12 meses
    const mesesContrato = tipoProfesor === 'planta' ? 12 : 10;
    return salarioMensual * mesesContrato;
}

function calculateSalary(professor) {
    // ... código existente ...
    
    // Cálculo del salario base mensual
    const salarioMensual = basePoints * valorPunto;
    
    // Cálculo de otros períodos
    const salarioTrimestral = salarioMensual * 3;
    const salarioSemestral = salarioMensual * 6;
    
    // Usar la función correcta para el salario anual basado en el tipo de profesor
    const mesesContrato = professor.tipoProfesor === 'planta' ? 12 : 10;
    const salarioAnual = salarioMensual * mesesContrato;
    
    return {
        salarioMensual,
        salarioTrimestral,
        salarioSemestral,
        salarioAnual,
        basePoints,
        mesesContrato,  // Añadir esta información para la UI
        details: {
            tipoProfesor: professor.tipoProfesor,
            // ... otros detalles ...
        }
    };
}