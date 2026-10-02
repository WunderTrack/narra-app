import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Users, BookOpen, Layers, Type, Plus, Trash2, Home, Save, Download, Search, GripVertical, ChevronDown, Clock, Hash, X, FileText, FileImage, FileCode, File, Headphones, Music, BarChart2, PieChart, Menu, Sun, Moon, ArrowRight } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const capitalizeName = (str) => {
  if (!str) return '';
  return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

const loadHtml2Canvas = () => {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) return resolve(window.html2canvas);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => resolve(window.html2canvas);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) return resolve(window.html2pdf);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve(window.html2pdf);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

function ConfirmButton({ onClick, icon: Icon, text, className }) {
  const [asking, setAsking] = useState(false);
  
  if (asking) {
    return (
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-surface)] border border-[var(--accent)] rounded z-20 relative animate-in fade-in duration-200">
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); setAsking(false); }} className="text-[10px] uppercase tracking-wider font-semibold bg-[var(--accent)] text-[var(--bg-surface)] px-2 py-1 rounded hover:opacity-90 transition-opacity outline-none focus-ring">BORRAR</button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsking(false); }} className="text-[10px] uppercase tracking-wider font-semibold bg-transparent text-[var(--text-main)] px-2 py-1 rounded hover:bg-[var(--accent-soft)] transition-colors outline-none focus-ring">NO</button>
      </div>
    );
  }
  
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsking(true); }} className={`relative z-10 p-1.5 focus:outline-none focus-ring rounded transition-colors ${className}`} title={text || "Eliminar"}>
      {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" />}
      {text && <span className="ml-1 text-xs font-medium">{text}</span>}
    </button>
  );
}

function ExportDropdown({ onExport, className = "", excludeImage = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative print:hidden ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors flex items-center gap-2 outline-none focus-ring"
        aria-expanded={open}
      >
        <Download size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Exportar</span> <ChevronDown size={14} strokeWidth={2} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--divider)] z-50 rounded shadow-sm py-2 overflow-hidden">
          <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] mb-1">Documentos</div>
          <button onClick={() => { onExport('pdf'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
            <File size={16} strokeWidth={1.5} className="shrink-0" /> PDF [Impresión]
          </button>
          <button onClick={() => { onExport('doc'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
            <FileCode size={16} strokeWidth={1.5} className="shrink-0" /> Word [.DOC]
          </button>
          
          <div className="px-4 py-1 mt-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-t border-[var(--divider)] pt-3 mb-1">Texto Plano</div>
          <button onClick={() => { onExport('txt'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
            <FileText size={16} strokeWidth={1.5} className="shrink-0" /> Texto [.TXT]
          </button>
          <button onClick={() => { onExport('md'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
            <FileCode size={16} strokeWidth={1.5} className="shrink-0" /> Markdown [.MD]
          </button>
          
          {!excludeImage && (
            <>
              <div className="px-4 py-1 mt-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-t border-[var(--divider)] pt-3 mb-1">Gráficos</div>
              <button onClick={() => { onExport('png'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
                <FileImage size={16} strokeWidth={1.5} className="shrink-0" /> Imagen [PNG]
              </button>
              <button onClick={() => { onExport('jpg'); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]">
                <FileImage size={16} strokeWidth={1.5} className="shrink-0" /> Imagen [JPG]
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const FormGroup = ({ label, children, optional = false, description = "" }) => (
  <div className="mb-8">
    <div className="flex justify-between items-baseline mb-2">
      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)]">{label}</label>
      {optional && <span className="text-[10px] text-[var(--text-sec)] italic">Opcional</span>}
    </div>
    {children}
    {description && <p className="text-xs mt-2 text-[var(--text-sec)] leading-relaxed">{description}</p>}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full bg-[var(--bg-surface)] border border-[var(--divider)] rounded text-[var(--text-main)] text-sm px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-sec)] focus-ring ${className}`}
    {...props}
  />
);

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedProjects = localStorage.getItem('radio_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    
    const savedTheme = localStorage.getItem('radio_theme');
    if (savedTheme === 'dark') setIsDark(true);

    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      :root {
        --bg-main: #F7F5F0;
        --bg-surface: #FCFBF8;
        --text-main: #242424;
        --text-sec: #77736B;
        --divider: #DDD9D0;
        --accent: #6F7560;
        --accent-soft: #E5E8DD;
        --color-planteamiento: #2c4c7c;
        --color-confrontacion: #a33b3b;
        --color-resolucion: #366b46;
      }

      .dark-theme {
        --bg-main: #181917;
        --bg-surface: #20211F;
        --text-main: #E9E7E0;
        --text-sec: #9D9B92;
        --divider: #353630;
        --accent: #A8AF8E;
        --accent-soft: #303426;
        --color-planteamiento: #5a8bdc;
        --color-confrontacion: #e06c6c;
        --color-resolucion: #62b37b;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-main);
        color: var(--text-main);
        -webkit-font-smoothing: antialiased;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      .font-courier, .font-courier input, .font-courier textarea, .font-courier select { 
        font-family: 'Courier New', Courier, monospace !important; 
      }
      
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--divider); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--text-sec); }

      ::selection { background-color: var(--accent-soft); color: var(--text-main); }

      .focus-ring { outline: none; }
      .focus-ring:focus-visible { box-shadow: 0 0 0 2px var(--bg-main), 0 0 0 4px var(--accent); border-radius: 2px; }

      @media print {
        @page { margin: 1cm; }
        body, html, #root { height: auto !important; overflow: visible !important; background: white !important; }
        .dark-theme { --bg-main: white; --bg-surface: white; --text-main: black; --text-sec: #555; --divider: #ddd; }
        .flex.h-screen { display: block !important; height: auto !important; overflow: visible !important; }
        .flex-1.overflow-hidden { display: block !important; height: auto !important; overflow: visible !important; position: static !important; }
        .overflow-y-auto, .overflow-x-auto { overflow: visible !important; height: auto !important; display: block !important; }
        .print\\:hidden { display: none !important; }
        .print-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-w: none !important; box-shadow: none !important; border: none !important; display: block !important; height: auto !important; overflow: visible !important; background: white !important; }
        .print-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
        #estructura-export-container .flex.gap-6 { display: block !important; }
        #estructura-export-container .flex-1 { margin-bottom: 2rem !important; page-break-inside: avoid !important; height: auto !important; overflow: visible !important; }
        #escaleta-export-container, #escaleta-export-container .flex-1 { display: block !important; overflow: visible !important; height: auto !important; }
        ::-webkit-scrollbar { display: none; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('radio_theme', newTheme ? 'dark' : 'light');
  };

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    localStorage.setItem('radio_projects', JSON.stringify(updatedProjects));
  };

  const handleCreateProject = () => {
    const newProject = {
      id: generateId(),
      general: {
        programName: '',
        duration: '',
        broadcastDate: '',
        format: '',
        director: '',
        producer: '',
        motive: '',
        announcers: [],
        operator: '',
        programNumber: '',
        productionCompany: ''
      },
      people: [],
      scenes: [],
      interventions: [],
      soundEffects: [],
      music: [],
      lastModified: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    saveProjects(updated);
    setActiveProject(newProject);
  };

  const handleUpdateProject = (updatedProject) => {
    updatedProject.lastModified = new Date().toISOString();
    const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    saveProjects(updated);
    setActiveProject(updatedProject);
  };

  const handleDeleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'dark-theme' : ''}`}>
      {activeProject ? (
        <ProjectWorkspace project={activeProject} updateProject={handleUpdateProject} onClose={() => setActiveProject(null)} isDark={isDark} toggleTheme={toggleTheme} />
      ) : (
        <Dashboard projects={projects} onCreate={handleCreateProject} onOpen={setActiveProject} onDelete={handleDeleteProject} isDark={isDark} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

function Dashboard({ projects, onCreate, onOpen, onDelete, isDark, toggleTheme }) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-[var(--divider)] pb-8 mb-12">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[var(--text-main)]">NARRA</h1>
            <p className="mt-2 text-sm text-[var(--text-sec)]">Por César Alzamora</p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded hover:bg-[var(--accent-soft)] text-[var(--text-sec)] transition-colors outline-none focus-ring shrink-0" title="Cambiar tema">
              {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>
            <button 
              onClick={onCreate}
              className="bg-[var(--accent)] text-[var(--bg-surface)] px-5 py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-2 focus-ring"
            >
              <Plus size={18} strokeWidth={2} className="shrink-0" /> Nuevo proyecto
            </button>
          </div>
        </header>
        
        {projects.length === 0 ? (
          <div className="border border-[var(--divider)] rounded p-16 flex flex-col items-center justify-center bg-[var(--bg-surface)]">
            <span className="text-sm font-medium text-[var(--text-sec)] mb-6">Archivo Vacío</span>
            <button onClick={onCreate} className="text-sm font-medium text-[var(--text-main)] border-b border-[var(--text-main)] hover:text-[var(--accent)] hover:border-[var(--accent)] outline-none focus-ring transition-colors">
              Nuevo proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="group relative bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-6 hover:border-[var(--accent)] transition-colors duration-200 cursor-pointer flex flex-col h-full focus-within:border-[var(--accent)] outline-none"
                onClick={() => onOpen(project)}
                tabIndex={0}
                onKeyDown={(e) => { if(e.key === 'Enter') onOpen(project); }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)]">
                    N° {String(project.general.programNumber || '--').padStart(2, '0')}
                  </div>
                  <ConfirmButton 
                    icon={Trash2} 
                    onClick={() => onDelete(project.id)} 
                    className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--accent-soft)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                
                <h3 className="font-semibold text-lg leading-snug text-[var(--text-main)] mb-1 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {project.general.programName || 'Proyecto sin título'}
                </h3>
                <div className="text-sm text-[var(--text-sec)] mb-6">{project.general.format || 'Formato no definido'}</div>
                
                <div className="mt-auto pt-4 border-t border-[var(--divider)] flex justify-between items-center text-xs text-[var(--text-sec)]">
                  <div className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.5} className="shrink-0"/> {project.general.duration || '--:--'}</div>
                  <div>Mod: {new Date(project.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const NavItem = ({ activeTab, setActiveTab, id, icon: Icon, label }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab && setActiveTab(id)} 
      className={`w-full flex items-center px-4 py-3 transition-colors outline-none focus-ring rounded mb-1 relative group/item ${isActive ? 'bg-[var(--accent-soft)] text-[var(--text-main)] font-medium' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)]'}`}
      title={label}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`} />
      <span className="ml-4 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </button>
  );
};

function ProjectWorkspace({ project, updateProject, onClose, isDark, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('general');
  const [targetSceneId, setTargetSceneId] = useState(null);

  const formatStr = (project.general.format || '').toLowerCase();
  const hideNarrativeTabs = ['programa radial', 'podcast', 'entrevista'].some(f => formatStr.includes(f));

  useEffect(() => {
    if (hideNarrativeTabs && (activeTab === 'estructura' || activeTab === 'escaleta')) {
      setActiveTab('guion');
    }
  }, [hideNarrativeTabs, activeTab]);

  const handleNavigateToGuion = (sceneId) => {
    setActiveTab('guion');
    setTargetSceneId(sceneId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      
      {/* Sidebar Flotante - Efecto Overlay para no empujar contenido */}
      <div className="fixed top-0 left-0 h-full bg-[var(--bg-surface)] border-r border-[var(--divider)] z-40 w-16 hover:w-64 transition-all duration-300 group overflow-x-hidden flex flex-col print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-4 border-b border-[var(--divider)] shrink-0 bg-[var(--bg-surface)] z-50">
          <button onClick={onClose} className="p-2 rounded text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)] transition-colors outline-none focus-ring shrink-0" title="Cerrar Expediente">
            <Home size={18} strokeWidth={1.5} className="shrink-0" />
          </button>
          <div className="ml-3 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Archivo Técnico
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-2 py-6 custom-scrollbar">
          <div className="mb-6">
            <div className="px-4 text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Base</div>
            <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="general" icon={Settings} label="Datos Generales" />
            <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="people" icon={Users} label="Personas" />
          </div>
          
          <div className="mb-6">
            <div className="px-4 text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Producción</div>
            {!hideNarrativeTabs && (
              <>
                <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="estructura" icon={Layers} label="Estructura" />
                <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="escaleta" icon={BookOpen} label="Escaleta" />
              </>
            )}
            <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="guion" icon={Type} label="Guion Radiofónico" />
          </div>

          <div>
            <div className="px-4 text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Archivo</div>
            <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="recursos" icon={Headphones} label="Inventario Sonoro" />
            <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="estadisticas" icon={BarChart2} label="Analítica" />
          </div>
        </div>
        
        <div className="p-4 border-t border-[var(--divider)] flex flex-col gap-2 shrink-0 bg-[var(--bg-surface)] overflow-x-hidden">
           <button onClick={toggleTheme} className="flex items-center px-2 py-2 w-full rounded text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)] transition-colors outline-none focus-ring">
              {isDark ? <Sun size={18} strokeWidth={1.5} className="shrink-0" /> : <Moon size={18} strokeWidth={1.5} className="shrink-0" />}
              <span className="ml-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Modo {isDark ? 'Claro' : 'Oscuro'}</span>
           </button>
           <div className="text-[10px] text-[var(--text-sec)] text-center opacity-0 group-hover:opacity-100 transition-opacity mt-2 font-mono whitespace-nowrap">
              REF: {project.id.toUpperCase()}
           </div>
        </div>
      </div>

      {/* Main Content Area - Layout static margin left */}
      <div className="flex-1 flex flex-col overflow-hidden relative pl-16 print:pl-0 print:w-full">
        {activeTab === 'general' && <GeneralDataForm project={project} updateProject={updateProject} onNext={() => setActiveTab(hideNarrativeTabs ? 'guion' : 'estructura')} hideNarrativeTabs={hideNarrativeTabs} />}
        {activeTab === 'people' && <PeopleManager project={project} updateProject={updateProject} />}
        {activeTab === 'estructura' && <EstructuraManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />}
        {activeTab === 'escaleta' && <EscaletaManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />}
        {activeTab === 'guion' && <GuionManager project={project} updateProject={updateProject} targetSceneId={targetSceneId} />}
        {activeTab === 'recursos' && <ResourcesManager project={project} updateProject={updateProject} />}
        {activeTab === 'estadisticas' && <StatisticsManager project={project} />}
      </div>
    </div>
  );
}

function GeneralDataForm({ project, updateProject, onNext, hideNarrativeTabs }) {
  const [formData, setFormData] = useState(project.general);
  const [saveStatus, setSaveStatus] = useState('Guardado'); 
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const formatDropdownRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const persistData = useCallback((newGeneralData, updatedPeople = null) => {
    setSaveStatus('Guardando...');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      updateProject(prevProject => ({
        ...prevProject,
        general: newGeneralData,
        people: updatedPeople || prevProject.people,
        lastModified: new Date().toISOString()
      }));
      setSaveStatus('Guardado');
    }, 600);
  }, [updateProject]);

  const handleChange = (field, value) => {
    let finalValue = value;
    const fieldsToCapitalize = ['programName', 'director', 'producer', 'operator', 'productionCompany'];
    if (fieldsToCapitalize.includes(field)) {
      finalValue = capitalizeName(value);
    }
    const updated = { ...formData, [field]: finalValue };
    setFormData(updated);
    persistData(updated);
  };

  const handleAddLocutor = (name) => {
    if (!name.trim()) return;
    const trimmed = capitalizeName(name.trim());
    if (!formData.announcers.includes(trimmed)) {
      const updatedAnnouncers = [...formData.announcers, trimmed];
      const updatedGeneral = { ...formData, announcers: updatedAnnouncers };
      
      let updatedPeople = [...project.people];
      const exists = updatedPeople.find(p => p.realName.toLowerCase() === trimmed.toLowerCase());
      
      if (!exists) {
        const newPerson = {
          id: generateId(),
          realName: trimmed,
          displayName: trimmed.split(' ')[0],
          types: ['LOCUTOR']
        };
        updatedPeople = [newPerson, ...updatedPeople];
      } else if (!exists.types.includes('LOCUTOR')) {
        updatedPeople = updatedPeople.map(p => 
          p.id === exists.id ? { ...p, types: [...p.types, 'LOCUTOR'] } : p
        );
      }
      
      setFormData(updatedGeneral);
      persistData(updatedGeneral, updatedPeople);
    }
  };

  const handleRemoveLocutor = (name) => {
    const updatedAnnouncers = formData.announcers.filter(l => l !== name);
    const updatedGeneral = { ...formData, announcers: updatedAnnouncers };
    setFormData(updatedGeneral);
    persistData(updatedGeneral);
  };

  const handleOperadorBlur = () => {
    if (!formData.operator || !formData.operator.trim()) return;
    const trimmed = capitalizeName(formData.operator.trim());
    
    let updatedPeople = [...project.people];
    const exists = updatedPeople.find(p => p.realName.toLowerCase() === trimmed.toLowerCase());
    
    let peopleChanged = false;
    if (!exists) {
      const newPerson = {
        id: generateId(),
        realName: trimmed,
        displayName: trimmed.split(' ')[0], 
        types: ['CONTROL']
      };
      updatedPeople = [newPerson, ...updatedPeople];
      peopleChanged = true;
    } else if (!exists.types.includes('CONTROL')) {
      updatedPeople = updatedPeople.map(p => 
        p.id === exists.id ? { ...p, types: [...p.types, 'CONTROL'] } : p
      );
      peopleChanged = true;
    }
    
    if (peopleChanged) persistData(formData, updatedPeople);
  };

  const formatOptions = ["Programa radial", "Ficción sonora", "Podcast", "Entrevista", "Documental sonoro"];
  const filteredFormats = formatOptions.filter(f => f.toLowerCase().includes(formData.format.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center shrink-0 border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20">
        <div>
          <h2 className="text-lg font-medium text-[var(--text-main)]">Datos Generales</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 opacity-70">
            <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'Guardado' ? 'bg-[var(--text-sec)]' : 'bg-[var(--accent)] animate-pulse'}`}></div>
            <span className="text-xs font-medium text-[var(--text-sec)] uppercase tracking-wider w-20">{saveStatus}</span>
          </div>
          <button 
            onClick={() => persistData(formData)}
            className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors outline-none flex items-center gap-2 focus-ring"
          >
            <Save size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Guardar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)] mb-8 flex items-center gap-3 pb-2 border-b border-[var(--divider)] uppercase tracking-wider">
              Identificación del Proyecto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="md:col-span-2">
                <FormGroup label="Nombre del Programa / Proyecto">
                  <input 
                    type="text" 
                    value={formData.programName} 
                    onChange={(e) => handleChange('programName', e.target.value)} 
                    className="w-full bg-transparent border-b-2 border-[var(--divider)] text-[var(--text-main)] text-3xl font-medium px-0 py-3 outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-sec)] focus-ring"
                    placeholder="Título del proyecto..."
                  />
                </FormGroup>
              </div>

              <FormGroup label="Duración Prevista" description="Se usará para calcular la desviación real.">
                <Input type="text" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="Ej. 30:00 o 01:30:00" />
              </FormGroup>

              <FormGroup label="Fecha de Emisión">
                <Input type="date" value={formData.broadcastDate} onChange={(e) => handleChange('broadcastDate', e.target.value)} className="cursor-pointer" />
              </FormGroup>

              <FormGroup label="Formato">
                <div className="relative" ref={formatDropdownRef}>
                  <Input type="text" value={formData.format} onChange={(e) => handleChange('format', e.target.value)} onFocus={() => setShowFormatDropdown(true)} placeholder="Selecciona o escribe..." />
                  {showFormatDropdown && (
                    <div className="absolute z-10 w-full mt-2 border border-[var(--divider)] bg-[var(--bg-surface)] rounded shadow-sm max-h-48 overflow-y-auto overflow-hidden">
                      {filteredFormats.map((fmt, idx) => (
                        <button key={idx} type="button" className="w-full text-left px-4 py-3 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] transition-colors outline-none focus-ring border-b border-[var(--divider)] last:border-0"
                          onClick={() => { handleChange('format', fmt); setShowFormatDropdown(false); }}>
                          {fmt}
                        </button>
                      ))}
                      {formData.format && !formatOptions.some(f => f.toLowerCase() === formData.format.toLowerCase()) && (
                        <div className="px-4 py-3 text-xs text-[var(--text-main)] bg-[var(--accent-soft)] font-medium">
                          Nuevo formato: "{formData.format}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Número de Programa">
                <Input type="text" value={formData.programNumber} onChange={(e) => handleChange('programNumber', e.target.value)} placeholder="Ej. 01, 04" />
              </FormGroup>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)] mb-8 flex items-center gap-3 pb-2 border-b border-[var(--divider)] uppercase tracking-wider">
               Equipo de Producción
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <FormGroup label="Dirección">
                <Input type="text" value={formData.director} onChange={(e) => handleChange('director', e.target.value)} placeholder="Nombre del director..." />
              </FormGroup>

              <FormGroup label="Productor">
                <Input type="text" value={formData.producer} onChange={(e) => handleChange('producer', e.target.value)} placeholder="Nombre del productor..." />
              </FormGroup>

              <div className="md:col-span-2">
                <FormGroup label="Locutores / Reparto" description="Escribe nombres reales. Los nombres de ficción se configuran en Personas.">
                  <div className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-3 focus-within:border-[var(--accent)] transition-colors">
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                      {formData.announcers.length === 0 && <span className="text-sm text-[var(--text-sec)]">Añade participantes...</span>}
                      {formData.announcers.map(announcer => (
                        <span key={announcer} className="px-3 py-1 text-xs font-medium rounded bg-[var(--accent-soft)] text-[var(--text-main)] flex items-center gap-2">
                          {announcer}
                          <button onClick={() => handleRemoveLocutor(announcer)} className="text-[var(--text-sec)] hover:text-[var(--text-main)] focus:outline-none"><X size={12} strokeWidth={2} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-[var(--divider)]">
                      <input 
                        type="text" id="new-locutor-input"
                        className="flex-1 bg-transparent text-sm px-1 py-1 outline-none placeholder-[var(--text-sec)] text-[var(--text-main)]"
                        placeholder="Nombre real y presiona Enter..."
                        onInput={(e) => { e.target.value = capitalizeName(e.target.value); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); handleAddLocutor(e.target.value); e.target.value = ''; }
                        }}
                      />
                      <button type="button" onClick={() => { const input = document.getElementById('new-locutor-input'); handleAddLocutor(input.value); input.value = ''; }}
                        className="text-[var(--text-main)] text-[10px] font-semibold uppercase tracking-wider hover:text-[var(--accent)] transition-colors outline-none focus-ring px-2">
                        Añadir
                      </button>
                    </div>
                  </div>
                </FormGroup>
              </div>

              <FormGroup label="Operador (Control Técnico)" description="Se asignará automáticamente al rol CONTROL.">
                <Input type="text" value={formData.operator} onChange={(e) => handleChange('operator', e.target.value)} onBlur={handleOperadorBlur} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleOperadorBlur(); } }} placeholder="Nombre de quien opera..." />
              </FormGroup>
              
              <FormGroup label="Productora / Institución">
                <Input type="text" value={formData.productionCompany} onChange={(e) => handleChange('productionCompany', e.target.value)} placeholder="Nombre de la casa realizadora..." />
              </FormGroup>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)] mb-8 flex items-center gap-3 pb-2 border-b border-[var(--divider)] uppercase tracking-wider">
               Metadatos
            </h3>
            <FormGroup label="Motivo / Finalidad" optional={true}>
              <textarea 
                value={formData.motive} onChange={(e) => handleChange('motive', e.target.value)} 
                className="w-full bg-[var(--bg-surface)] border border-[var(--divider)] rounded text-[var(--text-main)] text-sm px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none h-24 placeholder-[var(--text-sec)] focus-ring custom-scrollbar"
                placeholder="Campaña, trabajo académico, etc."
              />
            </FormGroup>
          </section>

          <div className="pt-8 border-t border-[var(--divider)] flex justify-end pb-8">
            <button 
              onClick={onNext}
              className="bg-[var(--accent)] text-[var(--bg-surface)] px-8 py-3 rounded text-sm font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-3 focus-ring shadow-sm"
            >
              Continuar a {hideNarrativeTabs ? 'Guion Radiofónico' : 'Estructura Narrativa'} <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const AVAILABLE_ROLES = ['CONTROL', 'LOCUTOR', 'NARRADOR', 'ENTREVISTADO', 'PERSONAJE', 'OTRO'];

function PeopleManager({ project, updateProject }) {
  const [people, setPeople] = useState(project.people || []);

  const handleAddPerson = () => {
    const newPerson = { id: generateId(), realName: '', displayName: '', types: [] };
    const updated = [newPerson, ...people];
    setPeople(updated);
    updateProject({ ...project, people: updated, lastModified: new Date().toISOString() });
  };

  const handleUpdatePerson = (id, field, value) => {
    const updated = people.map(p => {
      if (p.id === id) {
        const obj = { ...p, [field]: value };
        if (field === 'realName' && !obj.types.includes('PERSONAJE')) {
           obj.displayName = value.trim() ? value.trim().split(' ')[0] : '';
        }
        return obj;
      }
      return p;
    });
    setPeople(updated);
    updateProject({ ...project, people: updated });
  };

  const handleToggleRole = (id, role) => {
    const updated = people.map(p => {
      if (p.id === id) {
        const newTypes = p.types.includes(role) ? p.types.filter(t => t !== role) : [...p.types, role];
        let newDisplayName = p.displayName;
        if (!newTypes.includes('PERSONAJE')) newDisplayName = p.realName.trim() ? p.realName.trim().split(' ')[0] : '';
        return { ...p, types: newTypes, displayName: newDisplayName };
      }
      return p;
    });
    setPeople(updated);
    updateProject({ ...project, people: updated });
  };

  const handleDeletePerson = (id) => {
    const updated = people.filter(p => p.id !== id);
    setPeople(updated);
    updateProject({ ...project, people: updated });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center shrink-0 border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20">
        <div>
          <h2 className="text-lg font-medium text-[var(--text-main)]">Catálogo de Personas</h2>
        </div>
        <button onClick={handleAddPerson} className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-2 focus-ring">
          <Plus size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Añadir Persona</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        {people.length === 0 ? (
          <div className="border border-[var(--divider)] rounded p-16 flex flex-col items-center justify-center bg-[var(--bg-surface)] max-w-2xl mx-auto">
            <span className="text-sm font-medium text-[var(--text-sec)] mb-6">Catálogo Vacío</span>
            <button onClick={handleAddPerson} className="text-sm font-medium text-[var(--text-main)] border-b border-[var(--text-main)] hover:text-[var(--accent)] hover:border-[var(--accent)] outline-none focus-ring transition-colors">
              Registrar primera persona
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-[var(--bg-surface)] border border-[var(--divider)] rounded overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 py-4 px-8 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-b border-[var(--divider)] bg-[var(--bg-main)]">
              <div className="col-span-4">Nombre Real</div>
              <div className="col-span-3">Visualización Guion</div>
              <div className="col-span-4">Roles Asignados</div>
              <div className="col-span-1 text-center"></div>
            </div>
            
            <div className="divide-y divide-[var(--divider)]">
              {people.map(person => (
                <PersonRow key={person.id} person={person} onUpdate={handleUpdatePerson} onToggleRole={handleToggleRole} onDelete={handleDeletePerson} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonRow({ person, onUpdate, onToggleRole, onDelete }) {
  const isCharacter = person.types.includes('PERSONAJE');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 hover:bg-[var(--accent-soft)] transition-colors items-stretch">
      <div className="col-span-1 lg:col-span-4 p-6 flex flex-col justify-center">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] lg:hidden mb-2">Nombre Real</label>
        <input 
          type="text" value={person.realName} onChange={(e) => onUpdate(person.id, 'realName', e.target.value)}
          className="w-full text-sm font-medium bg-transparent border-b border-transparent focus:border-[var(--accent)] outline-none py-1 text-[var(--text-main)] placeholder-[var(--text-sec)] focus-ring"
          placeholder="Nombre completo..."
        />
      </div>

      <div className="col-span-1 lg:col-span-3 p-6 flex flex-col justify-center border-t lg:border-t-0 border-[var(--divider)] lg:border-l">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] lg:hidden mb-2">Nombre en Guion</label>
        <input 
          type="text" value={person.displayName} onChange={(e) => isCharacter && onUpdate(person.id, 'displayName', e.target.value)} disabled={!isCharacter}
          className={`w-full text-sm outline-none px-0 py-1 transition-colors border-b focus-ring ${
            isCharacter 
              ? 'bg-transparent border-[var(--divider)] text-[var(--text-main)] focus:border-[var(--accent)] placeholder-[var(--text-sec)]' 
              : 'bg-transparent border-transparent text-[var(--text-sec)] cursor-not-allowed opacity-70'
          }`}
          placeholder={isCharacter ? "Nombre de ficción..." : "Automático"}
        />
      </div>

      <div className="col-span-1 lg:col-span-4 p-6 flex flex-col justify-center border-t lg:border-t-0 border-[var(--divider)] lg:border-l">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] lg:hidden mb-3">Roles</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROLES.map(role => (
            <button key={role} onClick={() => onToggleRole(person.id, role)}
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold transition-colors outline-none focus-ring ${
                person.types.includes(role) 
                  ? 'bg-[var(--accent)] text-[var(--bg-surface)]' 
                  : 'bg-[var(--bg-main)] border border-[var(--divider)] text-[var(--text-sec)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      
      <div className="col-span-1 lg:col-span-1 p-6 flex lg:justify-center items-center border-t lg:border-t-0 border-[var(--divider)] lg:border-l">
         <ConfirmButton icon={Trash2} onClick={() => onDelete(person.id)} className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--divider)]" />
      </div>
    </div>
  );
}

const MARKERS = ['', 'Incidente Desencadenante', 'Primer Puente / Nudo', 'Punto Intermedio', 'Segundo Puente / Nudo', 'Clímax', 'Resolución'];

function EstructuraManager({ project, updateProject, onNavigateToGuion }) {
  const [scenes, setScenes] = useState(project.scenes || []);

  const handleUpdate = (a1, a2, a3) => {
    const combined = [...a1, ...a2, ...a3];
    setScenes(combined);
    updateProject({ ...project, scenes: combined, lastModified: new Date().toISOString() });
  };

  const act1 = []; const act2 = []; const act3 = [];
  scenes.forEach((s, i) => {
    const sceneWithIndex = { ...s, absoluteIndex: i + 1 };
    if (s.act === 'ACTO II') act2.push(sceneWithIndex);
    else if (s.act === 'ACTO III') act3.push(sceneWithIndex);
    else act1.push(sceneWithIndex);
  });

  const handleAddScene = (actName = 'ACTO I') => {
    const newScene = { id: generateId(), intExt: 'INT.', location: '', timeOfDay: 'DÍA', scenario: '', characters: [], dialogues: '', actions: '', act: actName, marker: '', synopsis: '' };
    let a1 = [...act1], a2 = [...act2], a3 = [...act3];
    if (actName === 'ACTO I') a1.push(newScene); else if (actName === 'ACTO II') a2.push(newScene); else a3.push(newScene);
    handleUpdate(a1, a2, a3);
  };

  const handleUpdateScene = (id, field, value) => {
    const newScenes = scenes.map(s => s.id === id ? { ...s, [field]: value } : s);
    setScenes(newScenes);
    updateProject({ ...project, scenes: newScenes, lastModified: new Date().toISOString() });
  };

  const handleDeleteScene = (id) => {
    const updated = scenes.filter(s => s.id !== id);
    setScenes(updated);
    updateProject({ ...project, scenes: updated, interventions: (project.interventions || []).filter(i => i.sceneId !== id), lastModified: new Date().toISOString() });
  };

  const handleDragStart = (e, sceneId) => { e.dataTransfer.setData('text/plain', sceneId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, targetAct, targetSceneId = null) => {
    e.preventDefault(); e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetSceneId) return;
    const draggedScene = scenes.find(s => s.id === draggedId);
    if (!draggedScene) return;

    let a1 = act1.filter(s => s.id !== draggedId); let a2 = act2.filter(s => s.id !== draggedId); let a3 = act3.filter(s => s.id !== draggedId);
    const updatedScene = { ...draggedScene, act: targetAct };
    let targetArray = targetAct === 'ACTO I' ? a1 : targetAct === 'ACTO II' ? a2 : a3;

    if (targetSceneId) {
      const insertIdx = targetArray.findIndex(s => s.id === targetSceneId);
      if (insertIdx !== -1) targetArray.splice(insertIdx, 0, updatedScene); else targetArray.push(updatedScene);
    } else targetArray.push(updatedScene);

    if (targetAct === 'ACTO I') handleUpdate(targetArray, a2, a3); else if (targetAct === 'ACTO II') handleUpdate(a1, targetArray, a3); else handleUpdate(a1, a2, targetArray);
  };

  const handleExport = async (format) => {
    if (format === 'txt' || format === 'md') {
      const isMd = format === 'md';
      const content = [
        isMd ? `# ESTRUCTURA NARRATIVA: ${project.general.programName || 'Proyecto'}` : `ESTRUCTURA NARRATIVA: ${project.general.programName || 'Proyecto'}`,
        `==================================================\n`,
        isMd ? `## ACTO I: PLANTEAMIENTO` : `ACTO I: PLANTEAMIENTO`,
        ...act1.map(s => isMd ? `- **ESC ${String(s.absoluteIndex).padStart(2, '0')}:** ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `*(Marcador: ${s.marker})*` : ''}` : `ESC ${String(s.absoluteIndex).padStart(2, '0')}: ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `[${s.marker}]` : ''}`),
        `\n`,
        isMd ? `## ACTO II: CONFRONTACIÓN` : `ACTO II: CONFRONTACIÓN`,
        ...act2.map(s => isMd ? `- **ESC ${String(s.absoluteIndex).padStart(2, '0')}:** ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `*(Marcador: ${s.marker})*` : ''}` : `ESC ${String(s.absoluteIndex).padStart(2, '0')}: ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `[${s.marker}]` : ''}`),
        `\n`,
        isMd ? `## ACTO III: RESOLUCIÓN` : `ACTO III: RESOLUCIÓN`,
        ...act3.map(s => isMd ? `- **ESC ${String(s.absoluteIndex).padStart(2, '0')}:** ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `*(Marcador: ${s.marker})*` : ''}` : `ESC ${String(s.absoluteIndex).padStart(2, '0')}: ${s.intExt} ${s.location || 'SIN LUGAR'} ${s.marker ? `[${s.marker}]` : ''}`)
      ].join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Estructura_${project.general.programName || 'Proyecto'}.${format}`; a.click();
    } else if (format === 'pdf') {
       try {
           const element = document.getElementById('estructura-export-container');
           if (!element) return;
           const originalStyles = [];
           const columns = element.querySelectorAll('.flex-1');
           columns.forEach(col => { originalStyles.push({el: col, overflow: col.style.overflow, maxHeight: col.style.maxHeight}); col.style.overflow = 'visible'; col.style.maxHeight = 'none'; });
           
           const html2pdf = await loadHtml2Pdf();
           await html2pdf().set({ margin: 0.5, filename: `Estructura_${project.general.programName || 'Proyecto'}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } }).from(element).save();
           
           columns.forEach((data) => { data.el.style.overflow = data.overflow; data.el.style.maxHeight = data.maxHeight; });
       } catch (err) { console.error("Error en exportación PDF:", err); }
    } else if (format === 'jpg' || format === 'png') {
       try {
           const element = document.getElementById('estructura-export-container');
           if (!element) return;
           const clone = element.cloneNode(true);
           const wrapper = document.createElement('div');
           wrapper.style.position = 'absolute'; wrapper.style.top = '-9999px'; wrapper.style.left = '-9999px'; wrapper.style.width = '1600px'; wrapper.style.backgroundColor = 'var(--bg-main)'; wrapper.style.padding = '40px'; wrapper.style.display = 'flex'; wrapper.style.gap = '24px';
           
           clone.style.display = 'flex'; clone.style.width = '100%'; clone.style.gap = '24px';
           clone.querySelectorAll('.flex-1').forEach(col => { col.style.overflow = 'visible'; col.style.maxHeight = 'none'; col.style.height = 'auto'; });
           clone.querySelectorAll('.print\\:hidden').forEach(el => el.style.display = 'none');
           
           wrapper.appendChild(clone); document.body.appendChild(wrapper);
           await new Promise(r => setTimeout(r, 200));
           
           const html2canvas = await loadHtml2Canvas();
           const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: null });
           document.body.removeChild(wrapper);
           
           const a = document.createElement('a'); a.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`); a.download = `Estructura_${project.general.programName || 'Proyecto'}.${format}`; a.click();
       } catch (err) { console.error("Error en exportación Imagen:", err); }
    }
  };

  const total = scenes.length || 1; 
  const pct1 = Math.round((act1.length / total) * 100) || 0;
  const pct2 = Math.round((act2.length / total) * 100) || 0;
  const pct3 = Math.round((act3.length / total) * 100) || 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex items-center justify-between border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20 shrink-0 print:hidden">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-[var(--text-main)]">Estructura Narrativa</h2>
        </div>
        
        <div className="flex-1 px-8 hidden lg:block opacity-90">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold mb-1">
            <span className="text-[#2c4c7c]">Acto I (25%)</span><span className="text-center text-[#a33b3b]">Acto II (50%)</span><span className="text-right text-[#366b46]">Acto III (25%)</span>
          </div>
          <div className="h-1.5 flex overflow-hidden bg-[var(--divider)] relative rounded-full">
            <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[var(--bg-surface)] z-10"></div>
            <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[var(--bg-surface)] z-10"></div>
            <div className="bg-[#2c4c7c] h-full transition-all duration-300" style={{width: `${pct1}%`}} title="Planteamiento"></div>
            <div className="bg-[#a33b3b] h-full transition-all duration-300" style={{width: `${pct2}%`}} title="Confrontación"></div>
            <div className="bg-[#366b46] h-full transition-all duration-300" style={{width: `${pct3}%`}} title="Resolución"></div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-end">
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 print:p-0 custom-scrollbar">
        <div id="estructura-export-container" className="flex gap-8 h-full min-w-[900px] print:minw-0 print:h-auto items-stretch">
          <ActColumn title="Planteamiento" actId="ACTO I" scenes={act1} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} onUpdateScene={handleUpdateScene} onAddScene={handleAddScene} onDeleteScene={handleDeleteScene} onNavigateToGuion={onNavigateToGuion} />
          <ActColumn title="Confrontación" actId="ACTO II" scenes={act2} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} onUpdateScene={handleUpdateScene} onAddScene={handleAddScene} onDeleteScene={handleDeleteScene} onNavigateToGuion={onNavigateToGuion} />
          <ActColumn title="Resolución" actId="ACTO III" scenes={act3} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} onUpdateScene={handleUpdateScene} onAddScene={handleAddScene} onDeleteScene={handleDeleteScene} onNavigateToGuion={onNavigateToGuion} />
        </div>
      </div>
    </div>
  );
}

function ActColumn({ title, actId, scenes, onDragStart, onDragOver, onDrop, onUpdateScene, onAddScene, onDeleteScene, onNavigateToGuion }) {
  return (
    <div className="flex-1 bg-transparent flex flex-col overflow-hidden print:break-inside-avoid" onDragOver={onDragOver} onDrop={(e) => onDrop(e, actId)}>
      <div className="px-0 py-3 flex justify-between items-end border-b border-[var(--text-sec)] mb-6">
        <div>
          <h3 className="font-semibold text-sm text-[var(--text-main)] uppercase tracking-wider">{title}</h3>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] block mt-1">{scenes.length} Escenas</span>
        </div>
        <button onClick={() => onAddScene(actId)} className="text-[var(--text-sec)] hover:text-[var(--accent)] transition-colors outline-none focus-ring print:hidden" title="Añadir Escena"><Plus size={16} strokeWidth={2} className="shrink-0" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 print:overflow-visible custom-scrollbar pb-8 px-1">
        {scenes.length === 0 ? (
          <div className="text-center p-8 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border border-dashed border-[var(--divider)] rounded print:hidden">Arrastrar o Añadir</div>
        ) : (
          scenes.map((scene) => (
            <StructureSceneCard key={scene.id} scene={scene} onDragStart={(e) => onDragStart(e, scene.id)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, actId, scene.id)} onUpdateScene={onUpdateScene} onDelete={() => onDeleteScene(scene.id)} onNavigateToGuion={() => onNavigateToGuion(scene.id)} />
          ))
        )}
        <button onClick={() => onAddScene(actId)} className="w-full py-3 border border-dashed border-[var(--divider)] rounded text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] hover:text-[var(--text-main)] hover:border-[var(--text-main)] hover:bg-[var(--accent-soft)] transition-colors flex justify-center items-center gap-2 print:hidden outline-none focus-ring">
          <Plus size={14} strokeWidth={2} className="shrink-0" /> Añadir
        </button>
      </div>
    </div>
  );
}

function StructureSceneCard({ scene, onDragStart, onDragOver, onDrop, onUpdateScene, onDelete, onNavigateToGuion }) {
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-4 cursor-grab active:cursor-grabbing group transition-colors hover:border-[var(--accent)] print:break-inside-avoid relative shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider">ESC. {String(scene.absoluteIndex).padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
             <select value={scene.intExt} onChange={(e)=>onUpdateScene(scene.id, 'intExt', e.target.value)} className="bg-transparent text-xs font-bold outline-none cursor-pointer text-[var(--text-main)] border-b border-transparent focus:border-[var(--accent)] print:appearance-none focus-ring">
                <option value="INT.">INT.</option><option value="EXT.">EXT.</option><option value="INT/EXT.">INT/EXT.</option>
             </select>
             <span className="text-[var(--text-sec)]">—</span>
             <input type="text" value={scene.location} onChange={(e)=>onUpdateScene(scene.id, 'location', e.target.value.toUpperCase())} className="bg-transparent text-xs font-bold outline-none flex-1 w-full text-[var(--text-main)] border-b border-transparent focus:border-[var(--accent)] placeholder-[var(--text-sec)] focus-ring" placeholder="LUGAR..." />
             <span className="text-[var(--text-sec)]">—</span>
             <input type="text" value={scene.timeOfDay} onChange={(e)=>onUpdateScene(scene.id, 'timeOfDay', e.target.value.toUpperCase())} className="bg-transparent text-xs font-bold outline-none w-16 text-[var(--text-main)] border-b border-transparent focus:border-[var(--accent)] placeholder-[var(--text-sec)] focus-ring" placeholder="DÍA/NOCHE" />
          </div>
          <textarea value={scene.synopsis || ''} onChange={(e)=>onUpdateScene(scene.id, 'synopsis', e.target.value)} placeholder="Descripción / Apunte base..." className="w-full text-xs bg-transparent resize-none outline-none text-[var(--text-sec)] focus:text-[var(--text-main)] border-b border-transparent focus:border-[var(--accent)] transition-colors mt-2 custom-scrollbar focus-ring" rows={2} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
        </div>
        <div className="flex gap-1 items-start opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity print:hidden shrink-0">
           <button onClick={onNavigateToGuion} className="p-1 text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--divider)] rounded outline-none focus-ring" title="Escribir Guion"><Type size={14} strokeWidth={2} /></button>
           <ConfirmButton icon={Trash2} onClick={onDelete} className="text-[var(--text-sec)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--divider)]" />
           <div className="p-1 cursor-grab text-[var(--text-sec)] hover:text-[var(--text-main)]"><GripVertical size={14} /></div>
        </div>
      </div>
      
      <div className="pt-3 border-t border-[var(--divider)]">
        <select value={scene.marker || ''} onChange={(e) => onUpdateScene(scene.id, 'marker', e.target.value)} className="w-full text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] bg-transparent outline-none cursor-pointer hover:text-[var(--text-main)] focus:text-[var(--text-main)] print:appearance-none print:p-0 focus-ring">
          {MARKERS.map(m => <option key={m} value={m}>{m === '' ? 'Añadir marcador...' : m}</option>)}
        </select>
      </div>
    </div>
  );
}

function EscaletaManager({ project, updateProject, onNavigateToGuion }) {
  const [scenes, setScenes] = useState(project.scenes || []);
  const [exportMode, setExportMode] = useState(null);
  const [selectedForExport, setSelectedForExport] = useState([]);

  useEffect(() => setScenes(project.scenes || []), [project.scenes]);

  const updateAndSave = (newScenes) => {
    setScenes(newScenes);
    updateProject({ ...project, scenes: newScenes, lastModified: new Date().toISOString() });
  };

  const handleUpdateScene = (id, field, value) => updateAndSave(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleDragStart = (e, index) => { e.dataTransfer.setData('sourceIndex', index.toString()); e.dataTransfer.effectAllowed = 'move'; };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault(); const sourceIndexStr = e.dataTransfer.getData('sourceIndex'); if (!sourceIndexStr) return;
    const sourceIndex = parseInt(sourceIndexStr, 10); if (sourceIndex === targetIndex) return;
    const updated = [...scenes]; const [movedScene] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedScene); updateAndSave(updated);
  };

  const handleAddResource = (name, type) => {
     if (type === 'effect') {
        const newFx = { id: generateId(), name: name, category: 'ANTHROPOPHONY', description: '' };
        updateProject({...project, soundEffects: [...(project.soundEffects||[]), newFx], lastModified: new Date().toISOString()});
     } else {
        const newM = { id: generateId(), name: name, description: '' };
        updateProject({...project, music: [...(project.music||[]), newM], lastModified: new Date().toISOString()});
     }
  };

  const handleExport = async (format) => {
    if (format === 'png' || format === 'jpg') { setExportMode(format); setSelectedForExport(scenes.map(s => s.id)); return; }
    
    if (format === 'txt' || format === 'md') {
      const isMd = format === 'md';
      let header = isMd ? `# PROYECTO: ${project.general.programName || 'SIN TÍTULO'}\n` : `PROYECTO: ${project.general.programName || 'SIN TÍTULO'}\n`;
      header += isMd ? `**Director:** ${project.general.director || '-'}\n` : `DIRECTOR: ${project.general.director || '-'}\n`;
      header += isMd ? `**Productor:** ${project.general.producer || '-'}\n\n` : `PRODUCTOR: ${project.general.producer || '-'}\n\n`;
      header += isMd ? `## ESCALETA\n---\n\n` : `ESCALETA\n==================================================\n\n`;

      const content = scenes.map((s, i) => {
        if (isMd) {
          return `### ESCENA ${String(i + 1).padStart(2, '0')}\n**Lugar:** ${s.intExt} ${s.location} - ${s.timeOfDay}\n\n**ESCENARIO SONORO:**\n${s.scenario || '-'}\n\n**PERSONAJES:**\n${s.characters.join(', ') || '-'}\n\n**DIÁLOGOS:**\n${s.dialogues || '-'}\n\n**ACCIONES:**\n${s.actions || '-'}\n\n---\n`;
        } else {
          return `ESCENA ${String(i + 1).padStart(2, '0')}\n${s.intExt} ${s.location} - ${s.timeOfDay}\n\nESCENARIO SONORO:\n${s.scenario || '-'}\n\nPERSONAJES:\n${s.characters.join(', ') || '-'}\n\nDIÁLOGOS:\n${s.dialogues || '-'}\n\nACCIONES:\n${s.actions || '-'}\n--------------------------------------------------\n`;
        }
      }).join('\n');
      const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Escaleta_${project.general.programName || 'Proyecto'}.${format}`; a.click();
    } else if (format === 'doc') {
      let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Escaleta</title><style>body { font-family: Arial, sans-serif; background-color: #ffffff; color: #000000; } .scene { border: 1px solid #ccc; margin-bottom: 20px; border-radius: 8px; padding: 15px;} .header { font-weight: bold; font-size: 11pt; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px; } .card-grid { display: table; width: 100%; } .card-row { display: table-row; } .card-cell { display: table-cell; padding: 10px; width: 50%; vertical-align: top; } h4 { color: #666; margin-top: 0; margin-bottom: 5px; font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; }</style></head><body><h1>ESCALETA: ${project.general.programName || 'SIN TÍTULO'}</h1><p><strong>Director:</strong> ${project.general.director || '-'}<br><strong>Productor:</strong> ${project.general.producer || '-'}</p>`;
      scenes.forEach((s, i) => { 
          html += `<div class="scene"><div class="header">ESCENA ${String(i + 1).padStart(2, '0')} - ${s.intExt} ${s.location} - ${s.timeOfDay}</div><div class="card-grid"><div class="card-row"><div class="card-cell"><h4>Escenario Sonoro</h4><p>${s.scenario || '-'}</p></div><div class="card-cell"><h4>Personajes</h4><p>${s.characters.join(', ') || '-'}</p></div></div><div class="card-row"><div class="card-cell"><h4>Diálogos</h4><p>${s.dialogues || '-'}</p></div><div class="card-cell"><h4>Acciones</h4><p>${s.actions || '-'}</p></div></div></div></div>`; 
      });
      html += `</body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Escaleta_${project.general.programName || 'Proyecto'}.doc`; a.click();
    } else if (format === 'pdf') {
      try {
          const html2pdf = await loadHtml2Pdf(); const element = document.createElement('div');
          let html = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: white; color: black;"><h2>ESCALETA: ${project.general.programName || 'SIN TÍTULO'}</h2><p style="margin-bottom: 30px; font-size: 12px; color: #555;">Director: ${project.general.director || '-'}<br>Productor: ${project.general.producer || '-'}</p>`;
          scenes.forEach((s, i) => { 
              html += `<div style="border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid;"><div style="padding: 10px 15px; font-weight: bold; font-size: 12px; border-bottom: 1px solid #ddd; background-color: #f9f9f9;">ESCENA ${String(i + 1).padStart(2, '0')} - ${s.intExt} ${s.location} - ${s.timeOfDay}</div><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 15px; width: 50%; vertical-align: top;"><div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Escenario Sonoro</div><div style="font-size: 12px;">${s.scenario || '-'}</div></td><td style="padding: 15px; width: 50%; vertical-align: top;"><div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Personajes</div><div style="font-size: 12px;">${s.characters.join(', ') || '-'}</div></td></tr><tr><td style="padding: 15px; width: 50%; vertical-align: top; border-top: 1px solid #eee;"><div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Diálogos</div><div style="font-size: 12px;">${s.dialogues || '-'}</div></td><td style="padding: 15px; width: 50%; vertical-align: top; border-top: 1px solid #eee;"><div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Acciones</div><div style="font-size: 12px;">${s.actions || '-'}</div></td></tr></table></div>`; 
          });
          html += `</div>`; element.innerHTML = html;
          await html2pdf().set({ margin: 0.5, filename: `Escaleta_${project.general.programName || 'Proyecto'}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(element).save();
      } catch (err) { console.error("Error PDF", err); }
    }
  };

  const executeImageExport = async () => {
    try {
      const html2canvas = await loadHtml2Canvas();
      for (const sceneId of selectedForExport) {
        const element = document.getElementById(`escaleta-card-${sceneId}`); if (!element) continue;
        const clone = element.cloneNode(true); 
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute'; wrapper.style.top = '-9999px'; wrapper.style.left = '-9999px'; wrapper.style.width = '1000px'; wrapper.style.backgroundColor = 'var(--bg-main)'; wrapper.style.padding = '40px';
        
        clone.querySelectorAll('.overflow-y-auto, .overflow-hidden').forEach(el => { el.style.overflow = 'visible'; el.style.height = 'auto'; el.style.maxHeight = 'none'; });
        clone.querySelectorAll('.print\\:hidden').forEach(el => el.style.display = 'none');
        
        wrapper.appendChild(clone); document.body.appendChild(wrapper);
        await new Promise(r => setTimeout(r, 200));
        
        const canvas = await html2canvas(wrapper, { backgroundColor: null, scale: 2 });
        document.body.removeChild(wrapper);
        
        const a = document.createElement('a'); a.href = canvas.toDataURL(`image/${exportMode === 'jpg' ? 'jpeg' : 'png'}`);
        const sceneIndex = scenes.findIndex(s => s.id === sceneId) + 1;
        a.download = `Escena_${String(sceneIndex).padStart(2, '0')}_${project.general.programName || 'Proyecto'}.${exportMode}`; a.click();
        await new Promise(r => setTimeout(r, 300));
      }
    } catch(e) { console.error(e); }
    setExportMode(null);
  };

  return (
    <div className="flex flex-col h-full relative bg-[var(--bg-main)]">
      {exportMode && (
        <div className="absolute top-0 left-0 right-0 bg-[var(--accent)] text-[var(--bg-surface)] p-4 flex justify-between items-center z-50 shadow-sm mx-8 mt-4 rounded">
          <div><span className="font-medium text-sm">Exportar Imágenes ({exportMode.toUpperCase()})</span><span className="ml-4 text-xs opacity-80">{selectedForExport.length} seleccionadas</span></div>
          <div className="flex gap-4">
            <button onClick={() => setExportMode(null)} className="px-4 py-2 bg-transparent text-[var(--bg-surface)] text-sm font-medium hover:opacity-80 outline-none focus-ring">Cancelar</button>
            <button onClick={executeImageExport} disabled={selectedForExport.length === 0} className="px-4 py-2 bg-[var(--bg-surface)] text-[var(--accent)] rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 outline-none focus-ring">Descargar</button>
          </div>
        </div>
      )}

      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20 shrink-0 print:hidden">
        <div><h2 className="text-lg font-medium text-[var(--text-main)]">Escaleta</h2></div>
        <div className="flex gap-4 print:hidden">
          <button onClick={() => {
              const newScene = { id: generateId(), intExt: 'INT.', location: '', timeOfDay: 'DÍA', scenario: '', characters: [], dialogues: '', actions: '', act: 'ACTO I', marker: '', synopsis: '' };
              updateAndSave([...scenes, newScene]);
          }} className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-2 focus-ring">
              <Plus size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Añadir Escena</span>
          </button>
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12 print:p-0 print:bg-white custom-scrollbar" id="escaleta-export-container">
        {scenes.length === 0 ? (
          <div className="border border-[var(--divider)] rounded p-16 flex flex-col items-center justify-center bg-[var(--bg-surface)] max-w-2xl mx-auto">
             <span className="text-sm font-medium text-[var(--text-sec)] mb-4">Archivo Vacío</span>
             <p className="text-xs text-[var(--text-sec)] text-center max-w-sm">Planifica tus escenas desde la Estructura o añade la primera tarjeta aquí.</p>
          </div>
        ) : (
          scenes.map((scene, index) => (
            <div key={scene.id} id={`escaleta-card-${scene.id}`} className="print-break-inside-avoid relative group">
              {exportMode && (
                <div className="absolute -left-8 top-6 z-20 print:hidden">
                  <input type="checkbox" checked={selectedForExport.includes(scene.id)} onChange={(e) => { if(e.target.checked) setSelectedForExport([...selectedForExport, scene.id]); else setSelectedForExport(selectedForExport.filter(id => id !== scene.id)); }} className="w-4 h-4 accent-[var(--accent)] cursor-pointer outline-none focus-ring" />
                </div>
              )}
              <SceneCard scene={scene} index={index} project={project} onUpdate={handleUpdateScene} onAddResource={handleAddResource} onDelete={() => {
                  const updated = scenes.filter(s => s.id !== scene.id);
                  setScenes(updated);
                  updateProject({ ...project, scenes: updated, interventions: (project.interventions || []).filter(i => i.sceneId !== scene.id), lastModified: new Date().toISOString() });
              }} onNavigateToGuion={() => onNavigateToGuion(scene.id)} onDragStart={(e) => handleDragStart(e, index)} onDrop={(e) => handleDrop(e, index)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SceneCard({ scene, index, project, onUpdate, onDelete, onNavigateToGuion, onDragStart, onDrop, onAddResource }) {
  const toggleCharacter = (charName) => {
    const current = scene.characters || [];
    if (current.includes(charName)) onUpdate(scene.id, 'characters', current.filter(c => c !== charName));
    else onUpdate(scene.id, 'characters', [...current, charName]);
  };

  const projectPeople = project?.people || [];
  
  // Sound Discovery Logic
  const existingFx = (project?.soundEffects || []).map(e => (e.name||'').trim().toLowerCase());
  const existingMusic = (project?.music || []).map(m => (m.name||'').trim().toLowerCase());
  const allExisting = new Set([...existingFx, ...existingMusic]);
  const scenarioLines = (scene.scenario || '').split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const newSounds = scenarioLines.filter(l => !allExisting.has(l.toLowerCase()));

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded max-w-5xl mx-auto print:mb-8 print:border-none group overflow-hidden shadow-sm">
      
      <div 
        draggable onDragStart={onDragStart} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} onDrop={onDrop}
        className="px-8 py-5 flex flex-wrap items-center gap-4 cursor-grab active:cursor-grabbing border-b border-[var(--divider)] bg-[var(--bg-main)]"
      >
        <div className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-main)] shrink-0 pr-4 border-r border-[var(--divider)]">
          ESC. {String(index + 1).padStart(2, '0')}
        </div>
        <select value={scene.intExt} onChange={(e) => onUpdate(scene.id, 'intExt', e.target.value)} className="bg-transparent font-medium text-sm outline-none cursor-pointer text-[var(--text-sec)] hover:text-[var(--text-main)] print:appearance-none focus-ring">
          <option value="INT.">INT.</option><option value="EXT.">EXT.</option><option value="INT/EXT.">INT/EXT.</option>
        </select>
        <span className="text-[var(--text-sec)] hidden sm:inline print:text-black">—</span>
        <input type="text" value={scene.location} onChange={(e) => onUpdate(scene.id, 'location', e.target.value.toUpperCase())} placeholder="LUGAR..." className="bg-transparent font-medium outline-none flex-1 min-w-[120px] text-sm text-[var(--text-main)] placeholder-[var(--text-sec)] transition-colors px-1 border-b border-transparent focus:border-[var(--accent)] focus-ring" />
        <span className="text-[var(--text-sec)] hidden sm:inline print:text-black">—</span>
        <input type="text" value={scene.timeOfDay} onChange={(e) => onUpdate(scene.id, 'timeOfDay', e.target.value.toUpperCase())} placeholder="DÍA/NOCHE" className="bg-transparent font-medium outline-none shrink-0 w-24 sm:w-32 text-sm text-[var(--text-main)] placeholder-[var(--text-sec)] transition-colors px-1 border-b border-transparent focus:border-[var(--accent)] focus-ring" />
        <div className="flex items-center gap-3 ml-auto shrink-0 print:hidden opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
          <button onClick={onNavigateToGuion} className="bg-[var(--text-main)] text-[var(--bg-surface)] px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-semibold hover:opacity-90 outline-none focus-ring">GUION</button>
          <ConfirmButton icon={Trash2} onClick={onDelete} className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--divider)] p-1.5" />
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 flex flex-col gap-10">
          <div>
            <h4 className="text-[10px] font-semibold text-[var(--text-sec)] tracking-wider uppercase mb-3">Escenario Sonoro</h4>
            <textarea value={scene.scenario} onChange={(e) => onUpdate(scene.id, 'scenario', e.target.value)} className="w-full h-24 bg-transparent resize-none outline-none text-sm text-[var(--text-main)] placeholder-[var(--text-sec)] custom-scrollbar focus-ring border-b border-transparent focus:border-[var(--accent)]" placeholder="Describe los sonidos ambientales en líneas separadas..." />
            
            {newSounds.length > 0 && (
              <div className="mt-4 p-3 bg-[var(--accent-soft)] border border-[var(--accent)] rounded animate-in fade-in duration-300 print:hidden">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-main)] mb-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span></span>
                  Nuevos Sonidos Detectados
                </div>
                <div className="flex flex-col gap-2">
                  {newSounds.map((sound, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-surface)] p-2 rounded border border-[var(--divider)]">
                      <span className="text-xs font-medium text-[var(--text-main)] truncate" title={sound}>"{sound}"</span>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => onAddResource(sound, 'effect')} className="text-[10px] uppercase tracking-wider font-semibold bg-[var(--bg-main)] border border-[var(--divider)] hover:border-[var(--accent)] text-[var(--text-sec)] hover:text-[var(--text-main)] px-2 py-1 rounded transition-colors outline-none focus-ring">+ Efecto</button>
                        <button onClick={() => onAddResource(sound, 'music')} className="text-[10px] uppercase tracking-wider font-semibold bg-[var(--bg-main)] border border-[var(--divider)] hover:border-[var(--accent)] text-[var(--text-sec)] hover:text-[var(--text-main)] px-2 py-1 rounded transition-colors outline-none focus-ring">+ Música</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-[var(--text-sec)] tracking-wider uppercase mb-3">Personajes</h4>
            <div className="flex flex-wrap gap-2">
                {projectPeople.length === 0 && <span className="text-sm text-[var(--text-sec)]">No hay personas registradas.</span>}
                {projectPeople.map(p => {
                  const name = p.displayName || p.realName.split(' ')[0] || 'Desconocido';
                  const isSelected = (scene.characters || []).includes(name);
                  return (
                    <button key={p.id} onClick={() => toggleCharacter(name)} className={`text-xs px-2 py-1 rounded font-medium transition-colors outline-none print:hidden focus-ring ${isSelected ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-[var(--bg-main)] border border-[var(--divider)] text-[var(--text-sec)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'}`}>{name}</button>
                  );
                })}
             </div>
             <div className="hidden print:block text-sm text-black">{(scene.characters || []).join(', ')}</div>
          </div>
        </div>
        <div className="md:col-span-7 flex flex-col gap-10 md:border-l md:border-[var(--divider)] md:pl-10">
          <div className="flex-1">
            <h4 className="text-[10px] font-semibold text-[var(--text-sec)] tracking-wider uppercase mb-3">Diálogos</h4>
            <textarea value={scene.dialogues} onChange={(e) => onUpdate(scene.id, 'dialogues', e.target.value)} className="w-full h-24 bg-transparent resize-none outline-none text-sm text-[var(--text-main)] placeholder-[var(--text-sec)] custom-scrollbar focus-ring border-b border-transparent focus:border-[var(--accent)]" placeholder="Temas de conversación o referencias..." />
          </div>
          <div className="flex-1 pt-6 border-t border-[var(--divider)]">
            <h4 className="text-[10px] font-semibold text-[var(--text-sec)] tracking-wider uppercase mb-3">Acciones</h4>
            <textarea value={scene.actions} onChange={(e) => onUpdate(scene.id, 'actions', e.target.value)} className="w-full h-24 bg-transparent resize-none outline-none text-sm text-[var(--text-main)] placeholder-[var(--text-sec)] custom-scrollbar focus-ring border-b border-transparent focus:border-[var(--accent)]" placeholder="Movimientos físicos y sucesos..." />
          </div>
        </div>
      </div>
      
      <div className="px-8 py-3 flex justify-between items-center text-[10px] font-semibold text-[var(--text-sec)] border-t border-[var(--divider)] print:border-none bg-[var(--bg-main)]">
        <span className="uppercase tracking-wider">{scene.act || 'ACTO I'}</span>
        {scene.marker && <span className="text-[var(--accent)] italic">{scene.marker}</span>}
      </div>
    </div>
  );
}

function formatTA(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}"`;
  const m = Math.floor(totalSeconds / 60); const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`;
}
function parsePlannedDuration(str) {
  if (!str) return 0; const matches = str.match(/\d+/g); if (!matches) return 0; const nums = matches.map(Number);
  if (nums.length === 1) return nums[0] * 60; if (nums.length === 2) return nums[0] * 60 + nums[1]; if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2]; return 0;
}
function estimateVisualLines(inv) {
  let text = inv.content || ''; let textLines = text.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil((line.length || 1) / 55)), 0); return Math.max(1, textLines);
}

function GuionResponsibleSelector({ value, onChange, projectPeople, onCreatePerson }) {
  const [focused, setFocused] = useState(false); const [searchTerm, setSearchTerm] = useState(value || '');
  useEffect(() => setSearchTerm(value || ''), [value]);

  const matchingPeople = projectPeople.filter(p => { const name = p.displayName || p.realName.split(' ')[0]; return name.toLowerCase().includes(searchTerm.toLowerCase()); });
  const exactMatch = matchingPeople.some(p => (p.displayName || p.realName.split(' ')[0]).toLowerCase() === searchTerm.toLowerCase());
  const showCreate = searchTerm.trim() !== '' && searchTerm.toUpperCase() !== 'CONTROL' && !exactMatch;

  return (
      <div className="relative w-full group font-courier">
          <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); onChange(e.target.value, false); }} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} className="w-full text-[13px] font-bold uppercase bg-transparent outline-none border-b border-transparent focus:border-gray-400 pb-1 text-black placeholder-gray-400 focus-ring" placeholder="RESPONSABLE..." />
          {focused && (
              <div className="absolute z-50 top-full left-0 w-48 bg-white border border-gray-300 mt-1 shadow-sm py-1 max-h-48 overflow-y-auto font-sans rounded">
                  <button type="button" onMouseDown={() => onChange('CONTROL', true)} className="w-full text-left px-3 py-2 text-xs font-bold text-white bg-[#242424] hover:bg-black border-b border-gray-200 outline-none focus-ring">CONTROL</button>
                  {matchingPeople.map(p => {
                      const name = p.displayName || p.realName.split(' ')[0];
                      return <button key={p.id} type="button" onMouseDown={() => onChange(name, true)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100 outline-none focus-ring">{name}</button>;
                  })}
                  {showCreate && <button type="button" onMouseDown={() => { onCreatePerson(searchTerm); onChange(searchTerm, true); }} className="w-full text-left px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-200 outline-none focus-ring">+ Crear "{searchTerm}"</button>}
              </div>
          )}
      </div>
  );
}

function InterventionRow({ intervention, onUpdate, onDelete, onMove, isFirst, isLast, projectPeople, onCreatePerson }) {
  const [localData, setLocalData] = useState(intervention); 
  const [slashPos, setSlashPos] = useState(null); 
  const textareaRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => { setLocalData(intervention); }, [intervention]);
  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; } }, [localData.content]);

  const handleChange = (field, value, isStructural = false) => {
      const updated = { ...localData, [field]: value }; 
      setLocalData(updated);
      
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      
      if (isStructural || ['tp'].includes(field)) {
          onUpdate(updated);
      } else {
          debounceTimerRef.current = setTimeout(() => { onUpdate(updated); }, 500);
      }
  };

  const handleResponsibleChange = (val, isSelection = false) => {
      let updates = { responsible: val }; 
      setLocalData(prev => ({...prev, ...updates}));
      
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      
      if (isSelection) {
          onUpdate({...localData, ...updates}); 
      } else {
          debounceTimerRef.current = setTimeout(() => onUpdate({...localData, ...updates}), 500);
      }
  };

  const handleTextChange = (e) => {
      const val = e.target.value; handleChange('content', val);
      const cursor = e.target.selectionStart; if (val.charAt(cursor - 1) === '/') setSlashPos(cursor - 1); else setSlashPos(null);
  };

  const insertTag = (tag, isAcotacion = false, isResource = false) => {
      if (slashPos === null) return; 
      const textarea = textareaRef.current; if (!textarea) return;
      const text = localData.content || ''; 
      const prefix = text.substring(0, slashPos); 
      const suffix = text.substring(slashPos + 1); 
      const newText = prefix + tag + suffix; 
      handleChange('content', newText); 
      setSlashPos(null);
      setTimeout(() => { 
          if (textareaRef.current) { 
              textareaRef.current.focus(); 
              let cursorOffset = tag.length;
              if (isAcotacion) cursorOffset = 1;
              if (isResource) cursorOffset = tag.indexOf('[') + 1; 
              const newCursorPos = prefix.length + cursorOffset; 
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos); 
          } 
      }, 0);
  };

  const isControl = localData.responsible?.trim().toUpperCase() === 'CONTROL';

  return (
      <div className="flex group/row bg-transparent hover:bg-gray-50 transition-colors relative font-courier text-black border-b border-gray-200 items-stretch min-h-[48px] page-break-inside-avoid">
          <div className="w-12 shrink-0 py-3 flex flex-col items-center justify-start text-[13px] text-gray-400">
              {Array.from({length: intervention.lines}).map((_, i) => <span key={i} className={i === 0 ? 'text-black font-bold' : ''}>{intervention.startLine + i}</span>)}
          </div>
          <div className="w-48 px-4 py-3 shrink-0 relative flex items-start text-black font-bold">
              <GuionResponsibleSelector value={localData.responsible} onChange={handleResponsibleChange} projectPeople={projectPeople} onCreatePerson={onCreatePerson} />
              <span className="absolute right-4 top-3 font-bold text-black">:</span>
          </div>
          <div className="flex-1 px-5 py-3 relative flex flex-col justify-start">
              <div className="flex items-start gap-1 text-[13px] leading-relaxed relative w-full">
                  <textarea ref={textareaRef} value={localData.content || ''} onChange={handleTextChange} onBlur={() => setTimeout(() => setSlashPos(null), 200)} className={`flex-1 bg-transparent outline-none resize-none overflow-hidden placeholder-gray-300 w-full focus-ring border-b border-transparent focus:border-gray-200 ${isControl ? 'uppercase font-bold underline text-black' : 'text-black'}`} rows={1} placeholder={isControl ? 'INSTRUCCIONES TÉCNICAS...' : "Texto. Usa '/' para atajos..."} />
                  {slashPos !== null && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 text-black shadow-sm rounded p-1 z-50 flex flex-col w-56 font-sans">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase px-3 py-1 mb-1">Comandos de Audio</span>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('MÚSICA [] ', false, true); }} className="text-xs text-left px-3 py-2 hover:bg-gray-100 rounded outline-none focus-ring flex items-center gap-2"><Music size={12} className="shrink-0"/> MÚSICA</button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('EFECTO [] ', false, true); }} className="text-xs text-left px-3 py-2 hover:bg-gray-100 rounded outline-none focus-ring flex items-center gap-2"><Headphones size={12} className="shrink-0"/> EFECTO</button>
                          <div className="flex w-full my-1 border-y border-gray-100 divide-x divide-gray-100">
                              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('1P '); }} className="flex-1 text-xs hover:bg-gray-100 py-2 outline-none focus-ring text-center font-medium">1P</button>
                              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('2P '); }} className="flex-1 text-xs hover:bg-gray-100 py-2 outline-none focus-ring text-center font-medium">2P</button>
                              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('3P '); }} className="flex-1 text-xs hover:bg-gray-100 py-2 outline-none focus-ring text-center font-medium">3P</button>
                          </div>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('(PAUSA) '); }} className="text-xs text-left px-3 py-2 hover:bg-gray-100 rounded outline-none focus-ring">(PAUSA)</button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('(SILENCIO) '); }} className="text-xs text-left px-3 py-2 hover:bg-gray-100 rounded outline-none focus-ring">(SILENCIO)</button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTag('() ', true); }} className="text-xs text-left px-3 py-2 bg-gray-50 hover:bg-gray-200 mt-1 rounded outline-none focus-ring flex justify-between items-center"><span>Acotación</span><span className="text-[10px] text-gray-400">()</span></button>
                      </div>
                  )}
              </div>
          </div>
          <div className="w-16 shrink-0 py-3 flex justify-center items-start group/tp font-bold text-black">
              <input type="number" min="0" value={localData.tp} onChange={(e) => handleChange('tp', parseInt(e.target.value) || 0, true)} className="w-8 text-right bg-transparent outline-none font-bold text-black border-b border-transparent hover:border-gray-300 focus:border-gray-500 hide-arrows text-[13px]" />
              <span className="text-black ml-0.5 text-[13px] font-bold">"</span>
              <style>{`.hide-arrows::-webkit-inner-spin-button, .hide-arrows::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
          </div>
          <div className="w-20 text-center shrink-0 py-3 bg-transparent text-black text-[13px] font-bold">{formatTA(intervention.computedTA)}</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-1 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity bg-white border border-gray-200 shadow-sm rounded-l p-1 print:hidden">
              <button onClick={() => onMove(-1)} disabled={isFirst} className="p-1 text-gray-400 hover:text-black disabled:opacity-20 outline-none"><ChevronDown size={14} className="transform rotate-180" /></button>
              <ConfirmButton icon={Trash2} onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 outline-none hover:bg-red-50 rounded" />
              <button onClick={() => onMove(1)} disabled={isLast} className="p-1 text-gray-400 hover:text-black disabled:opacity-20 outline-none"><ChevronDown size={14} /></button>
          </div>
      </div>
  );
}

function GuionManager({ project, updateProject, targetSceneId }) {
  const scenes = (project.scenes || []).map((s, index) => ({ ...s, absoluteIndex: index + 1 }));
  const rawInterventions = project.interventions || [];

  let currentTA = 0; let currentLine = 1;
  const scenesWithInterventions = scenes.map(scene => {
      const sceneInvs = rawInterventions.filter(i => i.sceneId === scene.id).sort((a, b) => a.order - b.order).map(inv => {
              currentTA += inv.tp || 0; const lines = estimateVisualLines(inv); const startLine = currentLine; currentLine += lines;
              return { ...inv, computedTA: currentTA, startLine, lines };
          });
      return { ...scene, interventions: sceneInvs };
  });

  const updateAndSave = (newInterventions) => updateProject({ ...project, interventions: newInterventions, lastModified: new Date().toISOString() });
  const handleUpdateIntervention = (updatedInv) => updateAndSave(rawInterventions.map(i => i.id === updatedInv.id ? updatedInv : i));
  const handleAddScene = () => {
      const newScene = { id: generateId(), intExt: 'INT.', location: 'LUGAR', timeOfDay: 'DÍA', scenario: '', characters: [], dialogues: '', actions: '', act: 'ACTO I', marker: '', synopsis: '' };
      updateProject({ ...project, scenes: [...(project.scenes || []), newScene], lastModified: new Date().toISOString() });
  };
  const handleUpdateScene = (id, field, value) => updateProject({ ...project, scenes: (project.scenes || []).map(s => s.id === id ? { ...s, [field]: value } : s), lastModified: new Date().toISOString() });
  const handleDeleteScene = (id) => updateProject({ ...project, scenes: (project.scenes || []).filter(s => s.id !== id), interventions: rawInterventions.filter(i => i.sceneId !== id), lastModified: new Date().toISOString() });
  const handleAddIntervention = (sceneId) => {
      const sceneInvs = rawInterventions.filter(i => i.sceneId === sceneId); const maxOrder = sceneInvs.reduce((max, i) => Math.max(max, i.order), 0);
      updateAndSave([...rawInterventions, { id: generateId(), sceneId, order: maxOrder + 1, responsible: '', content: '', tp: 0 }]);
  };
  const handleDeleteIntervention = (id) => updateAndSave(rawInterventions.filter(i => i.id !== id));
  const handleMoveIntervention = (id, direction) => {
      const invIndex = rawInterventions.findIndex(i => i.id === id); if(invIndex === -1) return; const inv = rawInterventions[invIndex];
      const sceneInvs = rawInterventions.filter(i => i.sceneId === inv.sceneId).sort((a,b) => a.order - b.order); const index = sceneInvs.findIndex(i => i.id === id);
      if ((direction === -1 && index === 0) || (direction === 1 && index === sceneInvs.length - 1)) return;
      const targetInv = sceneInvs[index + direction];
      updateAndSave(rawInterventions.map(i => { if(i.id === inv.id) return {...i, order: targetInv.order}; if(i.id === targetInv.id) return {...i, order: inv.order}; return i; }));
  };
  
  const handleExport = async (format) => {
    const isMd = format === 'md'; const isTxt = format === 'txt';
    if (isMd || isTxt) {
        let content = isMd ? `# GUION RADIOFÓNICO: ${project.general.programName || 'SIN TÍTULO'}\n\n` : `GUION RADIOFÓNICO: ${project.general.programName || 'SIN TÍTULO'}\n\n`;
        scenesWithInterventions.forEach((scene) => {
             content += isMd ? `## ESC. ${String(scene.absoluteIndex).padStart(2, '0')} / ${scene.intExt} — ${scene.location} — ${scene.timeOfDay}\n\n` : `ESC. ${String(scene.absoluteIndex).padStart(2, '0')} / ${scene.intExt} — ${scene.location} — ${scene.timeOfDay}\n\n`;
             content += isMd ? `| N° | RESPONSABLE | AUDIO | T.P. | T.A. |\n|---|---|---|---|---|\n` : `N° | RESPONSABLE | AUDIO | T.P. | T.A.\n-------------------------------------------------\n`;
             scene.interventions.forEach(inv => {
                 const resp = inv.responsible || ''; const audio = (inv.content || '').replace(/\n/g, ' '); const tp = `${inv.tp || 0}"`; const ta = formatTA(inv.computedTA); const lineStart = inv.startLine;
                 if(isMd) content += `| ${lineStart} | **${resp}** | ${audio} | ${tp} | ${ta} |\n`; else content += `${lineStart} | ${resp} | ${audio} | ${tp} | ${ta}\n`;
             }); content += '\n';
        });
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Guion_${project.general.programName || 'Proyecto'}.${format}`; a.click();
    } else if (format === 'doc') {
         let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Guion</title><style>body { font-family: 'Courier New', Courier, monospace; font-size: 11pt; color: #000; background: #fff; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; } th, td { border: 1px solid #000; padding: 5px; vertical-align: top; } th { background-color: #fff; font-weight: bold; text-align: left; border-bottom: 2px solid #000; border-top: 2px solid #000;} tr { page-break-inside: avoid; page-break-after: auto; } .scene-header { font-weight: bold; font-size: 11pt; margin-top: 30px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px dashed #000; padding-bottom: 5px; page-break-after: avoid; }</style></head><body><h1 style="text-align: center; text-transform: uppercase; font-family: Arial, sans-serif;">GUION RADIOFÓNICO: ${project.general.programName || 'SIN TÍTULO'}</h1>`;
         scenesWithInterventions.forEach(scene => {
             html += `<div class="scene-header">ESC. ${String(scene.absoluteIndex).padStart(2, '0')} / ${scene.intExt} — ${scene.location} — ${scene.timeOfDay}</div>`;
             html += `<table><thead><tr><th width="5%">N°</th><th width="20%">RESPONSABLE</th><th width="55%">AUDIO</th><th width="10%">T.P.</th><th width="10%">T.A.</th></tr></thead><tbody>`;
             scene.interventions.forEach(inv => {
                 let contentHtml = (inv.content || '').replace(/\n/g, '<br>'); let isControl = (inv.responsible || '').trim().toUpperCase() === 'CONTROL';
                 if (isControl) contentHtml = `<strong style="text-decoration: underline; text-transform: uppercase;">${contentHtml}</strong>`;
                 html += `<tr><td><strong>${inv.startLine}</strong></td><td><strong>${(inv.responsible || '').toUpperCase()}:</strong></td><td>${contentHtml}</td><td><strong>${inv.tp || 0}"</strong></td><td><strong>${formatTA(inv.computedTA)}</strong></td></tr>`;
             }); html += `</tbody></table>`;
         }); html += `</body></html>`;
         const blob = new Blob(['\ufeff', html], { type: 'application/msword' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Guion_${project.general.programName || 'Proyecto'}.doc`; a.click();
    } else if (format === 'pdf') {
         try {
           const html2pdf = await loadHtml2Pdf();
           const element = document.createElement('div');
           element.style.fontFamily = "'Courier New', Courier, monospace"; element.style.color = "#000"; element.style.backgroundColor = "#fff"; element.style.padding = "10px"; element.style.width = "100%";
           
           let html = `<h1 style="text-align: center; text-transform: uppercase; font-family: sans-serif; font-size: 14pt; margin-bottom: 25px;">GUION RADIOFÓNICO: ${project.general.programName || 'SIN TÍTULO'}</h1>`;
           
           scenesWithInterventions.forEach(scene => {
               html += `<div style="page-break-inside: auto; margin-bottom: 35px;">`;
               html += `<div style="font-weight: bold; font-family: sans-serif; font-size: 11pt; margin-bottom: 15px; text-transform: uppercase; page-break-after: avoid;">
                           ESC. ${String(scene.absoluteIndex).padStart(2, '0')} / ${scene.intExt} — ${scene.location} — ${scene.timeOfDay}
                        </div>`;
               
               if (scene.interventions && scene.interventions.length > 0) {
                   html += `<table style="width: 100%; border-collapse: collapse; page-break-inside: auto;">
                              <thead style="display: table-header-group;">
                                <tr>
                                  <th style="width: 6%; border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 4px; font-size: 10pt;">N°</th>
                                  <th style="width: 20%; border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 4px; font-size: 10pt;">RESPONSABLE</th>
                                  <th style="width: 54%; border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 4px; font-size: 10pt;">AUDIO</th>
                                  <th style="width: 10%; border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 8px 4px; font-size: 10pt;">T.P.</th>
                                  <th style="width: 10%; border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 8px 4px; font-size: 10pt;">T.A.</th>
                                </tr>
                              </thead>
                              <tbody>`;
                   
                   scene.interventions.forEach(inv => {
                       let contentHtml = (inv.content || '').replace(/\n/g, '<br>');
                       let isControl = (inv.responsible || '').trim().toUpperCase() === 'CONTROL';
                       if (isControl) contentHtml = `<strong style="text-decoration: underline; text-transform: uppercase;">${contentHtml}</strong>`;
                       
                       html += `<tr style="page-break-inside: avoid;">
                                  <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 11pt; font-weight: bold;">${inv.startLine}</td>
                                  <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 11pt;"><strong>${(inv.responsible || '').toUpperCase()}:</strong></td>
                                  <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 11pt;">${contentHtml}</td>
                                  <td style="padding: 10px 4px; vertical-align: top; text-align: center; border-bottom: 1px solid #ddd; font-size: 11pt;"><strong>${inv.tp || 0}"</strong></td>
                                  <td style="padding: 10px 4px; vertical-align: top; text-align: center; border-bottom: 1px solid #ddd; font-size: 11pt;"><strong>${formatTA(inv.computedTA)}</strong></td>
                                </tr>`;
                   });
                   html += `  </tbody>
                            </table>`;
               } else {
                   html += `<div style="color: #777; font-style: italic; font-size: 10pt;">(Sin intervenciones registradas)</div>`;
               }
               html += `</div>`;
           });
           
           element.innerHTML = html;
           await html2pdf().set({ margin: [0.75, 0.5, 0.75, 0.5], filename: `Guion_${project.general.programName || 'Proyecto'}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(element).save();
         } catch(e) { console.error(e); }
    }
  };

  const handleCreatePersonInline = (name) => updateProject({ ...project, people: [{ id: generateId(), realName: '', displayName: name.trim(), types: ['PERSONAJE'] }, ...(project.people || [])] });
  
  useEffect(() => {
      if (targetSceneId) {
          setTimeout(() => {
              const el = document.getElementById(`guion-scene-${targetSceneId}`);
              if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('bg-blue-50'); setTimeout(() => el.classList.remove('bg-blue-50'), 2000); }
          }, 100);
      }
  }, [targetSceneId]);

  const plannedSeconds = parsePlannedDuration(project.general.duration);
  const diffSeconds = currentTA - plannedSeconds;
  let diffFormatted = '';
  if (plannedSeconds === 0) diffFormatted = '--';
  else if (diffSeconds === 0) diffFormatted = 'Exacto';
  else diffFormatted = `${diffSeconds > 0 ? '+' : '-'}${formatTA(Math.abs(diffSeconds))}`;

  return (
      <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
          <div className="h-16 px-8 flex justify-between items-center z-30 shrink-0 print:hidden border-b border-[var(--divider)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-6">
                  <h2 className="text-lg font-medium hidden md:block">Documento de Guion</h2>
                  <div className="flex items-center gap-4 text-xs font-medium border border-[var(--divider)] rounded px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-sec)]">
                      <span>Previsto: {project.general.duration || '--:--'}</span><span className="text-[var(--divider)]">|</span><span className={plannedSeconds > 0 ? (diffSeconds > 0 ? 'text-red-500' : 'text-green-600') : ''}>Calculado: {formatTA(currentTA)} ({diffFormatted})</span>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={handleAddScene} className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-2 focus-ring">
                      <Plus size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Nueva Escena</span>
                  </button>
                  <ExportDropdown onExport={handleExport} className="hidden sm:block" />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 print:p-0 bg-[#e2e8f0] print:bg-white custom-scrollbar">
              {scenesWithInterventions.length === 0 ? (
                  <div className="border border-[var(--divider)] rounded p-16 flex flex-col items-center justify-center bg-white max-w-2xl mx-auto shadow-sm">
                      <span className="text-sm font-medium text-gray-500 mb-6">Documento en Blanco</span>
                      <button onClick={handleAddScene} className="text-sm font-medium text-gray-800 border-b border-gray-800 hover:text-black outline-none focus-ring">
                          Añadir Primera Escena
                      </button>
                  </div>
              ) : (
                  <div id="guion-pdf-container" className="max-w-[950px] mx-auto bg-white overflow-hidden overflow-x-auto print:border-none print:max-w-none text-black font-courier shadow-sm border border-gray-300 pb-24">
                      <div className="min-w-[800px]">
                          {scenesWithInterventions.map((scene) => (
                              <div key={scene.id} id={`guion-scene-${scene.id}`} className="transition-colors print:break-inside-avoid relative pt-16 px-10 lg:px-14 group/scene">
                                  
                                  {/* Scene Header */}
                                  <div className="mb-4 flex justify-between items-start font-sans">
                                      <div className="flex-1 text-sm tracking-wide mb-2 font-semibold text-black">
                                          <div className="flex items-center gap-2 flex-wrap">
                                              <span>ESC. {String(scene.absoluteIndex).padStart(2, '0')} /</span>
                                              <select value={scene.intExt || 'INT.'} onChange={(e) => handleUpdateScene(scene.id, 'intExt', e.target.value)} className="bg-transparent hover:bg-gray-100 outline-none cursor-pointer print:appearance-none border-b border-transparent focus:border-gray-300 text-black rounded px-1 py-0.5 focus-ring">
                                                  <option value="INT.">INT.</option><option value="EXT.">EXT.</option><option value="INT/EXT.">INT/EXT.</option>
                                              </select><span>—</span>
                                              <input type="text" value={scene.location || ''} onChange={(e) => handleUpdateScene(scene.id, 'location', e.target.value.toUpperCase())} className="bg-transparent hover:bg-gray-100 outline-none placeholder-gray-400 w-48 border-b border-transparent focus:border-gray-300 px-1 py-0.5 text-black rounded focus-ring" placeholder="LUGAR..."/><span>—</span>
                                              <input type="text" value={scene.timeOfDay || ''} onChange={(e) => handleUpdateScene(scene.id, 'timeOfDay', e.target.value.toUpperCase())} className="bg-transparent hover:bg-gray-100 outline-none placeholder-gray-400 w-32 border-b border-transparent focus:border-gray-300 px-1 py-0.5 text-black rounded focus-ring" placeholder="DÍA/NOCHE"/>
                                          </div>
                                      </div>
                                      <ConfirmButton icon={Trash2} onClick={() => handleDeleteScene(scene.id)} className="text-gray-400 hover:text-red-500 p-1.5 print:hidden opacity-0 group-hover/scene:opacity-100 outline-none rounded hover:bg-gray-100 ml-4 transition-all" />
                                  </div>

                                  {/* Context Reference */}
                                  <details className="mb-8 bg-gray-50 border border-gray-200 rounded print:hidden font-sans">
                                      <summary className="px-4 py-2.5 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100 list-none flex items-center gap-2 outline-none rounded transition-colors select-none focus-ring">
                                          <ChevronDown size={14} className="group-open:rotate-180 transition-transform shrink-0" /><span>Referencia de Escaleta</span>
                                      </summary>
                                      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs border-t border-gray-200">
                                          <div><strong className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Escenario</strong><p className="text-gray-800">{scene.scenario || '-'}</p></div>
                                          <div><strong className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Personajes</strong><p className="text-gray-800">{scene.characters?.join(', ') || '-'}</p></div>
                                          <div><strong className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Diálogos</strong><p className="text-gray-800">{scene.dialogues || '-'}</p></div>
                                          <div><strong className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Acciones</strong><p className="text-gray-800">{scene.actions || '-'}</p></div>
                                      </div>
                                  </details>

                                  {/* Table Header (Sticky per scene) */}
                                  <div className="sticky top-0 z-10 bg-white border-y border-gray-300 flex text-[13px] font-courier font-bold py-2 mb-2 text-black shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                                      <div className="w-12 text-center shrink-0">N°</div><div className="w-48 px-4 shrink-0">RESPONSABLE</div><div className="flex-1 px-5">AUDIO</div><div className="w-16 text-center shrink-0">T.P.</div><div className="w-20 text-center shrink-0">T.A.</div>
                                  </div>

                                  {/* Interventions */}
                                  <div>
                                      {scene.interventions.length === 0 ? (
                                          <div className="py-12 text-center text-gray-400 text-sm font-courier italic">Escribe la primera línea...</div>
                                      ) : (
                                          scene.interventions.map((inv, index) => <InterventionRow key={inv.id} intervention={inv} isFirst={index === 0} isLast={index === scene.interventions.length - 1} projectPeople={project.people || []} onUpdate={handleUpdateIntervention} onDelete={() => handleDeleteIntervention(inv.id)} onMove={(dir) => handleMoveIntervention(inv.id, dir)} onCreatePerson={handleCreatePersonInline} />)
                                      )}
                                  </div>
                                  
                                  {/* Add Row Button */}
                                  <div className="py-6 flex justify-center print:hidden font-sans border-b border-dashed border-gray-200">
                                      <button onClick={() => handleAddIntervention(scene.id)} className="bg-transparent border border-gray-300 text-gray-500 rounded text-xs font-medium px-4 py-2 hover:border-gray-500 hover:text-black transition-colors flex items-center gap-2 outline-none focus-ring">
                                          <Plus size={14} className="shrink-0" /> Insertar Fila
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
}

function ResourcesManager({ project, updateProject }) {
  const [activeTab, setActiveTab] = useState('effects');
  const effects = project.soundEffects || []; const music = project.music || [];
  const scenes = [...(project.scenes || [])].sort((a, b) => a.absoluteIndex - b.absoluteIndex);
  const interventions = project.interventions || [];
  const musicStats = {}; const effectsStats = {};

  const trackUsage = (dict, name, sceneObj) => {
    const cleanName = name.trim(); if (!cleanName || cleanName.length < 3) return; const key = cleanName.toLowerCase();
    if (!dict[key]) dict[key] = { originalName: cleanName, count: 0, scenes: new Set() }; dict[key].count++;
    if (sceneObj) dict[key].scenes.add(`ESC. ${String(sceneObj.absoluteIndex).padStart(2, '0')}`);
  };

  scenes.forEach(scene => {
    if (scene.scenario) {
      for (const m of scene.scenario.matchAll(/(?:música|canción|tema)\s+(?:de|para|que)\s+([^,.\n;()[\]]+)/gi)) trackUsage(musicStats, m[1], scene);
      for (const e of scene.scenario.matchAll(/(?:sonido|ruido|efecto)\s+(?:de|para|que)\s+([^,.\n;()[\]]+)/gi)) trackUsage(effectsStats, e[1], scene);
    }
  });

  interventions.forEach(inv => {
    const sceneObj = scenes.find(s => s.id === inv.sceneId);
    if (inv.content) {
      for (const m of inv.content.matchAll(/MÚSICA\s*(?:\([^)]+\))?\s*\[(.*?)\]/gi)) trackUsage(musicStats, m[1], sceneObj);
      for (const e of inv.content.matchAll(/EFECTO\s*(?:\([^)]+\))?\s*\[(.*?)\]/gi)) trackUsage(effectsStats, e[1], sceneObj);
    }
  });

  useEffect(() => {
    let changed = false; let newMusic = [...music]; let newEffects = [...effects];
    Object.values(musicStats).forEach(stat => { if (!newMusic.some(m => m.name.toLowerCase() === stat.originalName.toLowerCase() || m.name.toLowerCase().includes(stat.originalName.toLowerCase()))) { newMusic.push({ id: generateId(), name: stat.originalName, description: '' }); changed = true; } });
    Object.values(effectsStats).forEach(stat => { if (!newEffects.some(e => e.name.toLowerCase() === stat.originalName.toLowerCase() || e.name.toLowerCase().includes(stat.originalName.toLowerCase()))) { newEffects.push({ id: generateId(), name: stat.originalName, category: 'ANTHROPOPHONY', description: '' }); changed = true; } });
    if (changed) updateProject({ ...project, music: newMusic, soundEffects: newEffects, lastModified: new Date().toISOString() });
  }, [project.interventions, project.scenes]);

  const getUsage = (dict, name) => {
    const key = name.trim().toLowerCase(); const stat = dict[key] || Object.values(dict).find(s => s.originalName.toLowerCase().includes(key) || key.includes(s.originalName.toLowerCase()));
    return stat ? { count: stat.count, scenes: Array.from(stat.scenes).join(', ') } : { count: 0, scenes: '-' };
  };

  const handleUpdateEffect = (id, field, value) => updateProject({ ...project, soundEffects: effects.map(e => e.id === id ? { ...e, [field]: value } : e), lastModified: new Date().toISOString() });
  const handleDeleteEffect = (id) => updateProject({ ...project, soundEffects: effects.filter(e => e.id !== id), lastModified: new Date().toISOString() });
  const handleUpdateMusic = (id, field, value) => updateProject({ ...project, music: music.map(m => m.id === id ? { ...m, [field]: value } : m), lastModified: new Date().toISOString() });
  const handleDeleteMusic = (id) => updateProject({ ...project, music: music.filter(m => m.id !== id), lastModified: new Date().toISOString() });

  const handleAddEffect = () => {
     const newFx = { id: generateId(), name: 'Nuevo Efecto', category: 'ANTHROPOPHONY', description: '' };
     updateProject({...project, soundEffects: [newFx, ...effects], lastModified: new Date().toISOString()});
  };

  const handleAddMusic = () => {
     const newM = { id: generateId(), name: 'Nueva Pista', description: '' };
     updateProject({...project, music: [newM, ...music], lastModified: new Date().toISOString()});
  };

  const handleExport = async (format) => {
    const isEffects = activeTab === 'effects';
    const items = isEffects ? effects : music;
    const statsDict = isEffects ? effectsStats : musicStats;
    const titleName = isEffects ? 'Inventario de Efectos' : 'Inventario de Música';

    if (format === 'txt' || format === 'md') {
      const isMd = format === 'md';
      let content = isMd ? `# ${titleName}\n\n` : `${titleName.toUpperCase()}\n============================\n\n`;
      items.forEach((item, i) => {
        const usage = getUsage(statsDict, item.name);
        content += isMd ? `### ${String(i + 1).padStart(2, '0')}. ${item.name}\n` : `${String(i + 1).padStart(2, '0')}. ${item.name}\n`;
        if (isEffects) content += isMd ? `- **Categoría:** ${item.category}\n` : `  Categoría: ${item.category}\n`;
        content += isMd ? `- **Escenas:** ${usage.scenes}\n` : `  Escenas: ${usage.scenes}\n`;
        content += isMd ? `- **Uso:** ${usage.count} veces\n` : `  Uso: ${usage.count} veces\n`;
        content += isMd ? `- **Notas:** ${item.description || '-'}\n\n` : `  Notas: ${item.description || '-'}\n\n`;
      });
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${titleName.replace(/ /g, '_')}.${format}`; a.click();
    } else if (format === 'doc') {
      let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${titleName}</title><style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } th { background-color: #f4f4f4; }</style></head><body><h2>${titleName}</h2><table><thead><tr><th>N°</th><th>${isEffects ? 'Efecto' : 'Pista'}</th>${isEffects ? '<th>Categoría</th>' : ''}<th>Escenas</th><th>Uso</th><th>Notas</th></tr></thead><tbody>`;
      items.forEach((item, i) => {
        const usage = getUsage(statsDict, item.name);
        html += `<tr><td>${String(i + 1).padStart(2, '0')}</td><td>${item.name}</td>${isEffects ? `<td>${item.category}</td>` : ''}<td>${usage.scenes}</td><td>${usage.count}</td><td>${item.description || '-'}</td></tr>`;
      });
      html += `</tbody></table></body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${titleName.replace(/ /g, '_')}.doc`; a.click();
    } else if (format === 'pdf') {
      try {
        const html2pdf = await loadHtml2Pdf();
        const element = document.createElement('div');
        element.style.fontFamily = "Arial, sans-serif"; element.style.padding = "20px";
        let html = `<h2 style="text-align: center; margin-bottom: 20px;">${titleName}</h2><table style="width: 100%; border-collapse: collapse; font-size: 12px;"><thead><tr><th style="border: 1px solid #000; padding: 8px; background-color: #eee;">N°</th><th style="border: 1px solid #000; padding: 8px; background-color: #eee;">${isEffects ? 'Efecto' : 'Pista'}</th>${isEffects ? '<th style="border: 1px solid #000; padding: 8px; background-color: #eee;">Categoría</th>' : ''}<th style="border: 1px solid #000; padding: 8px; background-color: #eee;">Escenas</th><th style="border: 1px solid #000; padding: 8px; background-color: #eee;">Uso</th><th style="border: 1px solid #000; padding: 8px; background-color: #eee;">Notas</th></tr></thead><tbody>`;
        items.forEach((item, i) => {
          const usage = getUsage(statsDict, item.name);
          html += `<tr style="page-break-inside: avoid;"><td style="border: 1px solid #000; padding: 8px; text-align: center;">${String(i + 1).padStart(2, '0')}</td><td style="border: 1px solid #000; padding: 8px;">${item.name}</td>${isEffects ? `<td style="border: 1px solid #000; padding: 8px;">${item.category}</td>` : ''}<td style="border: 1px solid #000; padding: 8px;">${usage.scenes}</td><td style="border: 1px solid #000; padding: 8px; text-align: center;">${usage.count}</td><td style="border: 1px solid #000; padding: 8px;">${item.description || '-'}</td></tr>`;
        });
        html += `</tbody></table>`;
        element.innerHTML = html;
        await html2pdf().set({ margin: 0.5, filename: `${titleName.replace(/ /g, '_')}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } }).from(element).save();
      } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20 shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)] hidden md:block">Inventario Sonoro</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('effects')} className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider outline-none focus-ring transition-colors ${activeTab === 'effects' ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)]'}`}>Efectos (Fx)</button>
            <button onClick={() => setActiveTab('music')} className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider outline-none focus-ring transition-colors ${activeTab === 'music' ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)]'}`}>Música (M)</button>
          </div>
          <div className="w-px h-6 bg-[var(--divider)] hidden sm:block"></div>
          <div className="flex gap-2">
             {activeTab === 'effects' && (
               <button onClick={handleAddEffect} className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors outline-none flex items-center gap-1 focus-ring">
                  <Plus size={12} strokeWidth={2} /> Añadir Efecto
               </button>
             )}
             {activeTab === 'music' && (
               <button onClick={handleAddMusic} className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors outline-none flex items-center gap-1 focus-ring">
                  <Plus size={12} strokeWidth={2} /> Añadir Música
               </button>
             )}
          </div>
          <ExportDropdown onExport={handleExport} excludeImage={true} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        {activeTab === 'effects' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[var(--text-main)]">
              <div className="py-4 border-b border-[var(--divider)]"><strong className="block mb-1 text-[10px] uppercase tracking-wider text-[var(--accent)]">Biophony</strong> Origen biológico (Seres vivos).</div>
              <div className="py-4 border-b border-[var(--divider)]"><strong className="block mb-1 text-[10px] uppercase tracking-wider text-[var(--accent)]">Geophony</strong> Abióticos naturales (Clima).</div>
              <div className="py-4 border-b border-[var(--divider)]"><strong className="block mb-1 text-[10px] uppercase tracking-wider text-[var(--accent)]">Anthropophony</strong> Actividad humana o mecánica.</div>
            </div>
            {effects.length === 0 ? <div className="p-16 border border-[var(--divider)] rounded text-center text-sm font-medium text-[var(--text-sec)] bg-[var(--bg-surface)]">Inventario Vacío</div> : (
              <div className="border border-[var(--divider)] bg-[var(--bg-surface)] rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-b border-[var(--divider)] bg-[var(--bg-main)]">
                      <th className="p-4 w-12 text-center">N°</th><th className="p-4 w-1/4">Efecto</th><th className="p-4 w-48">Escenas</th><th className="p-4 w-24 text-center">Uso</th><th className="p-4 w-48">Categoría</th><th className="p-4">Notas</th><th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)] text-sm font-medium text-[var(--text-main)]">
                    {effects.map((effect, index) => {
                      const usage = getUsage(effectsStats, effect.name);
                      return (
                        <tr key={effect.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                          <td className="p-4 text-center text-[var(--text-sec)]">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4"><input type="text" value={effect.name} onChange={(e) => handleUpdateEffect(effect.id, 'name', e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1 focus-ring"/></td>
                          <td className="p-4 text-xs text-[var(--text-sec)]">{usage.scenes}</td>
                          <td className="p-4 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${usage.count > 0 ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-[var(--bg-main)] border border-[var(--divider)] text-[var(--text-sec)]'}`}>{usage.count}</span></td>
                          <td className="p-4"><select value={effect.category} onChange={(e) => handleUpdateEffect(effect.id, 'category', e.target.value)} className="w-full text-xs bg-transparent outline-none cursor-pointer focus-ring"><option value="BIOPHONY">Biophony</option><option value="GEOPHONY">Geophony</option><option value="ANTHROPOPHONY">Anthropophony</option></select></td>
                          <td className="p-4"><textarea value={effect.description} onChange={(e) => handleUpdateEffect(effect.id, 'description', e.target.value)} className="w-full bg-transparent resize-none outline-none custom-scrollbar border-b border-transparent focus:border-[var(--accent)] py-1 text-xs focus-ring" rows={1} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} /></td>
                          <td className="p-4 text-center"><ConfirmButton icon={Trash2} onClick={() => handleDeleteEffect(effect.id)} className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--divider)] p-1" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'music' && (
          <div className="max-w-6xl mx-auto space-y-10">
            {music.length === 0 ? <div className="p-16 border border-[var(--divider)] rounded text-center text-sm font-medium text-[var(--text-sec)] bg-[var(--bg-surface)]">Inventario Vacío</div> : (
              <div className="border border-[var(--divider)] bg-[var(--bg-surface)] rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-b border-[var(--divider)] bg-[var(--bg-main)]">
                      <th className="p-4 w-12 text-center">N°</th><th className="p-4 w-1/3">Pista Sonora</th><th className="p-4 w-48">Escenas</th><th className="p-4 w-24 text-center">Uso</th><th className="p-4">Notas Técnicas</th><th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)] text-sm font-medium text-[var(--text-main)]">
                    {music.map((track, index) => {
                      const usage = getUsage(musicStats, track.name);
                      return (
                        <tr key={track.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                          <td className="p-4 text-center text-[var(--text-sec)]">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4"><input type="text" value={track.name} onChange={(e) => handleUpdateMusic(track.id, 'name', e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1 focus-ring"/></td>
                          <td className="p-4 text-xs text-[var(--text-sec)]">{usage.scenes}</td>
                          <td className="p-4 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${usage.count > 0 ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-[var(--bg-main)] border border-[var(--divider)] text-[var(--text-sec)]'}`}>{usage.count}</span></td>
                          <td className="p-4"><textarea value={track.description} onChange={(e) => handleUpdateMusic(track.id, 'description', e.target.value)} className="w-full bg-transparent resize-none outline-none custom-scrollbar border-b border-transparent focus:border-[var(--accent)] py-1 text-xs focus-ring" rows={1} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} /></td>
                          <td className="p-4 text-center"><ConfirmButton icon={Trash2} onClick={() => handleDeleteMusic(track.id)} className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--divider)] p-1" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getInterventionType(inv) {
  const resp = (inv.responsible || '').trim().toUpperCase(); 
  if (resp === 'CONTROL') return 'CONTROL';
  
  const c = (inv.content || '').toUpperCase(); 
  if (c.includes('MÚSICA') || c.includes('MUSICA')) return 'MÚSICA'; 
  if (c.includes('EFECTO')) return 'EFECTO'; 
  if (c.includes('(SILENCIO)') || c.includes('(PAUSA)')) return 'SILENCIO'; 
  
  return 'VOZ / DIÁLOGO';
}

function StatisticsManager({ project }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const scenes = project.scenes || []; 
  const interventions = project.interventions || []; 
  const plannedSeconds = parsePlannedDuration(project.general.duration);
  const realSeconds = interventions.reduce((sum, inv) => sum + (inv.tp || 0), 0); 
  const diffSeconds = realSeconds - plannedSeconds;

  let diffFormatted = '';
  if (plannedSeconds === 0) diffFormatted = 'NO DEFINIDO';
  else if (diffSeconds === 0) diffFormatted = 'EXACTO';
  else diffFormatted = `${diffSeconds > 0 ? '+' : '-'}${formatTA(Math.abs(diffSeconds))} (${diffSeconds > 0 ? 'EXCESO' : 'FALTANTE'})`;

  const typeDistribution = { 'VOZ / DIÁLOGO': 0, 'MÚSICA': 0, 'EFECTO': 0, 'SILENCIO': 0, 'CONTROL': 0 };
  const characterStats = {};

  interventions.forEach(inv => {
    const type = getInterventionType(inv);
    typeDistribution[type]++;
    
    if (type === 'VOZ / DIÁLOGO' && inv.responsible && inv.responsible.trim() !== '') {
       const charName = inv.responsible.trim().toUpperCase();
       if (charName !== 'CONTROL') {
           if (!characterStats[charName]) characterStats[charName] = { count: 0, scenes: new Set() };
           characterStats[charName].count++;
           
           const sceneObj = scenes.find(s => s.id === inv.sceneId);
           if (sceneObj) {
               characterStats[charName].scenes.add(`ESC. ${String(sceneObj.absoluteIndex).padStart(2, '0')}`);
           }
       }
    }
  });

  const totalInterventions = interventions.length;
  const totalVoiceInterventions = Object.values(characterStats).reduce((sum, stat) => sum + stat.count, 0);

  const pieColors = {
    'VOZ / DIÁLOGO': 'var(--accent)',
    'MÚSICA': '#5a8bdc',
    'EFECTO': '#e06c6c',
    'SILENCIO': '#9D9B92',
    'CONTROL': '#242424'
  };

  const circumference = 2 * Math.PI * 25; 
  let cumulativeOffset = 0;
  
  const pieSlices = Object.entries(typeDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => {
      const pct = totalInterventions > 0 ? count / totalInterventions : 0;
      const slice = { type, count, pct, cumulativeOffset, color: pieColors[type] };
      cumulativeOffset += pct;
      return slice;
    });

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="h-16 px-8 flex items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20 shrink-0">
        <h2 className="text-lg font-medium">Analítica de Producción</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="py-6 px-8 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex flex-col items-start shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2">Tiempo Previsto</span>
              <span className="text-3xl font-medium text-[var(--text-main)] tracking-tight">{project.general.duration || '--:--'}</span>
            </div>
            <div className="py-6 px-8 bg-[var(--bg-surface)] border-b-2 border-x border-t border-[var(--divider)] border-b-[var(--accent)] rounded flex flex-col items-start shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">Tiempo Real Acumulado</span>
              <span className="text-4xl font-medium tracking-tight">{formatTA(realSeconds)}</span>
            </div>
            <div className="py-6 px-8 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex flex-col items-start shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2">Desviación</span>
              <span className={`text-xl font-medium ${plannedSeconds > 0 ? (diffSeconds > 0 ? 'text-red-600' : 'text-[var(--accent)]') : 'text-[var(--text-sec)]'}`}>{diffFormatted}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-main)] mb-8 pb-2 border-b border-[var(--divider)]">
                Composición del Formato
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative w-48 h-48 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 rounded-full bg-[var(--bg-surface)] shadow-sm">
                    {pieSlices.map((slice) => {
                       if (slice.pct === 0) return null;
                       const dash = slice.pct * circumference;
                       const gap = circumference - dash;
                       const offset = -(slice.cumulativeOffset * circumference);
                       return (
                         <circle
                           key={slice.type}
                           r="25" cx="50" cy="50" fill="transparent"
                           stroke={slice.color}
                           strokeWidth="50"
                           strokeDasharray={mounted ? `${dash} ${gap}` : `0 ${circumference}`}
                           strokeDashoffset={offset}
                           className="transition-all duration-1000 ease-out"
                         />
                       );
                    })}
                  </svg>
                  {totalInterventions === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-sec)] font-medium">Sin datos</div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  {pieSlices.map((slice) => {
                    const pctVisual = totalInterventions > 0 ? Math.round(slice.pct * 100) : 0;
                    if (slice.count === 0) return null;
                    return (
                      <div key={slice.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }}></div>
                          <span className="font-medium text-[var(--text-main)]">{slice.type}</span>
                        </div>
                        <div className="font-semibold text-[var(--text-main)]">
                          {pctVisual}% <span className="text-xs text-[var(--text-sec)] ml-1 font-normal">({slice.count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-main)] mb-8 pb-2 border-b border-[var(--divider)]">
                Participación de Personajes
              </h3>
              {Object.keys(characterStats).length === 0 ? (
                <div className="text-sm text-[var(--text-sec)] italic bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-6 text-center">
                  No hay diálogos registrados aún.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(characterStats).sort((a,b) => b[1].count - a[1].count).map(([name, stat]) => {
                    const pct = totalVoiceInterventions > 0 ? Math.round((stat.count / totalVoiceInterventions) * 100) : 0;
                    return (
                      <div key={name} className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-4 relative overflow-hidden group hover:border-[var(--accent)] transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-20"></div>
                        <div className="flex justify-between items-baseline mb-3 pl-2">
                          <span className="text-sm font-semibold text-[var(--text-main)]">{name}</span>
                          <span className="text-sm font-bold text-[var(--text-main)]">
                            {pct}% <span className="text-xs font-normal text-[var(--text-sec)] ml-1">({stat.count} intervenciones)</span>
                          </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-sec)] pl-2">
                          Aparece en las escenas: <span className="text-[var(--text-main)]">{Array.from(stat.scenes).join(', ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}