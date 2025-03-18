const PUNTOS_CATEGORIA = {
    instructor: 37,
    instructorUNAL: 44,
    asistente: 58,
    asociado: 74,
    titular: 96
};

const PUNTOS_TITULO = {
    regular: 178,
    medicina: 183
};

const PUNTOS_POSGRADO = {
    especializacion: {
        anios1a2: 20,
        maximo: 30,
        medicinaPorAnio: 15,
        medicinaMaximo: 75,
        maximoTotal: 60
    },
    maestria: {
        puntos: 40,
        dosMaximo: 60
    },
    doctorado: {
        conMaestriaOEspecializacion: 80,
        sinMaestriaOEspecializacion: 120,
        dosMaximo: 140
    },
    maximoAcumulable: 140
};

const PUNTOS_EXPERIENCIA = {
    investigacion: 6,
    docencia: 4,
    direccion: 4,
    profesional: 3,
    maximos: {
        instructor: 20,
        asistente: 45,
        asociado: 90,
        titular: 120
    }
};

const PUNTOS_CARGOS = {
    rector: 11,
    vicerrector: 9,
    decano: 6,
    vicedecano: 4,
    director: 2,
    ninguno: 0
};

const PUNTOS_OBRAS = {
    INTERNACIONAL: 48,
    NACIONAL: 38
};

const PUNTOS_ARTICULOS = {
    A1: 15,
    A2: 12,
    B: 8,
    C: 3,
    MULTIPLICADORES: {
        COMUNICACION_CORTA: 0.6,  // 60% del puntaje base
        REPORTE_CASO: 0.3         // 30% del puntaje base
    }
};

const PUNTOS_LIBRO = 60;

const PUNTOS_TESIS = {
    MAESTRIA: 36,
    DOCTORADO: 72
};

const AUTOR_AJUSTE = {
    MAX_AUTORES_PUNTAJE_COMPLETO: 3,
    MAX_AUTORES_MEDIO_PUNTAJE: 5
};

const AUTHOR_ADJUSTMENT = {
    THRESHOLD_FULL: 3,      // Up to 3 authors get full points
    THRESHOLD_HALF: 5,      // 4-5 authors get half points
    // 6+ authors get points divided by (number of authors / 2)
};
