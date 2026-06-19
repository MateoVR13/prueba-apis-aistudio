/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  FileJson, 
  Layers, 
  Eye, 
  EyeOff, 
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Code,
  ShieldCheck,
  Filter,
  ListFilter
} from "lucide-react";

interface Proyecto {
  id: string;
  titulo: string;
  tecnologia: string;
  publicado: boolean;
}

interface RequestLog {
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";
  url: string;
  status: number;
  requestBody: string | null;
  responseBody: string | null;
  ok: boolean;
}

export default function App() {
  // Lista de proyectos sincronizada de la API
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  // Estados de carga e indicador de errores
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros en el cliente
  const [filtroPublicacion, setFiltroPublicacion] = useState<"todos" | "publicados" | "borradores">("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Estados del formulario para Crear nuevo proyecto
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaTecnologia, setNuevaTecnologia] = useState("");
  const [nuevoPublicado, setNuevoPublicado] = useState(false);

  // Estado que rastrea qué proyecto está actualmente en edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editTecnologia, setEditTecnologia] = useState("");
  const [editPublicado, setEditPublicado] = useState(false);

  // Consola / Historial del inspector de peticiones REST
  const [historialPeticiones, setHistorialPeticiones] = useState<RequestLog[]>([]);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RequestLog | null>(null);

  // Tab del panel derecho ("code" | "terminal")
  const [panelDerechoTab, setPanelDerechoTab] = useState<"code" | "terminal">("terminal");
  // Estado para feedback "Copiado"
  const [copiado, setCopiado] = useState(false);

  // URL del API
  const API_URL = "/api/proyectos";

  // Código server.js como constante para el visor integrado
  const serverJsCodigo = `/**
 * API REST de Proyectos con Express (Node.js)
 * Archivo: server.js
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos en memoria
let proyectos = [
  { id: "1", titulo: "Portafolio Personal", tecnologia: "React & Tailwind CSS", publicado: true },
  { id: "2", titulo: "E-Commerce de Libros", tecnologia: "Next.js & PostgreSQL", publicado: false },
  { id: "3", titulo: "Dashboard de Clima Regional", tecnologia: "Angular & RxJS", publicado: true }
];

// Parser JSON integrado
app.use(express.json());

// Middleware CORS Integrado Manualmente
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") { return res.status(200).end(); }
  next();
});

// GET /api/proyectos (Listar todos)
app.get('/api/proyectos', (req, res) => {
  res.status(200).json(proyectos);
});

// GET /api/proyectos/:id (Obtener por ID)
app.get('/api/proyectos/:id', (req, res) => {
  const proyecto = proyectos.find(p => p.id === req.params.id);
  if (!proyecto) return res.status(404).json({ error: "No encontrado" });
  res.status(200).json(proyecto);
});

// POST /api/proyectos (Crear nuevo)
app.post('/api/proyectos', (req, res) => {
  const { titulo, tecnologia, publicado } = req.body;
  if (!titulo || !tecnologia) return res.status(400).json({ error: "Faltan campos obligatorios" });
  const nuevo = { id: Date.now().toString(), titulo, tecnologia, publicado: publicado === true };
  proyectos.push(nuevo);
  res.status(201).json({ mensaje: "Creado", proyecto: nuevo });
});

// PUT /api/proyectos/:id (Actualizar parcial)
app.put('/api/proyectos/:id', (req, res) => {
  const proyecto = proyectos.find(p => p.id === req.params.id);
  if (!proyecto) return res.status(404).json({ error: "No encontrado" });
  const { titulo, tecnologia, publicado } = req.body;
  if (titulo !== undefined) proyecto.titulo = titulo;
  if (tecnologia !== undefined) proyecto.tecnologia = tecnologia;
  if (publicado !== undefined) proyecto.publicado = publicado === true;
  res.status(200).json({ mensaje: "Actualizado", proyecto });
});

// DELETE /api/proyectos/:id (Eliminar)
app.delete('/api/proyectos/:id', (req, res) => {
  const indice = proyectos.findIndex(p => p.id === req.params.id);
  if (indice === -1) return res.status(404).json({ error: "No encontrado" });
  const eliminado = proyectos.splice(indice, 1)[0];
  res.status(200).json({ mensaje: "Eliminado", proyecto: eliminado });
});

// Arrancar puerto 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en puerto 3000');
});`;

  // Copiar el código del servidor al portapapeles
  const copiarCodigoSls = () => {
    navigator.clipboard.writeText(serverJsCodigo);
    setCopiado(true);
    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  // Registro de peticiones realizadas para visualizarlas en consola
  const registrarPeticion = (
    method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS",
    url: string,
    status: number,
    requestBody: any,
    responseBody: any,
    ok: boolean
  ) => {
    const nuevoLog: RequestLog = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      requestBody: requestBody ? JSON.stringify(requestBody, null, 2) : null,
      responseBody: responseBody ? JSON.stringify(responseBody, null, 2) : null,
      ok
    };
    setHistorialPeticiones((prev) => [nuevoLog, ...prev].slice(0, 50));
    setRegistroSeleccionado(nuevoLog);
    // Cambiar al tab del terminal para mostrar feedback inmediato al usuario
    setPanelDerechoTab("terminal");
  };

  // Obtener todos los proyectos (GET)
  const obtenerProyectos = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      registrarPeticion("GET", API_URL, response.status, null, data, response.ok);
      
      if (response.ok) {
        setProyectos(data);
      } else {
        setErrorMessage(data.error || "No se pudieron obtener los proyectos.");
      }
    } catch (err: any) {
      setErrorMessage("No se pudo conectar con el servidor Express.");
      registrarPeticion("GET", API_URL, 500, null, { error: err.message }, false);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  // Obtener proyectos en la carga inicial
  useEffect(() => {
    obtenerProyectos();
  }, []);

  // Crear nuevo proyecto (POST)
  const crearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nuevoTitulo.trim()) {
      setErrorMessage("El título del proyecto es obligatorio.");
      return;
    }
    if (!nuevaTecnologia.trim()) {
      setErrorMessage("La tecnología es obligatoria.");
      return;
    }

    const payload = {
      titulo: nuevoTitulo,
      tecnologia: nuevaTecnologia,
      publicado: nuevoPublicado
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      registrarPeticion("POST", API_URL, response.status, payload, data, response.ok);

      if (response.ok) {
        setSuccessMessage(`¡Proyecto "${data.proyecto.titulo}" creado exitosamente!`);
        setNuevoTitulo("");
        setNuevaTecnologia("");
        setNuevoPublicado(false);
        obtenerProyectos(true);
      } else {
        setErrorMessage(data.error || "Error de la API al crear el proyecto.");
      }
    } catch (err: any) {
      setErrorMessage("Error de red al intentar conectar con la API.");
      registrarPeticion("POST", API_URL, 500, payload, { error: err.message }, false);
    }
  };

  // Iniciar modo de edición
  const activarEdicion = (proyecto: Proyecto) => {
    setEditandoId(proyecto.id);
    setEditTitulo(proyecto.titulo);
    setEditTecnologia(proyecto.tecnologia);
    setEditPublicado(proyecto.publicado);
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  // Guardar proyecto editado (PUT)
  const guardarEdicion = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      titulo: editTitulo,
      tecnologia: editTecnologia,
      publicado: editPublicado
    };

    const url = `${API_URL}/${id}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      registrarPeticion("PUT", url, response.status, payload, data, response.ok);

      if (response.ok) {
        setSuccessMessage("Proyecto editado correctamente.");
        setEditandoId(null);
        obtenerProyectos(true);
      } else {
        setErrorMessage(data.error || "No se pudo actualizar el proyecto.");
      }
    } catch (err: any) {
      setErrorMessage("Error en el servidor al intentar actualizar.");
      registrarPeticion("PUT", url, 500, payload, { error: err.message }, false);
    }
  };

  // Cambiar la publicación del proyecto (PUT rápido)
  const alternarPublicacion = async (proyecto: Proyecto) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      publicado: !proyecto.publicado
    };

    const url = `${API_URL}/${proyecto.id}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      registrarPeticion("PUT", url, response.status, payload, data, response.ok);

      if (response.ok) {
        setSuccessMessage(`Estado actualizado: "${proyecto.titulo}" es ahora ${!proyecto.publicado ? 'Público' : 'Borrador'}.`);
        obtenerProyectos(true);
      } else {
        setErrorMessage(data.error || "No se pudo cambiar el estado de publicación.");
      }
    } catch (err: any) {
      setErrorMessage("Error al cambiar estado de publicación.");
      registrarPeticion("PUT", url, 500, payload, { error: err.message }, false);
    }
  };

  // Eliminar proyecto (DELETE)
  const eliminarProyecto = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el proyecto "${titulo}"?`)) {
      return;
    }
    
    setErrorMessage(null);
    setSuccessMessage(null);

    const url = `${API_URL}/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE"
      });
      const data = await response.json();

      registrarPeticion("DELETE", url, response.status, null, data, response.ok);

      if (response.ok) {
        setSuccessMessage(`Proyecto "${titulo}" eliminado de manera permanente.`);
        obtenerProyectos(true);
      } else {
        setErrorMessage(data.error || "No se pudo eliminar el proyecto.");
      }
    } catch (err: any) {
      setErrorMessage("Ocurrió un error al intentar eliminar el recurso.");
      registrarPeticion("DELETE", url, 500, null, { error: err.message }, false);
    }
  };

  // Filtrar los proyectos obtenidos
  const proyectosFiltrados = proyectos.filter(p => {
    const cumpleFiltro = 
      filtroPublicacion === "todos" ? true :
      filtroPublicacion === "publicados" ? p.publicado === true :
      p.publicado === false;

    const cumpleBusqueda = 
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.tecnologia.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id.includes(busqueda);

    return cumpleFiltro && cumpleBusqueda;
  });

  // Métricas
  const totalProyectos = proyectos.length;
  const publicadosCount = proyectos.filter(p => p.publicado).length;
  const borradoresCount = totalProyectos - publicadosCount;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0B0E] font-sans text-gray-300 overflow-hidden select-none">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR (Sleek Theme style) */}
      <nav className="h-14 border-b border-gray-800/80 flex items-center justify-between px-6 bg-[#0E1015] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-600/25">
            E
          </div>
          <h1 className="text-white font-medium text-sm tracking-tight flex items-center gap-2">
            API Copilot <span className="text-gray-600">/</span> <span className="text-indigo-400 font-medium">Express Projects REST API</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-[#0A0B0E] px-3 py-1 rounded-full border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-mono">Server Live: Port 3000</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-800 hidden sm:block"></div>
          <button 
            onClick={() => obtenerProyectos()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs leading-relaxed transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        </div>
      </nav>

      {/* DISEÑO EN COLUMNAS CON EXPRESIVIDAD SLEEK INTERFACES */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ASIDE IZQUIERDO: ENDPOINTS & METRICAS (Sidebar style) */}
        <aside className="w-64 border-r border-[#151821] bg-[#0E1015] hidden md:flex flex-col p-5 justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Rutas de Endpoints REST */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4 px-1 leading-snug">
                Endpoints de la API
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 px-2.5 py-2 bg-[#141720] rounded-lg border border-gray-800/80">
                  <span className="text-[10px] font-bold text-cyan-400 w-10 shrink-0">GET</span>
                  <span className="text-gray-300 truncate">/api/proyectos</span>
                </div>
                
                <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#141720]/40 rounded-lg transition-colors border border-transparent">
                  <span className="text-[10px] font-bold text-emerald-400 w-10 shrink-0">POST</span>
                  <span className="text-gray-400 truncate">/api/proyectos</span>
                </div>
                
                <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#141720]/40 rounded-lg transition-colors border border-transparent">
                  <span className="text-[10px] font-bold text-indigo-400 w-10 shrink-0">PUT</span>
                  <span className="text-gray-400 truncate">/api/proyectos/:id</span>
                </div>
                
                <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#141720]/40 rounded-lg transition-colors border border-transparent">
                  <span className="text-[10px] font-bold text-rose-500 w-10 shrink-0">DEL</span>
                  <span className="text-gray-400 truncate">/api/proyectos/:id</span>
                </div>
              </div>
            </div>

            {/* Documentación CORS */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold leading-none">CORS Habilitado</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                La cabecera Cors está activada manualmente con el origen comodín <code className="text-indigo-300 font-mono">*</code> para permitir pruebas remotas desde cualquier app.
              </p>
            </div>

            {/* Documentación del cuerpo del POST */}
            <div className="p-4 bg-[#141720] border border-gray-800/60 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Esquema del Proyecto</span>
              <pre className="text-[10.5px] font-mono text-gray-500 leading-tight">
{`{
  id: string,
  titulo: string, 
  tecnologia: string,
  publicado: boolean
}`}
              </pre>
            </div>

          </div>

          {/* Metadata en el sidebar inferior */}
          <div className="border-t border-gray-800/60 pt-4 mt-4 text-[10px] font-mono text-gray-600 space-y-1">
            <p>DB TYPE: Memory Array</p>
            <p>RUNTIME: Node.js / Express</p>
            <p>PORT: 3000</p>
          </div>
        </aside>

        {/* WORKSPACE CENTRAL: PANEL DE PROYECTOS (Central main view style) */}
        <main className="flex-grow flex flex-col bg-[#0A0B0E] p-6 overflow-y-auto min-w-0">
          
          {/* Header del workspace */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Proyectos Activos</h2>
              <p className="text-xs text-gray-500 mt-0.5">Interactúa con el estado de la base de datos en tiempo real mediante la consola Express</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Buscador de proyectos sleeks */}
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar por título, tecnología o id..."
                className="bg-[#0E1015] border border-gray-800 focus:border-indigo-500 text-xs text-slate-100 placeholder:text-gray-600 rounded-lg px-3 py-1.5 outline-none transition w-44 md:w-56"
              />
              
              <div className="bg-[#0E1015] border border-gray-800 rounded-lg p-0.5 flex gap-0.5">
                <button
                  onClick={() => setFiltroPublicacion("todos")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${filtroPublicacion === "todos" ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroPublicacion("publicados")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${filtroPublicacion === "publicados" ? 'bg-emerald-600/30 text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}
                >
                  Públicos
                </button>
                <button
                  onClick={() => setFiltroPublicacion("borradores")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${filtroPublicacion === "borradores" ? 'bg-amber-600/30 text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}
                >
                  Borradores
                </button>
              </div>
            </div>
          </div>

          {/* PANEL DE MÉTRICAS COMPACTAS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0E1015] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest font-bold text-gray-500 uppercase">Proyectos</span>
              <span className="text-2xl font-extrabold text-white mt-1">{totalProyectos}</span>
            </div>
            <div className="bg-[#0E1015] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest font-bold text-gray-500 uppercase">Públicos</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1">{publicadosCount}</span>
            </div>
            <div className="bg-[#0E1015] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest font-bold text-gray-500 uppercase">Borradores</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1">{borradoresCount}</span>
            </div>
          </div>

          {/* ALERTAS */}
          <AnimatePresence mode="popLayout">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mb-4 p-3 rounded-lg border border-rose-900/30 bg-rose-950/10 text-rose-300 flex items-start gap-2.5 text-xs"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">Error detectado</p>
                  <p className="text-slate-400 mt-0.5">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage(null)} className="p-0.5 hover:bg-rose-900/20 text-rose-400 rounded transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mb-4 p-3 rounded-lg border border-emerald-900/30 bg-emerald-950/10 text-emerald-300 flex items-start gap-2.5 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-200">Instrucción completada</p>
                  <p className="text-slate-400 mt-0.5">{successMessage}</p>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="p-0.5 hover:bg-emerald-900/20 text-emerald-400 rounded transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORMULARIO INTEGRADO (POST) */}
          <div className="bg-[#0E1015] border border-gray-800 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-widest font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" /> Crear Proyecto
              </span>
              <span className="text-[10px] font-mono bg-indigo-900/20 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full">
                POST /api/proyectos
              </span>
            </div>

            <form onSubmit={crearProyecto} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-1.5">
                <label htmlFor="p-titulo" className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wider">Título del Proyecto</label>
                <input
                  id="p-titulo"
                  type="text"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej. API Gateway Microservicios"
                  className="w-full bg-[#0A0B0E] border border-gray-800 focus:border-indigo-500 text-slate-100 placeholder:text-gray-650 rounded-lg px-3 py-2 text-xs outline-none transition"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label htmlFor="p-tecnologia" className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wider">Tecnología Utilizada</label>
                <input
                  id="p-tecnologia"
                  type="text"
                  value={nuevaTecnologia}
                  onChange={(e) => setNuevaTecnologia(e.target.value)}
                  placeholder="Ej. Node.js, Express & Redis"
                  className="w-full bg-[#0A0B0E] border border-gray-800 focus:border-indigo-500 text-slate-100 placeholder:text-gray-650 rounded-lg px-3 py-2 text-xs outline-none transition"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-between gap-4 h-[34px]">
                <label htmlFor="p-publico" className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-gray-400 hover:text-white transition">
                  <input
                    id="p-publico"
                    type="checkbox"
                    checked={nuevoPublicado}
                    onChange={(e) => setNuevoPublicado(e.target.checked)}
                    className="rounded border border-gray-800 accent-indigo-600 focus:ring-0 focus:outline-none w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Habilitar Público</span>
                </label>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Enviar POST
                </button>
              </div>
            </form>
          </div>

          {/* TABLA PRINCIPAL DE PROYECTOS */}
          <div className="border border-gray-800 rounded-xl bg-[#0E1015] overflow-hidden">
            <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0E1015]">
              <span className="text-[11px] tracking-wider uppercase font-bold text-gray-500 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" /> Proyectos en Memoria ({proyectosFiltrados.length})
              </span>
              <span className="text-[10px] font-mono text-gray-500">GET /api/proyectos</span>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-xs font-mono text-gray-500">Recuperando registros del servidor virtual...</p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-xs font-mono text-gray-500">No hay proyectos que coincidan con la búsqueda o filtros actuales.</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button 
                    onClick={() => { setBusqueda(""); setFiltroPublicacion("todos"); }} 
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#0A0B0E]/70 text-[10px] uppercase font-mono tracking-wider text-gray-500 text-left border-b border-gray-800">
                    <tr>
                      <th className="p-3 pl-4 font-bold">ID</th>
                      <th className="p-3 font-bold">Nombre del Proyecto</th>
                      <th className="p-3 font-bold">Stack de Tecnología</th>
                      <th className="p-3 font-bold">Estado de Publicación</th>
                      <th className="p-3 pr-4 font-bold text-right">Acciones REST</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-300 divide-y divide-gray-800/50">
                    <AnimatePresence mode="popLayout">
                      {proyectosFiltrados.map((p) => {
                        const isEditing = editandoId === p.id;

                        return (
                          <motion.tr 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={p.id}
                            className={`hover:bg-indigo-600/[0.02] transition-colors ${isEditing ? 'bg-indigo-950/10' : ''}`}
                          >
                            {/* ID */}
                            <td className="p-3 pl-4 font-mono text-gray-500">#{p.id}</td>

                            {/* TITULO */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTitulo}
                                  onChange={(e) => setEditTitulo(e.target.value)}
                                  className="bg-[#0A0B0E] border border-gray-800 text-xs px-2.5 py-1 rounded outline-none text-white focus:border-indigo-500 w-full max-w-xs"
                                />
                              ) : (
                                <span className="font-semibold text-white">{p.titulo}</span>
                              )}
                            </td>

                            {/* TECNOLOGIA */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTecnologia}
                                  onChange={(e) => setEditTecnologia(e.target.value)}
                                  className="bg-[#0A0B0E] border border-gray-800 text-xs px-2.5 py-1 rounded outline-none text-white focus:border-indigo-500 w-full max-w-xs font-mono"
                                />
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-indigo-900/20 text-indigo-300 font-mono text-[10px]">
                                  {p.tecnologia}
                                </span>
                              )}
                            </td>

                            {/* ESTADO PUBLICACIÓN */}
                            <td className="p-3">
                              {isEditing ? (
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editPublicado}
                                    onChange={(e) => setEditPublicado(e.target.checked)}
                                    className="rounded border border-gray-800 text-indigo-500 focus:ring-0 focus:outline-none w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span className="text-[11px] text-gray-400">Publicado</span>
                                </label>
                              ) : (
                                <button
                                  onClick={() => alternarPublicacion(p)}
                                  className={`inline-flex items-center gap-1.5 font-sans hover:opacity-85 transition cursor-pointer`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${p.publicado ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  <span className={p.publicado ? "text-emerald-400" : "text-amber-400"}>
                                    {p.publicado ? "Publicado" : "Borrador"}
                                  </span>
                                </button>
                              )}
                            </td>

                            {/* ACCIONES */}
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={cancelarEdicion}
                                      className="px-2 py-1 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded text-[10px] font-mono font-medium transition cursor-pointer"
                                    >
                                      CANCEL
                                    </button>
                                    <button
                                      onClick={() => guardarEdicion(p.id)}
                                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-mono font-medium transition cursor-pointer flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" /> PUT
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => activarEdicion(p)}
                                      title="Modificar (PUT)"
                                      className="p-1.5 bg-gray-900 hover:bg-indigo-900/20 text-gray-500 hover:text-indigo-400 border border-gray-800 hover:border-indigo-500/20 rounded transition cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => eliminarProyecto(p.id, p.titulo)}
                                      title="Eliminar (DELETE)"
                                      className="p-1.5 bg-gray-900 hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 border border-gray-800 hover:border-rose-500/20 rounded transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Guía CURL */}
          <div className="mt-6 p-4 bg-[#0E1015]/60 border border-gray-850 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1">
              <Globe className="w-4 h-4 text-emerald-400" /> Pruebas con Clientes Externos (Postman / cURL)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px] font-mono text-gray-400">
              <div className="bg-[#07080B] p-2.5 rounded border border-gray-800/80">
                <span className="text-gray-500"># Obtener Todos (GET)</span>
                <p className="text-indigo-400 mt-1">curl -X GET http://localhost:3000/api/proyectos</p>
              </div>
              <div className="bg-[#07080B] p-2.5 rounded border border-gray-800/80">
                <span className="text-gray-500"># Crear Nuevo (POST)</span>
                <p className="text-emerald-400 mt-1">
                  curl -X POST http://localhost:3000/api/proyectos \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;{"-d '{\"titulo\":\"Novedoso\",\"tecnologia\":\"Koa\"}'"}
                </p>
              </div>
            </div>
          </div>

        </main>

        {/* ASIDE DERECHO: CONSOLA / SEVIDOR (Sleek side tab control) */}
        <aside className="w-96 border-l border-[#151821] bg-[#07080B] lg:flex flex-col hidden shrink-0 overflow-hidden">
          
          {/* TAB HEADERS */}
          <div className="h-12 border-b border-gray-800 flex items-center bg-[#0E1015] px-2 shrink-0 justify-between">
            <div className="flex gap-1">
              <button
                onClick={() => setPanelDerechoTab("terminal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-tight transition-all cursor-pointer ${
                  panelDerechoTab === "terminal" 
                    ? 'bg-[#07080B] text-indigo-400 border border-gray-800' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                REST Inspector ({historialPeticiones.length})
              </button>
              <button
                onClick={() => setPanelDerechoTab("code")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-tight transition-all cursor-pointer ${
                  panelDerechoTab === "code" 
                    ? 'bg-[#07080B] text-indigo-400 border border-gray-800' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                server.js
              </button>
            </div>

            {panelDerechoTab === "code" && (
              <button
                onClick={copiarCodigoSls}
                className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest hover:text-indigo-300 flex items-center gap-1.5 px-2 py-1 transition-colors hover:bg-indigo-500/10 rounded-md cursor-pointer"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 overflow-y-auto">
            
            {panelDerechoTab === "terminal" ? (
              <div className="p-4 flex flex-col h-full justify-between">
                
                {/* Solicitudes List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest font-bold text-gray-500 uppercase">Historial HTTP</span>
                    {historialPeticiones.length > 0 && (
                      <button 
                        onClick={() => {
                          setHistorialPeticiones([]);
                          setRegistroSeleccionado(null);
                        }}
                        className="text-[9px] hover:underline text-gray-500 hover:text-rose-400 font-mono cursor-pointer"
                      >
                        Limpiar histórico
                      </button>
                    )}
                  </div>

                  {historialPeticiones.length === 0 ? (
                    <div className="py-8 text-center text-gray-600 font-mono text-xs border border-dashed border-gray-800 rounded-xl bg-[#090A0E]/30">
                      <p>Vacío y esperando peticiones...</p>
                      <p className="text-[10px] mt-1 text-gray-700 max-w-[200px] mx-auto text-center">Registra o edita algún proyecto para capturar los payloads aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                      {historialPeticiones.map((log, index) => {
                        const isSelected = registroSeleccionado?.timestamp === log.timestamp && registroSeleccionado?.method === log.method;
                        const isGet = log.method === "GET";
                        const isPost = log.method === "POST";
                        const isPut = log.method === "PUT";
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setRegistroSeleccionado(log)}
                            className={`w-full text-left p-2 rounded-lg font-mono text-[10.5px] flex items-center justify-between transition-all border cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300' 
                                : 'bg-[#0E1015] border-transparent hover:border-gray-800 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden truncate">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${
                                isGet ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                isPost ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                isPut ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {log.method}
                              </span>
                              <span className="truncate">{log.url}</span>
                            </div>
                            <span className={log.ok ? "text-emerald-400 shrink-0 ml-1.5" : "text-rose-400 shrink-0 ml-1.5"}>{log.status}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Detalle Peticion Seleccionada */}
                  <div className="pt-3 border-t border-gray-800/80">
                    {registroSeleccionado ? (
                      <div className="space-y-3 font-mono text-[11px]">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 uppercase font-bold">Detalle de Petición</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            registroSeleccionado.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            HTTP {registroSeleccionado.status}
                          </span>
                        </div>

                        <div className="bg-[#0E1015] rounded-xl p-3 border border-gray-850 space-y-1.5 text-gray-400 overflow-hidden">
                          <p><span className="text-gray-600">METHOD :</span> {registroSeleccionado.method}</p>
                          <p><span className="text-gray-600">URL    :</span> {registroSeleccionado.url}</p>
                          <p><span className="text-gray-600">TIME   :</span> {registroSeleccionado.timestamp}</p>
                        </div>

                        {registroSeleccionado.requestBody && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                              <FileJson className="w-3.5 h-3.5 text-gray-600" /> Request Body (Payload)
                            </span>
                            <pre className="bg-[#0E1015] border border-gray-850 p-3 rounded-xl text-[10px] text-indigo-200 overflow-x-auto max-h-[110px]">
                              {registroSeleccionado.requestBody}
                            </pre>
                          </div>
                        )}

                        {registroSeleccionado.responseBody && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                              <FileJson className="w-3.5 h-3.5 text-gray-600" /> Response JSON
                            </span>
                            <pre className="bg-[#0E1015] border border-gray-850 p-3 rounded-xl text-[10px] text-slate-300 overflow-x-auto max-h-[170px]">
                              {registroSeleccionado.responseBody}
                            </pre>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="py-20 text-center font-mono text-[11px] text-gray-600 flex flex-col items-center justify-center gap-2">
                        <Terminal className="w-7 h-7 text-gray-800" />
                        <p>No has seleccionado llamada</p>
                        <p className="text-[10px] max-w-[220px] mx-auto text-gray-700 leading-normal">Selecciona algún registro de historial en la parte superior para inspeccionar el flujo HTTP REST interactivo.</p>
                      </div>
                    )}
                  </div>

                </div>

                <div className="text-[10px] font-mono text-gray-600 border-t border-gray-800/80 pt-4">
                  RELIABILITY MODE: Safe Cache Memory
                </div>

              </div>
            ) : (
              /* server.js Code Visualizer */
              <div className="p-4 font-mono text-[10.5px] leading-relaxed relative">
                <div className="bg-[#060709] border border-gray-850 rounded-xl p-4 overflow-x-auto max-h-[calc(100vh-120px)] text-gray-400">
                  <div className="text-gray-600 italic mb-2">// server.js</div>
                  
                  {/* Comentado rápido en color con sintaxis simple para visibilidad */}
                  {serverJsCodigo.split("\n").map((line, idx) => {
                    const isComment = line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*");
                    const isKeyword = line.includes("const ") || line.includes("let ") || line.includes("import ") || line.includes("app.get") || line.includes("app.post") || line.includes("app.put") || line.includes("app.delete");
                    
                    return (
                      <div key={idx} className="flex gap-4">
                        <span className="text-gray-700 hover:text-gray-600 select-none text-right w-6 shrink-0">{idx + 1}</span>
                        <span className={isComment ? "text-gray-500 italic" : isKeyword ? "text-white" : "text-gray-400"}>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </aside>

      </div>
      
      {/* FOOTER */}
      <footer className="h-8 border-t border-gray-800/60 bg-[#0E1015] px-6 flex items-center justify-between text-[10px] font-mono text-gray-500 shrink-0 select-none">
        <p>Express REST API Dashboard &copy; 2026</p>
        <div className="flex gap-4">
          <span className="text-gray-600">NODE: 22.x</span>
          <span className="text-indigo-400/80">THEME: Sleek Interface</span>
        </div>
      </footer>

    </div>
  );
}
