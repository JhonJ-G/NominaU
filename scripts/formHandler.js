document.getElementById('salary-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Obtener los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const experienciaDocencia = parseInt(document.getElementById('experiencia-docencia')?.value || '0');
    const experienciaInvestigacion = parseInt(document.getElementById('experiencia-investigacion')?.value || '0');
    const experienciaDireccion = parseInt(document.getElementById('experiencia-direccion')?.value || '0');
    const experienciaProfesional = parseInt(document.getElementById('experiencia-profesional')?.value || '0');
    const experiencia = experienciaDocencia + experienciaInvestigacion + experienciaDireccion + experienciaProfesional;
    const titulo = document.getElementById('titulo').value;
    const obras = parseInt(document.getElementById('obras').value);
    const cargo = document.getElementById('cargos').value;
    const aniosCargo = parseInt(document.getElementById('anios-cargo').value);
    const tesis = parseInt(document.getElementById('tesis').value);
    const evaluador = document.getElementById('evaluador').value;
    const articulos = parseInt(document.getElementById('articulos').value);
    const categoriaArticulos = document.getElementById('categoria-articulos').value;
    const valorPunto = parseInt(document.getElementById('valor-punto').value);
    
    // Calcular el salario total
    const salarioTotal = calcularSalario(categoria, experiencia, titulo, obras, cargo, aniosCargo, tesis, evaluador, articulos, categoriaArticulos, valorPunto);
    
    // Mostrar los resultados
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `
        <p>Nombre: ${nombre}</p>
        <p>Categoría: ${categoria}</p>
        <p>Años de Experiencia: ${experiencia}</p>
        <p>Título Universitario: ${titulo}</p>
        <p>Número de Obras Artísticas: ${obras}</p>
        <p>Cargo Académico-Administrativo: ${cargo}</p>
        <p>Años en el cargo: ${aniosCargo}</p>
        <p>Tesis dirigidas: ${tesis}</p>
        <p>Evaluador: ${evaluador}</p>
        <p>Artículos publicados: ${articulos} (Categoría: ${categoriaArticulos})</p>
        <p>Valor del Punto: $${valorPunto.toLocaleString()}</p>
        <p><strong>Salario Total: $${salarioTotal.toLocaleString()}</strong></p>
    `;
});
