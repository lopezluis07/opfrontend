const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Configura tu conexión a la base de datos
const connectionConfig = {
    host: 'localhost',
    user: 'root',  // Cambia esto por tu usuario
    password: '',  // Cambia esto por tu contraseña de MySQL
    database: 'supervisoresapp'  // Cambia esto por el nombre de tu base de datos
};

async function encriptarContraseñas() {
    try {
        // Conectarse a la base de datos
        const connection = await mysql.createConnection(connectionConfig);

        // Obtener todos los usuarios
        const [usuarios] = await connection.execute('SELECT id, password FROM usuarios');

        for (const usuario of usuarios) {
            const passwordPlano = usuario.password;

            // Verificar si la contraseña ya está hasheada (por ejemplo, si tiene menos de 60 caracteres, se considera sin hashear)
            if (passwordPlano.length < 60) {
                console.log(`Hasheando contraseña del usuario con ID: ${usuario.id}`);

                // Hashear la contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordPlano, salt);

                // Actualizar la contraseña en la base de datos
                await connection.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, usuario.id]);

                console.log(`Contraseña del usuario con ID: ${usuario.id} hasheada correctamente.`);
            } else {
                console.log(`La contraseña del usuario con ID: ${usuario.id} ya está hasheada.`);
            }
        }

        console.log('Proceso de encriptación de contraseñas completado.');
        await connection.end();
    } catch (error) {
        console.error('Error al encriptar contraseñas:', error);
    }
}

// Ejecutar la función
encriptarContraseñas();
  

