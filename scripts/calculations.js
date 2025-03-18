function calcularPuntosEscalafon(categoria) {
    return PUNTOS_CATEGORIA[categoria] || 0;
}

function calcularPuntosTitulo(tipoPregrado) {
    return PUNTOS_TITULO[tipoPregrado] || 0;
}

function calcularPuntosEspecializacion(numEspecializaciones, duracionAnios) {
    if (numEspecializaciones <= 0 || duracionAnios <= 0) return 0;
    
    let puntos = 0;
    if (duracionAnios >= 1 && duracionAnios <= 2) {
        puntos = PUNTOS_POSGRADO.especializacion.anios1a2;
    } else if (duracionAnios > 2) {
        puntos = PUNTOS_POSGRADO.especializacion.maximo;
    }
    
    return Math.min(puntos * Math.min(numEspecializaciones, 2), PUNTOS_POSGRADO.especializacion.maximoTotal);
}

function calcularPuntosMaestria(numMaestrias) {
    if (numMaestrias <= 0) return 0;
    if (numMaestrias === 1) return PUNTOS_POSGRADO.maestria.puntos;
    return PUNTOS_POSGRADO.maestria.dosMaximo; // Para 2 o más maestrías
}

function calcularPuntosDoctorado(numDoctorados, tieneMaestriaOEspecializacion, doctoradoPost1998) {
    if (numDoctorados <= 0) return 0;
    
    let puntosPrimerDoctorado = tieneMaestriaOEspecializacion ? 
        PUNTOS_POSGRADO.doctorado.conMaestriaOEspecializacion : 
        PUNTOS_POSGRADO.doctorado.sinMaestriaOEspecializacion;
    
    if (numDoctorados === 1) {
        return doctoradoPost1998 && !tieneMaestriaOEspecializacion ? puntosPrimerDoctorado + 40 : puntosPrimerDoctorado;
    }
    
    return Math.min(puntosPrimerDoctorado + 20, PUNTOS_POSGRADO.doctorado.dosMaximo);
}

function calcularPuntosExperiencia(categoria, aniosDocencia, aniosInvestigacion, aniosDireccion, aniosProfesional) {
    let puntosDocencia = aniosDocencia * PUNTOS_EXPERIENCIA.docencia;
    let puntosInvestigacion = aniosInvestigacion * PUNTOS_EXPERIENCIA.investigacion;
    let puntosDireccion = aniosDireccion * PUNTOS_EXPERIENCIA.direccion;
    let puntosProfesional = aniosProfesional * PUNTOS_EXPERIENCIA.profesional;
    
    let totalPuntos = puntosDocencia + puntosInvestigacion + puntosDireccion + puntosProfesional;
    
    // Limitar según la categoría
    let maximoCategoria = PUNTOS_EXPERIENCIA.maximos[categoria] || 0;
    return Math.min(totalPuntos, maximoCategoria);
}

function calcularPuntosCargos(cargo, aniosCargo) {
    if (cargo === "ninguno" || aniosCargo <= 0) return 0;
    return (PUNTOS_CARGOS[cargo] || 0) * aniosCargo;
}

function ajustarPuntajePorAutores(puntajeBase, numAutores) {
    if (numAutores <= AUTOR_AJUSTE.MAX_AUTORES_PUNTAJE_COMPLETO) {
        return puntajeBase; // Puntaje completo para 3 o menos autores
    } else if (numAutores <= AUTOR_AJUSTE.MAX_AUTORES_MEDIO_PUNTAJE) {
        return puntajeBase / 2; // Mitad del puntaje para 4-5 autores
    } else {
        // Para 6 o más autores: puntaje total / (número de autores / 2)
        return puntajeBase / (numAutores / 2);
    }
}

function calcularPuntosArticulos(datosProfesor) {
    let puntosTotal = 0;

    ['a1', 'a2', 'b', 'c'].forEach(categoria => {
        const numArticulos = parseInt(datosProfesor[`articulos${categoria.toUpperCase()}`]);

        if (numArticulos > 0) {
            for (let i = 1; i <= numArticulos; i++) {
                const numAutores = parseInt(datosProfesor[`autores-${categoria}-${i}`]);
                const tipoArticulo = document.getElementById(`tipo-${categoria}-${i}`).value;
                let puntosPorArticulo = PUNTOS_ARTICULOS[categoria.toUpperCase()];

                // Ajustar según tipo de publicación
                if (tipoArticulo === 'comunicacion') {
                    puntosPorArticulo *= PUNTOS_ARTICULOS.MULTIPLICADORES.COMUNICACION_CORTA;
                } else if (tipoArticulo === 'reporte') {
                    puntosPorArticulo *= PUNTOS_ARTICULOS.MULTIPLICADORES.REPORTE_CASO;
                }

                // Ajustar por número de autores
                if (numAutores >= 1 && numAutores <= 3) {
                    // Puntaje permanece igual
                } else if (numAutores >= 4 && numAutores <= 6) {
                    puntosPorArticulo /= 2; // Dividir entre 2
                } else if (numAutores > 6) {
                    puntosPorArticulo /= numAutores; // Dividir entre el número de autores
                }

                puntosTotal += puntosPorArticulo;
            }
        }
    });

    return puntosTotal;
}

function calcularPuntosObras(obrasInternacional, obrasNacional) {
    return (obrasInternacional * PUNTOS_OBRAS.INTERNACIONAL) + 
           (obrasNacional * PUNTOS_OBRAS.NACIONAL);
}

function calcularPuntosLibros(numLibros) {
    return numLibros * PUNTOS_LIBRO;
}

function calcularPuntosTesis(numTesisMaestria, numTesisDoctorado) {
    return (numTesisMaestria * PUNTOS_TESIS.MAESTRIA) + 
           (numTesisDoctorado * PUNTOS_TESIS.DOCTORADO);
}

function calcularTotalPuntos(datosProfesor) {
    const {
        categoria,
        tipoPregrado,
        numEspecializaciones,
        duracionEspecializacion,
        numMaestrias,
        numDoctorados,
        doctoradoPost1998,
        aniosDocencia,
        aniosInvestigacion,
        aniosDireccion,
        aniosProfesional,
        cargo,
        aniosCargo,
        obrasInternacional,
        obrasNacional,
        articulosA1,
        articulosA2,
        articulosB,
        articulosC,
        numLibros,
        numTesisMaestria,
        numTesisDoctorado
    } = datosProfesor;

    // Determinar si tiene maestría o especialización para el cálculo del doctorado
    const tieneMaestriaOEspecializacion = numMaestrias > 0 || numEspecializaciones > 0;

    // Calcular puntos por cada categoría
    const puntosEscalafon = calcularPuntosEscalafon(categoria) ?? 0;
    const puntosTitulo = calcularPuntosTitulo(tipoPregrado) ?? 0;
    const puntosEspecializacion = calcularPuntosEspecializacion(numEspecializaciones, duracionEspecializacion) ?? 0;
    const puntosMaestria = calcularPuntosMaestria(numMaestrias) ?? 0;
    const puntosDoctorado = calcularPuntosDoctorado(numDoctorados, tieneMaestriaOEspecializacion, doctoradoPost1998) ?? 0;
    const puntosExperiencia = calcularPuntosExperiencia(categoria, aniosDocencia, aniosInvestigacion, aniosDireccion, aniosProfesional) ?? 0;
    const puntosCargos = calcularPuntosCargos(cargo, aniosCargo) ?? 0;
    const puntosObras = calcularPuntosObras(obrasInternacional, obrasNacional) ?? 0;
    const puntosArticulos = calcularPuntosArticulos(datosProfesor) ?? 0;
    const puntosLibros = calcularPuntosLibros(numLibros) ?? 0;
    const puntosTesis = calcularPuntosTesis(numTesisMaestria, numTesisDoctorado) ?? 0;
    
    // Asegurar que no se exceda el máximo acumulable de posgrados
    const totalPosgrados = Math.min(puntosEspecializacion + puntosMaestria + puntosDoctorado, PUNTOS_POSGRADO.maximoAcumulable);

    // Suma total de puntos
    const totalPuntos = puntosEscalafon + puntosTitulo + totalPosgrados + puntosExperiencia + 
                       puntosCargos + puntosObras + puntosArticulos + puntosLibros + puntosTesis;

    return {
        total: totalPuntos,
        desglose: {
            escalafon: puntosEscalafon ?? 0,
            titulo: puntosTitulo ?? 0,
            especializacion: puntosEspecializacion ?? 0,
            maestria: puntosMaestria ?? 0,
            doctorado: puntosDoctorado ?? 0,
            posgradosTotal: totalPosgrados ?? 0,
            experiencia: puntosExperiencia ?? 0,
            cargos: puntosCargos ?? 0,
            obras: puntosObras ?? 0,
            articulos: puntosArticulos ?? 0,
            libros: puntosLibros ?? 0,
            tesis: puntosTesis ?? 0
        }
    };
}

function calculateSalary(formData) {
    const puntosBase = calcularTotalPuntos(formData);
    const salarioMensual = puntosBase.total * formData.valorPunto;
    
    // Determinar los meses según el tipo de profesor
    const esProfesorPlanta = formData.tipoProfesor === 'planta';
    const mesesContrato = esProfesorPlanta ? 12 : 10;
    
    // Calcular pagos por período
    const salarioTrimestral = salarioMensual * 3;
    const salarioSemestral = salarioMensual * 6;
    const salarioAnual = salarioMensual * mesesContrato; // 10 meses para ocasionales, 12 para planta

    return {
        basePoints: puntosBase.total,
        salarioMensual,
        salarioTrimestral,
        salarioSemestral,
        salarioAnual,
        mesesContrato,
        details: {
            basePointsBreakdown: puntosBase.desglose,
            tipoProfesor: formData.tipoProfesor
        }
    };
}
