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
    let experienciaCalificada = Math.min(totalPuntos, maximoCategoria);

    return {
        total: experienciaCalificada,
        desglose: {
            docencia: puntosDocencia,
            investigacion: puntosInvestigacion,
            direccion: puntosDireccion,
            profesional: puntosProfesional
        }
    };
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

// Cargos administrativos según tabla y reglas proporcionadas
const PUNTOS_CARGOS_ADMIN = {
    rector: 25,
    vicerrector: 20,
    decano: 15,
    vicedecano: 13,
    director: 12
};

function calcularPuntosCargosAdministrativos(cargo, aniosCargo) {
    // Solo se suman años completos, máximo 5 años por cargo
    if (!cargo || cargo === "ninguno" || aniosCargo <= 0) return 0;
    const puntosPorAnio = PUNTOS_CARGOS[cargo] || 0;
    const aniosReconocidos = Math.min(aniosCargo, 5);
    return puntosPorAnio * aniosReconocidos;
}

function calcularTotalPuntos(datosProfesor) {
    // 1. Títulos universitarios
    const puntosTitulo = calcularPuntosTitulo(datosProfesor.tipoPregrado) ?? 0;
    let puntosEspecializacion = calcularPuntosEspecializacion(datosProfesor.numEspecializaciones, datosProfesor.duracionEspecializacion) ?? 0;
    let puntosMaestria = calcularPuntosMaestria(datosProfesor.numMaestrias) ?? 0;
    let puntosDoctorado = calcularPuntosDoctorado(datosProfesor.numDoctorados, (datosProfesor.numMaestrias > 0 || datosProfesor.numEspecializaciones > 0), datosProfesor.doctoradoPost1998) ?? 0;

    // Restricciones de suma de posgrados
    // Máximo 60 puntos entre especialización no clínica y maestría
    // Máximo 75 puntos entre especialización clínica y maestría
    let maxPosgrados = 60;
    if (datosProfesor.tipoPregrado === 'medicina' || datosProfesor.tipoPregrado === 'odontologia') {
        maxPosgrados = 75;
    }
    let sumaEspecializacionMaestria = puntosEspecializacion + puntosMaestria;
    if (sumaEspecializacionMaestria > maxPosgrados) {
        if (puntosMaestria > maxPosgrados) {
            puntosMaestria = maxPosgrados;
            puntosEspecializacion = 0;
        } else {
            puntosEspecializacion = maxPosgrados - puntosMaestria;
        }
    }

    // 2. Categoría en el escalafón docente
    const puntosEscalafon = calcularPuntosEscalafon(datosProfesor.categoria) ?? 0;

    // 3. Experiencia calificada (sumada en un solo campo)
    const experienciaObj = calcularPuntosExperiencia(
        datosProfesor.categoria,
        datosProfesor.aniosDocencia,
        datosProfesor.aniosInvestigacion,
        datosProfesor.aniosDireccion,
        datosProfesor.aniosProfesional
    ) ?? { total: 0, desglose: {} };
    const puntosExperiencia = experienciaObj.total;

    // 4. Cargos administrativos (solo el de mayor puntaje si hay varios)
    const puntosCargos = calcularPuntosCargosAdministrativos(datosProfesor.cargo, datosProfesor.aniosCargo) ?? 0;

    // 5. Productividad académica (solo artículos, obras y libros, NO tesis)
    const puntosObras = calcularPuntosObras(datosProfesor.obrasInternacional, datosProfesor.obrasNacional) ?? 0;
    const puntosArticulos = calcularPuntosArticulos(datosProfesor) ?? 0;
    const puntosLibros = calcularPuntosLibros(datosProfesor.numLibros) ?? 0;
    // Las tesis NO van en el tope de productividad académica
    const puntosTesis = calcularPuntosTesis(datosProfesor.numTesisMaestria, datosProfesor.numTesisDoctorado) ?? 0;

    // Tope máximo de productividad académica según categoría docente
    const topesProductividad = {
        instructor: 80,
        instructorunal: 80,
        asistente: 160,
        asociado: 320,
        titular: 540
    };
    // Normaliza la categoría para el tope
    const categoriaKey = (datosProfesor.categoria || '').toLowerCase().replace(/\s+/g, '');
    const topeProductividad = topesProductividad[categoriaKey] || 0;

    // Sumar solo artículos, obras y libros para el tope de productividad académica
    const sumaProductividad = puntosObras + puntosArticulos + puntosLibros;
    const puntosProductividad = Math.min(sumaProductividad, topeProductividad);

    // Suma total de puntos
    const totalPuntos = puntosTitulo + puntosEspecializacion + puntosMaestria + puntosDoctorado +
        puntosEscalafon + puntosExperiencia + puntosCargos + puntosProductividad + puntosTesis;

    return {
        total: totalPuntos,
        desglose: {
            titulo: puntosTitulo,
            especializacion: puntosEspecializacion,
            maestria: puntosMaestria,
            doctorado: puntosDoctorado,
            escalafon: puntosEscalafon,
            experienciaCalificada: puntosExperiencia,
            experiencia: experienciaObj ? experienciaObj.desglose : {},
            cargos: puntosCargos,
            obras: puntosObras,
            articulos: puntosArticulos,
            libros: puntosLibros,
            tesis: puntosTesis,
            productividad: puntosProductividad // Este campo ya refleja el tope aplicado
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

// La función calcularPuntosExperiencia ya suma correctamente los años de experiencia y aplica el tope.
// Solo asegúrate que los nombres de las categorías coincidan con los del formulario.
