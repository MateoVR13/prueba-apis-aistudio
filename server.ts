/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Definición de la interfaz del Proyecto para tipado correcto en TypeScript
interface Proyecto {
  id: string;
  titulo: string;
  tecnologia: string;
  publicado: boolean;
}

// Datos de ejemplo iniciales (Base de datos en memoria para propósitos de demostración)
let proyectos: Proyecto[] = [
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Middleware para analizar cuerpos de solicitudes en formato JSON (bodyParser integrado)
  app.use(express.json());

  // 2. Middleware para habilitar CORS (Cross-Origin Resource Sharing) de manera manual y detallada
  // Esto permite que clientes en diferentes hosts/puertos realicen peticiones de forma segura.
  app.use((req, res, next) => {
    // Permite el acceso desde cualquier origen
    res.header("Access-Control-Allow-Origin", "*");
    
    // Define los encabezados/headers permitidos
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    
    // Define los métodos HTTP permitidos para la API REST
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    // Responder inmediatamente con 200 OK a las solicitudes pre-vuelo (Preflight request / OPTIONS)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
    next();
  });

  // ==========================================
  // RUTAS / ENDPOINTS DE LA API REST ("proyectos")
  // ==========================================

  /**
   * GET /api/proyectos
   * Obtiene la lista completa de todos los proyectos de la base de datos en memoria.
   */
  app.get("/api/proyectos", (req, res) => {
    console.log("[GET] /api/proyectos - Solicitando lista de proyectos");
    res.status(200).json(proyectos);
  });

  /**
   * GET /api/proyectos/:id
   * Obtiene un proyecto específico mediante su ID único.
   */
  app.get("/api/proyectos/:id", (req, res) => {
    const { id } = req.params;
    console.log(`[GET] /api/proyectos/${id} - Buscando proyecto`);

    const proyecto = proyectos.find((p) => p.id === id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
        error: `No existe un proyecto asociado al id: ${id}`
      });
    }

    res.status(200).json(proyecto);
  });

  /**
   * POST /api/proyectos
   * Crea y añade un nuevo proyecto.
   * Requiere en el cuerpo: titulo (string), tecnologia (string).
   * Opcional: publicado (boolean), si no se provee por defecto es false.
   */
  app.post("/api/proyectos", (req, res) => {
    console.log("[POST] /api/proyectos - Creando nuevo proyecto", req.body);
    const { titulo, tecnologia, publicado } = req.body;

    // Validación básica de campos obligatorios
    if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "El campo 'titulo' es obligatorio y debe ser una cadena válida."
      });
    }

    if (!tecnologia || typeof tecnologia !== "string" || tecnologia.trim() === "") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "El campo 'tecnologia' es obligatorio y debe ser una cadena válida."
      });
    }

    // Creación del nuevo registro del proyecto
    const nuevoProyecto: Proyecto = {
      id: Date.now().toString(), // Generación de un ID único y simple basado en marca temporaria
      titulo: titulo.trim(),
      tecnologia: tecnologia.trim(),
      publicado: publicado === true // Forzar asignación a booleano
    };

    proyectos.push(nuevoProyecto);

    res.status(201).json({
      mensaje: "Proyecto creado exitosamente",
      proyecto: nuevoProyecto
    });
  });

  /**
   * PUT /api/proyectos/:id
   * Modifica un proyecto existente especificando su ID único.
   * Permite actualizar título, tecnología y estado de publicación de manera parcial u obligatoria.
   */
  app.put("/api/proyectos/:id", (req, res) => {
    const { id } = req.params;
    console.log(`[PUT] /api/proyectos/${id} - Actualizando proyecto`, req.body);

    const indice = proyectos.findIndex((p) => p.id === id);

    if (indice === -1) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
        error: `No es posible actualizar. No existe un proyecto con el id: ${id}`
      });
    }

    const { titulo, tecnologia, publicado } = req.body;

    // Actualización selectiva/parcial si se proporcionan datos válidos en la petición
    if (titulo !== undefined) {
      if (typeof titulo !== "string" || titulo.trim() === "") {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "El campo 'titulo' de actualización debe ser una cadena de texto válida."
        });
      }
      proyectos[indice].titulo = titulo.trim();
    }

    if (tecnologia !== undefined) {
      if (typeof tecnologia !== "string" || tecnologia.trim() === "") {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "El campo 'tecnologia' de actualización debe ser una de texto válida."
        });
      }
      proyectos[indice].tecnologia = tecnologia.trim();
    }

    if (publicado !== undefined) {
      proyectos[indice].publicado = publicado === true;
    }

    res.status(200).json({
      mensaje: "Proyecto actualizado con éxito",
      proyecto: proyectos[indice]
    });
  });

  /**
   * DELETE /api/proyectos/:id
   * Elimina un proyecto por ID del almacén/arreglo en memoria.
   */
  app.delete("/api/proyectos/:id", (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] /api/proyectos/${id} - Eliminando proyecto`);

    const indice = proyectos.findIndex((p) => p.id === id);

    if (indice === -1) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
        error: `No es posible eliminar. No existe un proyecto con el id: ${id}`
      });
    }

    // Remover el proyecto del arreglo
    const proyectoEliminado = proyectos.splice(indice, 1)[0];

    res.status(200).json({
      mensaje: "Proyecto eliminado exitosamente",
      proyecto: proyectoEliminado
    });
  });

  // ==========================================
  // CONFIGURACIÓN DE VITE COMO MIDDLEWARE
  // ==========================================
  // En modo desarrollo, Vite se conecta a nuestro servidor Express para servir
  // el cliente SPA en React de forma integrada. En producción, se sirven los estáticos en 'dist/'.

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Integración de la capa de Vite como middleware de enrutamiento
    app.use(vite.middlewares);
  } else {
    // Servir los archivos construidos estáticamente para producción
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Escuchar en el puerto y host requeridos
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n============== SERVIDOR API REST EXPRESS ==============`);
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📝 Endpoints activos:`);
    console.log(`   - GET    /api/proyectos      (Listar todo)`);
    console.log(`   - GET    /api/proyectos/:id  (Obtener por ID)`);
    console.log(`   - POST   /api/proyectos      (Crear proyecto)`);
    console.log(`   - PUT    /api/proyectos/:id  (Actualizar proyecto)`);
    console.log(`   - DELETE /api/proyectos/:id  (Eliminar proyecto)`);
    console.log(`========================================================\n`);
  });
}

startServer();
