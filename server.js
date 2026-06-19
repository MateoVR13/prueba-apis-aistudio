/**
 * API REST de Proyectos con Express (Node.js)
 * Archivo: server.js
 * 
 * Este archivo implementa una API REST completa para gestionar proyectos en memoria.
 * Incluye el manejo de CORS, análisis de cuerpos JSON, datos de prueba y endpoints
 * para consultar, crear, modificar y eliminar proyectos (GET, POST, PUT, DELETE).
 * 
 * Instrucciones para ejecutar de forma individual:
 * 1. Asegúrate de tener instalado Node.js.
 * 2. Instala express ejecutando: npm install express
 * 3. Ejecuta este servidor con: node server.js
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// =============== BASE DE DATOS EN MEMORIA ===============
// Colección de proyectos iniciales de ejemplo
let proyectos = [
  {
    id: "1",
    titulo: "Portafolio Personal",
    tecnologia: "React & Tailwind CSS",
    publicado: true
  },
  {
    id: "2",
    titulo: "E-Commerce de Libros",
    tecnologia: "Next.js & PostgreSQL",
    publicado: false
  },
  {
    id: "3",
    titulo: "Dashboard de Clima Regional",
    tecnologia: "Angular & RxJS",
    publicado: true
  }
];

// =============== MIDDLEWARE CENTRALIZADO ===============

// 1. Analizador (Parser) de JSON: Necesario para leer 'req.body' en peticiones POST y PUT
app.use(express.json());

// 2. Control de Acceso CORS Manual (Cross-Origin Resource Sharing)
// Permite que clientes de cualquier dominio/puerto (como React, Vue, Angular o Postman)
// puedan interactuar de manera fluida y autorizada con este servidor de API.
app.use((req, res, next) => {
  // Permitir todas las peticiones de origen cruzado
  res.header("Access-Control-Allow-Origin", "*");
  
  // Encabezados HTTP permitidos en las solicitudes
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  
  // Métodos HTTP soportados en nuestra arquitectura RESTful
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // Respuesta inmediata y exitosa para solicitudes previas en métodos complejos (Preflight / OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});


// =============== ENDPOINTS / RUTAS DE LA API REAL ===============

/**
 * 1. GET /api/proyectos
 * Acción: Obtiene y retorna todos los proyectos registrados.
 * Respuesta: Código 200 (OK) con el arreglo completo de proyectos en formato JSON.
 */
app.get('/api/proyectos', (req, res) => {
  console.log('[GET] /api/proyectos - Retornando todos los proyectos');
  res.status(200).json(proyectos);
});

/**
 * 2. GET /api/proyectos/:id
 * Acción: Busca y retorna un proyecto específico por su identificador único ID.
 * Respuesta: 
 *   - 200 (OK) con el proyecto encontrado.
 *   - 404 (Not Found) si no existe ningún proyecto asociado a ese ID.
 */
app.get('/api/proyectos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[GET] /api/proyectos/${id} - Buscando proyecto específico`);

  const proyectoEncontrado = proyectos.find(p => p.id === id);

  if (!proyectoEncontrado) {
    return res.status(404).json({
      mensaje: "Proyecto no encontrado",
      error: `No existe ningún proyecto con el ID recibido: ${id}`
    });
  }

  res.status(200).json(proyectoEncontrado);
});

/**
 * 3. POST /api/proyectos
 * Acción: Agrega un nuevo proyecto a la lista en memoria.
 * Requiere (en el cuerpo de la petición/JSON):
 *   - titulo: String (obligatorio)
 *   - tecnologia: String (obligatorio)
 *   - publicado: Boolean (opcional, por defecto false)
 * Respuesta:
 *   - 201 (Created) si el proyecto es guardado exitosamente.
 *   - 400 (Bad Request) si faltan campos obligatorios.
 */
app.post('/api/proyectos', (req, res) => {
  console.log('[POST] /api/proyectos - Intentando agregar un nuevo proyecto:', req.body);
  const { titulo, tecnologia, publicado } = req.body;

  // Validación de datos para el Título
  if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({
      error: "Validación Fallida",
      mensaje: "El campo 'titulo' es mandatorio y debe contener texto válido."
    });
  }

  // Validación de datos para la Tecnología
  if (!tecnologia || typeof tecnologia !== 'string' || tecnologia.trim() === '') {
    return res.status(400).json({
      error: "Validación Fallida",
      mensaje: "El campo 'tecnologia' es mandatorio y debe contener texto válido."
    });
  }

  // Estructura del nuevo proyecto con generación automática de ID único
  const nuevoProyecto = {
    id: Date.now().toString(), // ID único basado en marca de tiempo actual
    titulo: titulo.trim(),
    tecnologia: tecnologia.trim(),
    publicado: publicado === true // Conversión estricta a booleano
  };

  proyectos.push(nuevoProyecto);

  res.status(201).json({
    mensaje: "Proyecto registrado satisfactoriamente",
    proyecto: nuevoProyecto
  });
});

/**
 * 4. PUT /api/proyectos/:id
 * Acción: Actualiza la información de un proyecto existente identificado por ID.
 * Permite modificación parcial (puedes enviar solo titulo, solo tecnologia, o solo publicado).
 * Respuesta:
 *   - 200 (OK) con un objeto del proyecto actualizado.
 *   - 404 (Not Found) si el ID proveído no existe.
 *   - 400 (Bad Request) si los valores enviados resultan inválidos.
 */
app.put('/api/proyectos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[PUT] /api/proyectos/${id} - Modificando proyecto:`, req.body);

  const proyectoIndice = proyectos.findIndex(p => p.id === id);

  if (proyectoIndice === -1) {
    return res.status(404).json({
      mensaje: "Proyecto no encontrado",
      error: `Incapaz de actualizar. No existe proyecto con ID: ${id}`
    });
  }

  const { titulo, tecnologia, publicado } = req.body;

  // Validación y actualización parcial de campos
  if (titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({
        error: "Validación Fallida",
        mensaje: "El campo 'titulo' de actualización contiene un valor inválido."
      });
    }
    proyectos[proyectoIndice].titulo = titulo.trim();
  }

  if (tecnologia !== undefined) {
    if (typeof tecnologia !== 'string' || tecnologia.trim() === '') {
      return res.status(400).json({
        error: "Validación Fallida",
        mensaje: "El campo 'tecnologia' de actualización contiene un valor inválido."
      });
    }
    proyectos[proyectoIndice].tecnologia = tecnologia.trim();
  }

  if (publicado !== undefined) {
    proyectos[proyectoIndice].publicado = publicado === true;
  }

  res.status(200).json({
    mensaje: "Proyecto actualizado exitosamente",
    proyecto: proyectos[proyectoIndice]
  });
});

/**
 * 5. DELETE /api/proyectos/:id
 * Acción: Elimina un proyecto específico por ID.
 * Respuesta:
 *   - 200 (OK) confirmando la eliminación del recurso y devolviendo los datos del proyecto eliminado.
 *   - 404 (Not Found) si el ID no corresponde a ningún proyecto.
 */
app.delete('/api/proyectos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE] /api/proyectos/${id} - Removiendo registro`);

  const proyectoIndice = proyectos.findIndex(p => p.id === id);

  if (proyectoIndice === -1) {
    return res.status(404).json({
      mensaje: "Proyecto no encontrado",
      error: `Incapaz de eliminar. No existe proyecto con el ID dado: ${id}`
    });
  }

  // Extraer el proyecto eliminado de la colección
  const eliminado = proyectos.splice(proyectoIndice, 1)[0];

  res.status(200).json({
    mensaje: "Proyecto borrado de la lista",
    proyecto: eliminado
  });
});

// =============== INICIAR ESCUCHA DEL SERVIDOR ===============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`📡 Servidor de API Express Listo y Escuchando`);
  console.log(`👉 Puerto local: ${PORT}`);
  console.log(`🌍 URL Base Local: http://localhost:${PORT}/api/proyectos`);
  console.log(`======================================================\n`);
});
