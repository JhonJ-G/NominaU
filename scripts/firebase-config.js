// Configuración de Firebase
const firebaseConfig = {
    databaseURL: "https://palosingupc-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos
const database = firebase.database();

// Exportar para uso en otros archivos
window.firebaseDB = database;
