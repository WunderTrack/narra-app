import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Settings, Users, BookOpen, Layers, Type, Plus, Trash2, Home, Save,
  Download, GripVertical, ChevronDown, ChevronUp, Clock, X, FileText,
  FileImage, FileCode, File, Headphones, Music, BarChart2, Sun, Moon,
  ArrowRight, Radio, ListOrdered, Upload, Copy, Check, Monitor, Play, Pause
} from 'lucide-react';

// ==========================================
// 1. UTILIDADES GENERALES Y DE FORMATEO
// ==========================================

const generateId = () => Math.random().toString(36).slice(2, 11);

const capitalizeName = (str) => {
  if (!str) return '';
  return str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
};

export const parsePlannedDuration = (input, defaultUnit = 'sec') => {
  if (!input) return 0;
  if (typeof input === 'number') return Math.max(0, Math.floor(input));

  const clean = input.toString().trim();
  if (!clean) return 0;

  // Formato HH:MM:SS o MM:SS
  if (clean.includes(':')) {
    const parts = clean.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }

  // Formato minutero radiofónico: 12'30" o 45"
  const minSecMatch = clean.match(/^(?:(\d+)['’])?\s*(?:(\d+)["”])?$/);
  if (minSecMatch && (minSecMatch[1] || minSecMatch[2])) {
    const m = parseInt(minSecMatch[1] || '0', 10);
    const s = parseInt(minSecMatch[2] || '0', 10);
    return m * 60 + s;
  }

  // Valor numérico plano o acompañado de sufijo
  const numeric = parseInt(clean.replace(/\D/g, ''), 10);
  if (isNaN(numeric)) return 0;
  return defaultUnit === 'min' ? numeric * 60 : numeric;
};

export const formatTA = (totalSecs) => {
  const s = Math.max(0, Math.floor(totalSecs || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}'${pad(secs)}"`;
  }
  return `${pad(mins)}'${pad(secs)}"`;
};

export const wrapLines = (text = '', maxChars = 45) => {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';

  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  });
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
};

export const estimateVisualLines = (inv) => {
  if (!inv || !inv.content) return 1;
  const wrapped = wrapLines(inv.content, 45);
  return Math.max(1, wrapped.length);
};

// ==========================================
// 2. CARGADORES DE LIBRERÍAS EXTERNAS (CDN)
// ==========================================

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

// ==========================================
// 3. COMPONENTES DE INTERFAZ Y FORMULARIOS
// ==========================================

function ConfirmButton({ onClick, icon: Icon, text, className }) {
  const [asking, setAsking] = useState(false);

  if (asking) {
    return (
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-surface)] border border-[var(--accent)] rounded z-20 relative animate-in fade-in duration-200">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
            setAsking(false);
          }}
          className="text-[10px] uppercase tracking-wider font-semibold bg-[var(--accent)] text-[var(--bg-surface)] px-2 py-1 rounded hover:opacity-90 transition-opacity outline-none focus-ring"
        >
          BORRAR
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setAsking(false);
          }}
          className="text-[10px] uppercase tracking-wider font-semibold bg-transparent text-[var(--text-main)] px-2 py-1 rounded hover:bg-[var(--accent-soft)] transition-colors outline-none focus-ring"
        >
          NO
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAsking(true);
      }}
      className={`relative z-10 p-1.5 focus:outline-none focus-ring rounded transition-colors ${className}`}
      title={text || 'Eliminar'}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" />}
      {text && <span className="ml-1 text-xs font-medium">{text}</span>}
    </button>
  );
}

function ExportDropdown({ onExport, className = '', excludeImage = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative print:hidden ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-2 outline-none focus-ring"
        aria-expanded={open}
      >
        <Download size={14} strokeWidth={2} className="shrink-0" />
        <span className="hidden sm:inline">Exportar</span>
        <ChevronDown size={14} strokeWidth={2} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--divider)] z-50 rounded shadow-sm py-2 overflow-hidden">
          <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] mb-1">Documentos</div>
          <button
            onClick={() => { onExport('pdf'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
          >
            <File size={16} strokeWidth={1.5} className="shrink-0" /> PDF [Impresión]
          </button>
          <button
            onClick={() => { onExport('doc'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
          >
            <FileCode size={16} strokeWidth={1.5} className="shrink-0" /> Word [.DOCX]
          </button>

          <div className="px-4 py-1 mt-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-t border-[var(--divider)] pt-3 mb-1">Texto Plano</div>
          <button
            onClick={() => { onExport('txt'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
          >
            <FileText size={16} strokeWidth={1.5} className="shrink-0" /> Texto [.TXT]
          </button>
          <button
            onClick={() => { onExport('md'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
          >
            <FileCode size={16} strokeWidth={1.5} className="shrink-0" /> Markdown [.MD]
          </button>

          {!excludeImage && (
            <>
              <div className="px-4 py-1 mt-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-t border-[var(--divider)] pt-3 mb-1">Gráficos</div>
              <button
                onClick={() => { onExport('png'); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
              >
                <FileImage size={16} strokeWidth={1.5} className="shrink-0" /> Imagen [PNG]
              </button>
              <button
                onClick={() => { onExport('jpg'); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] flex items-center gap-3 transition-colors outline-none focus:bg-[var(--accent-soft)]"
              >
                <FileImage size={16} strokeWidth={1.5} className="shrink-0" /> Imagen [JPG]
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const FormGroup = ({ label, children, optional = false, description = '' }) => (
  <div className="mb-8 relative">
    <div className="flex justify-between items-baseline mb-2">
      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)]">{label}</label>
      {optional && <span className="text-[10px] text-[var(--text-sec)] italic">Opcional</span>}
    </div>
    {children}
    {description && <p className="text-xs mt-2 text-[var(--text-sec)] leading-relaxed">{description}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full bg-[var(--bg-surface)] border border-[var(--divider)] rounded text-[var(--text-main)] text-sm px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-sec)] focus-ring ${className}`}
    {...props}
  />
);

function TimeInput({ seconds, onChange, className = '', placeholder = '--', singleUnit = 'sec', emptyWhenZero = false }) {
  const fmt = (s) => (emptyWhenZero && !s ? '' : formatTA(s || 0));
  const [txt, setTxt] = useState(fmt(seconds));

  useEffect(() => setTxt(fmt(seconds)), [seconds]);

  const commit = () => {
    const s = parsePlannedDuration(txt, singleUnit);
    onChange(s);
    setTxt(fmt(s));
  };

  return (
    <input
      type="text"
      value={txt}
      placeholder={placeholder}
      className={className}
      onChange={(e) => setTxt(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
    />
  );
}

function CopyPromptButton({ promptText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors outline-none focus-ring flex items-center gap-1.5 shrink-0"
      title="Copiar prompt para IA"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-600 stroke-[2.5]" />
          <span className="text-emerald-700 font-bold">¡Copiado!</span>
        </>
      ) : (
        <>
          <Copy size={14} strokeWidth={2} />
          <span>Copiar prompt</span>
        </>
      )}
    </button>
  );
}

// ==========================================
// 4. FUNCIONES PURAS Y LÓGICA DE PROGRAMA RADIAL
// ==========================================

export const isRadioProgramFormat = (format) => {
  return (format || '').trim().toLowerCase() === 'programa radial';
};

export const isRadioProgramProject = (project) => {
  return isRadioProgramFormat(project?.general?.format);
};

export const getRadioBlocks = (project) => {
  return project?.radio?.blocks || [];
};

export const getRadioItemRealSeconds = (item, interventions = []) => {
  if (!item?.id) return 0;
  return interventions
    .filter((inv) => inv.sceneId === item.id)
    .reduce((total, inv) => total + (Number(inv.tp) || 0), 0);
};

export const getRadioBlockRealSeconds = (block, scenes = [], interventions = []) => {
  if (!block?.id) return 0;
  const blockItems = scenes.filter((s) => s.blockId === block.id);
  return blockItems.reduce((total, item) => total + getRadioItemRealSeconds(item, interventions), 0);
};

export const getRadioTandasTotalSeconds = (project) => {
  const blocks = getRadioBlocks(project);
  return blocks.reduce((sum, b) => sum + (Number(b.tandaSeconds) || 0), 0);
};

export const getRadioProgramRealTotalSeconds = (project) => {
  const scenes = project?.scenes || [];
  const interventions = project?.interventions || [];
  const contentSeconds = scenes.reduce((sum, item) => sum + getRadioItemRealSeconds(item, interventions), 0);
  const tandasSeconds = getRadioTandasTotalSeconds(project);
  return contentSeconds + tandasSeconds;
};

export const getRadioDeviation = (realSeconds, plannedSeconds) => {
  return (Number(realSeconds) || 0) - (Number(plannedSeconds) || 0);
};

export const formatSceneOrItemLabel = (sceneId, project) => {
  if (!sceneId || !project) return '-';
  if (isRadioProgramProject(project)) {
    const structure = getOrderedRadioStructure(project);
    for (let bIdx = 0; bIdx < structure.blocks.length; bIdx++) {
      const block = structure.blocks[bIdx];
      const found = block.items.find((it) => it.id === sceneId);
      if (found) {
        if (found.radioKind === 'seccion') {
          return `B${bIdx + 1} · S${found.sectionNumber}`;
        }
        return found.title || 'Elemento';
      }
    }
    const unassigned = (structure.unassignedItems || []).find((it) => it.id === sceneId);
    if (unassigned) {
      if (unassigned.radioKind === 'seccion') {
        return `S${unassigned.sectionNumber}`;
      }
      return unassigned.title || 'Elemento';
    }
    return 'Ítem';
  }

  const scenes = project.scenes || [];
  const idx = scenes.findIndex((s) => s.id === sceneId);
  return idx !== -1 ? `ESC. ${String(idx + 1).padStart(2, '0')}` : '-';
};

export const getOrderedRadioStructure = (project) => {
  const blocks = getRadioBlocks(project);
  const scenes = project?.scenes || [];
  const interventions = project?.interventions || [];

  let globalSectionIndex = 1;

  const structuredBlocks = blocks.map((block) => {
    const blockItems = scenes
      .filter((s) => s.blockId === block.id)
      .map((item) => {
        const isElement = item.radioKind === 'elemento';
        let sectionNumber = null;
        if (!isElement) {
          sectionNumber = globalSectionIndex++;
        }
        const realSeconds = getRadioItemRealSeconds(item, interventions);
        const plannedSeconds = Number(item.plannedSeconds) || 0;
        return {
          ...item,
          radioKind: item.radioKind || 'seccion',
          isFixed: item.isFixed !== undefined ? item.isFixed : true,
          pautaItems: item.pautaItems || [],
          sectionNumber,
          realSeconds,
          deviation: getRadioDeviation(realSeconds, plannedSeconds)
        };
      });

    const blockContentRealSeconds = blockItems.reduce((acc, it) => acc + it.realSeconds, 0);
    const blockPlannedSeconds = Number(block.plannedSeconds) || 0;
    const tandaSeconds = Number(block.tandaSeconds) || 0;

    return {
      ...block,
      plannedSeconds: blockPlannedSeconds,
      tandaSeconds,
      items: blockItems,
      realContentSeconds: blockContentRealSeconds,
      realTotalWithTanda: blockContentRealSeconds + tandaSeconds,
      deviation: getRadioDeviation(blockContentRealSeconds, blockPlannedSeconds)
    };
  });

  const unassignedItems = scenes
    .filter((s) => !s.blockId || !blocks.some((b) => b.id === s.blockId))
    .map((item) => {
      const isElement = item.radioKind === 'elemento';
      let sectionNumber = null;
      if (!isElement) {
        sectionNumber = globalSectionIndex++;
      }
      const realSeconds = getRadioItemRealSeconds(item, interventions);
      return {
        ...item,
        radioKind: item.radioKind || 'seccion',
        isFixed: item.isFixed !== undefined ? item.isFixed : true,
        pautaItems: item.pautaItems || [],
        sectionNumber,
        realSeconds,
        deviation: getRadioDeviation(realSeconds, Number(item.plannedSeconds) || 0)
      };
    });

  return {
    blocks: structuredBlocks,
    unassignedItems,
    totalSections: globalSectionIndex - 1,
    totalTandasSeconds: getRadioTandasTotalSeconds(project),
    totalProgramRealSeconds: getRadioProgramRealTotalSeconds(project)
  };
};

// ==========================================
// 5. PARSEADORES DE IMPORTACIÓN
// ==========================================

export const parseGuionMarkdownPaste = (text) => {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n');
  const rows = [];

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) return;
    const cols = line.split('|').map((c) => c.trim()).slice(1, -1);
    if (cols.length < 5) return;
    if (
      /^[-:\s]+$/.test(cols[0]) ||
      /^(N[°o]|RESPONSABLE|AUDIO|T\.?P\.?|T\.?A\.?)$/i.test(cols[0]) ||
      /^(RESPONSABLE)$/i.test(cols[1])
    ) {
      return;
    }

    const responsible = cols[1] || '';
    const content = cols[2] || '';
    const tpRaw = cols[3] || '0';
    const tp = parsePlannedDuration(tpRaw, 'sec');

    if (responsible || content) {
      rows.push({
        id: generateId(),
        responsible: responsible.toUpperCase(),
        content,
        tp
      });
    }
  });

  return rows;
};

// ==========================================
// 6. FILA DE INTERVENCIÓN DEL GUION
// ==========================================

function InterventionRow({
  intervention,
  isFirst,
  isLast,
  projectPeople = [],
  onUpdate,
  onDelete,
  onMove,
  isRadioProgram = false
}) {
  const respUpper = (intervention.responsible || '').trim().toUpperCase();
  const isSpecial = respUpper === 'CONTROL' || respUpper === 'EFECTO';

  return (
    <div className="flex items-start text-xs border-b border-gray-200 py-1.5 hover:bg-neutral-50 transition-colors group/row font-courier">
      <div className="w-12 text-center text-gray-500 font-bold pt-2 shrink-0 select-none">
        {intervention.startLine || 1}
      </div>

      <div className="w-48 px-2 shrink-0">
        <input
          list={`people-list-${intervention.id}`}
          type="text"
          value={intervention.responsible || ''}
          onChange={(e) => onUpdate({ ...intervention, responsible: e.target.value.toUpperCase() })}
          placeholder="RESPONSABLE..."
          className="w-full bg-transparent font-bold text-black border-b border-transparent focus:border-[var(--accent)] outline-none py-1.5 uppercase tracking-wide"
        />
        <datalist id={`people-list-${intervention.id}`}>
          <option value="CONTROL" />
          <option value="EFECTO" />
          {projectPeople.map((p) => (
            <option key={p.id} value={p.displayName || p.realName} />
          ))}
        </datalist>
      </div>

      <div className="flex-1 px-4">
        <textarea
          value={intervention.content || ''}
          onChange={(e) => onUpdate({ ...intervention, content: e.target.value })}
          placeholder="Audio, parlamento o instrucción técnica..."
          rows={Math.max(1, intervention.lines || 1)}
          className={`w-full bg-transparent resize-none border-b border-transparent focus:border-[var(--accent)] outline-none py-1 leading-relaxed ${
            isSpecial ? 'font-bold uppercase underline text-neutral-800' : 'text-neutral-900'
          }`}
        />
      </div>

      <div className="w-16 px-1 text-center shrink-0 pt-1">
        <TimeInput
          seconds={intervention.tp || 0}
          onChange={(tp) => onUpdate({ ...intervention, tp })}
          className="w-full text-center bg-transparent border-b border-transparent focus:border-[var(--accent)] font-bold outline-none text-neutral-800"
        />
      </div>

      <div className="w-20 px-1 text-center font-bold text-neutral-700 shrink-0 pt-2 select-none">
        {formatTA(intervention.computedTA || 0)}
      </div>

      <div className="w-16 flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity pr-2 pt-1 print:hidden shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMove(-1)}
          className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-gray-500"
          title="Subir"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMove(1)}
          className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-gray-500"
          title="Bajar"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-400"
          title="Eliminar fila"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. COMPONENTES Y PESTAÑAS DEL ESPACIO DE TRABAJO
// ==========================================

function PeopleManager({ project, updateProject }) {
  const people = project.people || [];

  const addPerson = () => {
    const newPerson = {
      id: generateId(),
      realName: '',
      displayName: '',
      types: ['LOCUTOR']
    };
    updateProject({ ...project, people: [...people, newPerson] });
  };

  const updatePerson = (id, field, value) => {
    updateProject({
      ...project,
      people: people.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    });
  };

  const deletePerson = (id) => {
    updateProject({
      ...project,
      people: people.filter((p) => p.id !== id)
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)]">Equipo y Personas</h2>
        <button
          onClick={addPerson}
          className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={14} /> Agregar Participante
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4 custom-scrollbar">
        {people.length === 0 ? (
          <div className="p-12 border border-[var(--divider)] rounded text-center text-sm text-[var(--text-sec)] bg-[var(--bg-surface)]">
            No hay participantes configurados aún.
          </div>
        ) : (
          people.map((p) => (
            <div key={p.id} className="p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex items-center gap-4">
              <input
                type="text"
                value={p.realName}
                onChange={(e) => updatePerson(p.id, 'realName', capitalizeName(e.target.value))}
                placeholder="Nombre Completo"
                className="flex-1 bg-transparent border-b border-[var(--divider)] text-sm px-2 py-1 outline-none text-[var(--text-main)] focus:border-[var(--accent)]"
              />
              <input
                type="text"
                value={p.displayName}
                onChange={(e) => updatePerson(p.id, 'displayName', e.target.value.toUpperCase())}
                placeholder="Identificador en Guion (Ej. LOC 1)"
                className="w-56 bg-transparent border-b border-[var(--divider)] text-sm px-2 py-1 outline-none text-[var(--text-main)] uppercase font-mono focus:border-[var(--accent)]"
              />
              <ConfirmButton icon={Trash2} onClick={() => deletePerson(p.id)} className="text-[var(--text-sec)] hover:text-red-500" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EstructuraProgramaManager({ project, updateProject, onNavigateToGuion }) {
  const blocks = project?.radio?.blocks || [];

  const addBlock = () => {
    const newBlock = {
      id: generateId(),
      name: `Bloque ${blocks.length + 1}`,
      plannedSeconds: 600,
      tandaSeconds: 120
    };
    updateProject({
      ...project,
      radio: { ...project.radio, blocks: [...blocks, newBlock] }
    });
  };

  const updateBlock = (id, field, value) => {
    updateProject({
      ...project,
      radio: {
        ...project.radio,
        blocks: blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b))
      }
    });
  };

  const deleteBlock = (id) => {
    updateProject({
      ...project,
      radio: { ...project.radio, blocks: blocks.filter((b) => b.id !== id) }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)]">Estructura del Programa (Bloques)</h2>
        <button
          onClick={addBlock}
          className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={14} /> Añadir Bloque
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4 custom-scrollbar">
        {blocks.length === 0 ? (
          <div className="p-12 border border-[var(--divider)] rounded text-center text-sm text-[var(--text-sec)] bg-[var(--bg-surface)]">
            No hay bloques registrados. Pulsa "Añadir Bloque" para comenzar.
          </div>
        ) : (
          blocks.map((b, i) => (
            <div key={b.id} className="p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex items-center justify-between gap-4">
              <span className="font-bold text-xs text-[var(--text-sec)] font-mono">B{i + 1}</span>
              <input
                type="text"
                value={b.name}
                onChange={(e) => updateBlock(b.id, 'name', e.target.value)}
                className="flex-1 bg-transparent border-b border-[var(--divider)] text-sm px-2 py-1 outline-none text-[var(--text-main)] focus:border-[var(--accent)] font-medium"
              />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-sec)]">Previsto:</span>
                <TimeInput
                  seconds={b.plannedSeconds}
                  onChange={(s) => updateBlock(b.id, 'plannedSeconds', s)}
                  className="w-16 border-b border-[var(--divider)] text-center text-[var(--text-main)] font-mono outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <span>Tanda:</span>
                <TimeInput
                  seconds={b.tandaSeconds}
                  onChange={(s) => updateBlock(b.id, 'tandaSeconds', s)}
                  className="w-16 border-b border-[var(--divider)] text-center text-amber-700 font-mono outline-none"
                />
              </div>
              <ConfirmButton icon={Trash2} onClick={() => deleteBlock(b.id)} className="text-[var(--text-sec)] hover:text-red-500" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PautaManager({ project, updateProject, onNavigateToGuion }) {
  const scenes = project.scenes || [];
  const blocks = project?.radio?.blocks || [];

  const addPautaItem = () => {
    const newScene = {
      id: generateId(),
      blockId: blocks[0]?.id || '',
      title: 'Nueva Sección',
      radioKind: 'seccion',
      sectionType: 'Miscelánea',
      plannedSeconds: 180,
      pautaItems: []
    };
    updateProject({ ...project, scenes: [...scenes, newScene] });
  };

  const updateScene = (id, field, value) => {
    updateProject({
      ...project,
      scenes: scenes.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    });
  };

  const deleteScene = (id) => {
    updateProject({
      ...project,
      scenes: scenes.filter((s) => s.id !== id),
      interventions: (project.interventions || []).filter((i) => i.sceneId !== id)
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)]">Pauta y Secciones</h2>
        <button
          onClick={addPautaItem}
          className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={14} /> Añadir Sección a Pauta
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4 custom-scrollbar">
        {scenes.length === 0 ? (
          <div className="p-12 border border-[var(--divider)] rounded text-center text-sm text-[var(--text-sec)] bg-[var(--bg-surface)]">
            No hay secciones o elementos creados.
          </div>
        ) : (
          scenes.map((s) => (
            <div key={s.id} className="p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex items-center justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={s.title || ''}
                  onChange={(e) => updateScene(s.id, 'title', e.target.value)}
                  className="w-full bg-transparent border-b border-transparent focus:border-[var(--accent)] font-semibold text-sm text-[var(--text-main)] outline-none"
                  placeholder="Título de la sección..."
                />
                <div className="flex items-center gap-4 text-xs text-[var(--text-sec)] mt-1">
                  <span>Tipo: {s.radioKind}</span>
                  <span>Previsto: {formatTA(s.plannedSeconds)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToGuion(s.id)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  Ver en Guion <ArrowRight size={12} />
                </button>
                <ConfirmButton icon={Trash2} onClick={() => deleteScene(s.id)} className="text-[var(--text-sec)] hover:text-red-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EstructuraManager({ project, updateProject, onNavigateToGuion }) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)]">Estructura Narrativa</h2>
      </div>
      <div className="p-12 text-center text-sm text-[var(--text-sec)]">
        Estructura en 3 Actos: Planteamiento, Confrontación y Resolución. Disponible para proyectos de ficción y documentales sonoros.
      </div>
    </div>
  );
}

function EscaletaManager({ project, updateProject, onNavigateToGuion }) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)]">Escaleta</h2>
      </div>
      <div className="p-12 text-center text-sm text-[var(--text-sec)]">
        Módulo de escaleta detallada por escenas dramáticas con sinopsis y acciones.
      </div>
    </div>
  );
}

// ==========================================
// 8. MODAL DE IMPORTACIÓN DE GUION
// ==========================================

const PROMPT_MODAL_3A = `Genera el guion radiofónico como una tabla markdown con EXACTAMENTE 5 columnas: | N° | RESPONSABLE | AUDIO | T.P. | T.A. |
- RESPONSABLE en mayúsculas (CONTROL para efectos, música y cuñas).
- T.P. = duración de esa intervención en formato 20” o 04’40”.
- Las instrucciones técnicas van en filas con responsable CONTROL.
- No es necesario numerar las líneas.`;

function ImportarGuionModal({ onClose, onImport, targetScenes = [] }) {
  const [text, setText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [selectedSceneId, setSelectedSceneId] = useState(targetScenes[0]?.id || '');

  useEffect(() => {
    setParsedRows(parseGuionMarkdownPaste(text));
  }, [text]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-surface)] border border-[var(--divider)] w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--divider)] bg-[var(--bg-main)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Upload size={18} className="text-[var(--accent)]" /> Importar intervenciones al guion
            </h3>
            <p className="text-xs text-[var(--text-sec)] mt-0.5">
              Pega una tabla Markdown de 5 columnas. Se agregará al final de la escena o ítem seleccionado.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-sec)]">
                Tabla Markdown
              </label>
              <div className="flex items-center gap-2">
                <CopyPromptButton promptText={PROMPT_MODAL_3A} />
                <button
                  type="button"
                  onClick={() =>
                    setText(
                      `| N° | RESPONSABLE | AUDIO | T.P. | T.A. |\n|---|---|---|---|---|\n| 1 | CONTROL | CUÑA DE PRESENTACIÓN | 15" | 15" |\n| 2 | LOCUTOR | ¡Bienvenidos a una nueva edición del programa! | 20" | 35" |\n| 3 | CONTROL | RÁFAGA MUSICAL | 05" | 40" |`
                    )
                  }
                  className="text-[10px] text-[var(--accent)] hover:underline font-medium"
                >
                  Ejemplo
                </button>
              </div>
            </div>
            {targetScenes.length > 1 && (
              <div className="mb-2">
                <label className="block text-[10px] uppercase font-bold text-[var(--text-sec)] mb-1">Destino en el guion:</label>
                <select
                  value={selectedSceneId}
                  onChange={(e) => setSelectedSceneId(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--divider)] rounded p-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                >
                  {targetScenes.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.label || sc.title || 'Escena'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`| N° | RESPONSABLE | AUDIO | T.P. | T.A. |\n|---|---|---|---|---|\n| 1 | CONTROL | CUÑA DE PRESENTACIÓN | 15" | 15" |\n| 2 | LOCUTOR | ¡Bienvenidos! | 20" | 35" |`}
              className="flex-1 w-full min-h-[260px] p-3 text-xs font-mono bg-[var(--bg-main)] border border-[var(--divider)] rounded resize-none outline-none focus:border-[var(--accent)] focus-ring text-[var(--text-main)] leading-relaxed custom-scrollbar"
            />
          </div>

          <div className="flex flex-col bg-[var(--bg-main)] border border-[var(--divider)] rounded p-4 overflow-y-auto custom-scrollbar max-h-[460px]">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--divider)] mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-sec)]">
                Previsualización de filas
              </span>
              <span className="text-xs text-[var(--text-sec)]">{parsedRows.length} intervenciones</span>
            </div>

            {parsedRows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs text-[var(--text-sec)] italic">
                Pega una tabla Markdown a la izquierda para previsualizar las filas estructuradas.
              </div>
            ) : (
              <div className="space-y-2">
                {parsedRows.map((row, idx) => (
                  <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-2.5 text-xs flex items-start justify-between gap-3 font-mono">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[var(--accent)] text-[11px] block">{row.responsible || 'SIN RESPONSABLE'}:</span>
                      <p className="text-[var(--text-main)] text-xs mt-0.5 truncate">{row.content}</p>
                    </div>
                    <span className="font-bold text-xs bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--divider)] shrink-0">
                      {formatTA(row.tp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-[var(--divider)] bg-[var(--bg-main)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-sec)]">
            {parsedRows.length > 0 ? `Listo para añadir ${parsedRows.length} filas al guion` : 'Ingresa texto para importar'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors outline-none focus-ring"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={() => onImport(selectedSceneId, parsedRows)}
              className="bg-[var(--accent)] text-[var(--bg-surface)] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 outline-none focus-ring shadow-sm flex items-center gap-2"
            >
              <Upload size={14} /> Importar al guion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. MODAL DE TELEPROMPTER
// ==========================================

function TeleprompterModal({ onClose, timelineItems = [], isRadioProgram = false }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('teleprompter_size');
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 20 && parsed <= 120 ? parsed : 48;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const scrollContainerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const updateFontSize = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(120, Math.max(20, prev + delta));
      localStorage.setItem('teleprompter_size', next.toString());
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (scrollContainerRef.current) {
        const pixelsPerSecond = speed * 25;
        scrollContainerRef.current.scrollTop += (pixelsPerSecond * elapsed) / 1000;
      }
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col select-none animate-in fade-in duration-200">
      <div className="h-16 px-6 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between shrink-0 z-10 text-neutral-300">
        <div className="flex items-center gap-2">
          <Monitor size={18} className="text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 hidden sm:inline">
            Modo Teleprompter
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors outline-none focus-ring ${
              isPlaying ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            <span>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Vel:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
              className="w-20 accent-[var(--accent)] cursor-pointer"
            />
            <span className="font-mono text-xs w-4 text-center">{speed}</span>
          </div>

          <div className="flex items-center gap-1 bg-neutral-800 rounded p-1 border border-neutral-700">
            <button
              type="button"
              onClick={() => updateFontSize(-4)}
              disabled={fontSize <= 20}
              className="px-2 py-0.5 text-xs font-bold hover:text-white disabled:opacity-30 rounded hover:bg-neutral-700 transition-colors"
            >
              A−
            </button>
            <span className="font-mono text-[11px] px-1 text-neutral-400 min-w-[36px] text-center">{fontSize}px</span>
            <button
              type="button"
              onClick={() => updateFontSize(4)}
              disabled={fontSize >= 120}
              className="px-2 py-0.5 text-xs font-bold hover:text-white disabled:opacity-30 rounded hover:bg-neutral-700 transition-colors"
            >
              A+
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors outline-none focus-ring flex items-center gap-1.5"
        >
          <X size={18} />
          <span className="text-xs hidden sm:inline">Cerrar</span>
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-8 md:px-24 py-20 custom-scrollbar select-text">
        <div className="max-w-4xl mx-auto space-y-12">
          {timelineItems.length === 0 ? (
            <div className="py-24 text-center text-neutral-500 italic text-lg">
              No hay intervenciones registradas en el guion.
            </div>
          ) : (
            timelineItems.map((entry) => {
              if (entry.type === 'tanda') {
                return (
                  <div
                    key={entry.id}
                    className="py-4 my-8 px-6 bg-amber-950/40 border border-amber-800/60 rounded text-center text-amber-300 font-mono text-sm font-bold tracking-wider uppercase"
                  >
                    *** TANDA DE PUBLICIDAD ({formatTA(entry.duration)}) ***
                  </div>
                );
              }

              const headerTitle = isRadioProgram
                ? entry.isSection
                  ? `BLOQUE ${entry.blockNumber || 1} · SECCIÓN ${entry.sectionNumber}: ${(entry.title || 'SIN TÍTULO').toUpperCase()}`
                  : `BLOQUE ${entry.blockNumber || 1} · ${(entry.title || 'ELEMENTO').toUpperCase()}`
                : `ESCENA ${String(entry.absoluteIndex || 1).padStart(2, '0')}: ${entry.intExt || ''} ${entry.location || ''} ${entry.timeOfDay ? '— ' + entry.timeOfDay : ''}`;

              return (
                <div key={entry.id} className="space-y-8">
                  <div className="pt-8 pb-3 border-b border-neutral-800">
                    <span className="text-xs uppercase tracking-widest font-bold text-[var(--accent)] font-mono">
                      {headerTitle}
                    </span>
                  </div>

                  {entry.interventions && entry.interventions.length > 0 ? (
                    entry.interventions.map((inv) => {
                      const respUpper = (inv.responsible || '').trim().toUpperCase();
                      const isTech = respUpper === 'CONTROL' || respUpper === 'EFECTO';

                      if (isTech) {
                        return (
                          <div
                            key={inv.id}
                            className="py-2 px-4 rounded bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 font-mono text-sm leading-relaxed"
                          >
                            <span className="font-bold underline text-neutral-300 mr-2">{respUpper}:</span>
                            <span className="uppercase">{inv.content}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={inv.id} className="space-y-2">
                          <div className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono">
                            {respUpper || 'VOZ'}
                          </div>
                          <div
                            style={{ fontSize: `${fontSize}px`, lineHeight: 1.25 }}
                            className="font-normal text-white tracking-wide"
                          >
                            {inv.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-neutral-600 italic">Sin intervenciones</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. GESTOR PRINCIPAL DE GUION
// ==========================================

function GuionManager({ project, updateProject, targetSceneId, isRadioProgram = false, onNavigateToTab = null }) {
  const rawInterventions = project.interventions || [];
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  let timelineItems = [];
  let currentTA = 0;
  let currentLine = 1;

  if (isRadioProgram) {
    const radioStructure = getOrderedRadioStructure(project);

    radioStructure.blocks.forEach((block, bIdx) => {
      block.items.forEach((item) => {
        const sceneInvs = rawInterventions
          .filter((i) => i.sceneId === item.id)
          .sort((a, b) => a.order - b.order)
          .map((inv) => {
            currentTA += inv.tp || 0;
            const lines = estimateVisualLines(inv);
            const startLine = currentLine;
            currentLine += lines;
            return { ...inv, computedTA: currentTA, startLine, lines };
          });

        timelineItems.push({
          type: 'scene',
          id: item.id,
          blockNumber: bIdx + 1,
          blockName: block.name || `Bloque ${bIdx + 1}`,
          isSection: item.radioKind !== 'elemento',
          sectionNumber: item.sectionNumber,
          title: item.title,
          sectionType: item.sectionType,
          plannedSeconds: item.plannedSeconds || 0,
          realSeconds: item.realSeconds || 0,
          deviation: item.deviation || 0,
          pautaItems: item.pautaItems || [],
          interventions: sceneInvs
        });
      });

      const tandaSecs = Number(block.tandaSeconds) || 0;
      if (tandaSecs > 0) {
        currentTA += tandaSecs;
        timelineItems.push({
          type: 'tanda',
          id: `tanda-${block.id}`,
          blockNumber: bIdx + 1,
          duration: tandaSecs,
          computedTA: currentTA
        });
      }
    });

    if (radioStructure.unassignedItems?.length > 0) {
      radioStructure.unassignedItems.forEach((item) => {
        const sceneInvs = rawInterventions
          .filter((i) => i.sceneId === item.id)
          .sort((a, b) => a.order - b.order)
          .map((inv) => {
            currentTA += inv.tp || 0;
            const lines = estimateVisualLines(inv);
            const startLine = currentLine;
            currentLine += lines;
            return { ...inv, computedTA: currentTA, startLine, lines };
          });

        timelineItems.push({
          type: 'scene',
          id: item.id,
          blockNumber: null,
          blockName: 'Sin Bloque',
          isSection: item.radioKind !== 'elemento',
          sectionNumber: item.sectionNumber,
          title: item.title,
          sectionType: item.sectionType,
          plannedSeconds: item.plannedSeconds || 0,
          realSeconds: item.realSeconds || 0,
          deviation: item.deviation || 0,
          pautaItems: item.pautaItems || [],
          interventions: sceneInvs
        });
      });
    }
  } else {
    const scenes = (project.scenes || []).map((s, index) => ({ ...s, absoluteIndex: index + 1 }));
    timelineItems = scenes.map((scene) => {
      const sceneInvs = rawInterventions
        .filter((i) => i.sceneId === scene.id)
        .sort((a, b) => a.order - b.order)
        .map((inv) => {
          currentTA += inv.tp || 0;
          const lines = estimateVisualLines(inv);
          const startLine = currentLine;
          currentLine += lines;
          return { ...inv, computedTA: currentTA, startLine, lines };
        });

      return {
        type: 'scene',
        ...scene,
        interventions: sceneInvs
      };
    });
  }

  const updateAndSave = (newInterventions) =>
    updateProject({ ...project, interventions: newInterventions, lastModified: new Date().toISOString() });

  const handleUpdateIntervention = (updatedInv) =>
    updateAndSave(rawInterventions.map((i) => (i.id === updatedInv.id ? updatedInv : i)));

  const handleAddScene = () => {
    const newScene = {
      id: generateId(),
      intExt: 'INT.',
      location: 'LUGAR',
      timeOfDay: 'DÍA',
      scenario: '',
      characters: [],
      dialogues: '',
      actions: '',
      act: 'ACTO I',
      marker: '',
      synopsis: ''
    };
    updateProject({
      ...project,
      scenes: [...(project.scenes || []), newScene],
      lastModified: new Date().toISOString()
    });
  };

  const handleUpdateScene = (id, field, value) =>
    updateProject({
      ...project,
      scenes: (project.scenes || []).map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      lastModified: new Date().toISOString()
    });

  const handleDeleteScene = (id) =>
    updateProject({
      ...project,
      scenes: (project.scenes || []).filter((s) => s.id !== id),
      interventions: rawInterventions.filter((i) => i.sceneId !== id),
      lastModified: new Date().toISOString()
    });

  const handleAddIntervention = (sceneId) => {
    const sceneInvs = rawInterventions.filter((i) => i.sceneId === sceneId);
    const maxOrder = sceneInvs.reduce((max, i) => Math.max(max, i.order), 0);
    updateAndSave([
      ...rawInterventions,
      { id: generateId(), sceneId, order: maxOrder + 1, responsible: '', content: '', tp: 0 }
    ]);
  };

  const handleDeleteIntervention = (id) => updateAndSave(rawInterventions.filter((i) => i.id !== id));

  const handleMoveIntervention = (id, direction) => {
    const invIndex = rawInterventions.findIndex((i) => i.id === id);
    if (invIndex === -1) return;
    const inv = rawInterventions[invIndex];
    const sceneInvs = rawInterventions.filter((i) => i.sceneId === inv.sceneId).sort((a, b) => a.order - b.order);
    const index = sceneInvs.findIndex((i) => i.id === id);
    if ((direction === -1 && index === 0) || (direction === 1 && index === sceneInvs.length - 1)) return;
    const targetInv = sceneInvs[index + direction];
    updateAndSave(
      rawInterventions.map((i) => {
        if (i.id === inv.id) return { ...i, order: targetInv.order };
        if (i.id === targetInv.id) return { ...i, order: inv.order };
        return i;
      })
    );
  };

  const handleImportParsedGuion = (sceneId, rows) => {
    if (!rows || rows.length === 0) return;
    const targetId = sceneId || (project.scenes && project.scenes[0]?.id);
    if (!targetId) return;

    const sceneInvs = rawInterventions.filter((i) => i.sceneId === targetId);
    let startOrder = sceneInvs.reduce((max, i) => Math.max(max, i.order), 0) + 1;

    const newInvs = rows.map((r, idx) => ({
      id: generateId(),
      sceneId: targetId,
      order: startOrder + idx,
      responsible: r.responsible,
      content: r.content,
      tp: r.tp
    }));

    updateAndSave([...rawInterventions, ...newInvs]);
    setShowImportModal(false);
  };

  const handleExport = async (format) => {
    const isMd = format === 'md';
    const isTxt = format === 'txt';
    if (isMd || isTxt) {
      let content = isMd
        ? `# GUION RADIOFÓNICO: ${project.general?.programName || 'SIN TÍTULO'}\n\n`
        : `GUION RADIOFÓNICO: ${project.general?.programName || 'SIN TÍTULO'}\n\n`;

      timelineItems.forEach((entry) => {
        if (entry.type === 'tanda') {
          const tandaLine = `*** TANDA DE PUBLICIDAD [${formatTA(entry.duration)}] — T.A. Acumulado: ${formatTA(entry.computedTA)} ***`;
          content += isMd ? `> **${tandaLine}**\n\n` : `\n${tandaLine}\n-------------------------------------------------\n\n`;
          return;
        }

        if (isRadioProgram) {
          const headerStr = entry.isSection
            ? `BLOQUE ${entry.blockNumber || 1} — SECCIÓN ${entry.sectionNumber}: ${(entry.title || 'SIN TÍTULO').toUpperCase()}`
            : `BLOQUE ${entry.blockNumber || 1} — ${(entry.title || 'ELEMENTO').toUpperCase()}`;
          content += isMd
            ? `## ${headerStr}\n*Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)}*\n\n`
            : `${headerStr} [Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)}]\n\n`;
        } else {
          content += isMd
            ? `## ESC. ${String(entry.absoluteIndex).padStart(2, '0')} / ${entry.intExt} — ${entry.location} — ${entry.timeOfDay}\n\n`
            : `ESC. ${String(entry.absoluteIndex).padStart(2, '0')} / ${entry.intExt} — ${entry.location} — ${entry.timeOfDay}\n\n`;
        }

        content += isMd
          ? `| N° | RESPONSABLE | AUDIO | T.P. | T.A. |\n|---|---|---|---|---|\n`
          : `N° | RESPONSABLE | AUDIO | T.P. | T.A.\n-------------------------------------------------\n`;

        entry.interventions.forEach((inv) => {
          const resp = inv.responsible || '';
          const audio = (inv.content || '').replace(/\n/g, ' ');
          const tp = `${inv.tp || 0}"`;
          const ta = formatTA(inv.computedTA);
          const lineStart = inv.startLine;
          if (isMd) content += `| ${lineStart} | **${resp}** | ${audio} | ${tp} | ${ta} |\n`;
          else content += `${lineStart} | ${resp} | ${audio} | ${tp} | ${ta}\n`;
        });
        content += '\n';
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Guion_${project.general?.programName || 'Proyecto'}.${format}`;
      a.click();
    } else if (format === 'doc') {
      let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Guion</title><style>body, td, th, div, h1 { font-family: 'Courier New', Courier, monospace; } body { font-size: 11pt; color: #000; background: #fff; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; table-layout: fixed; } th, td { border: 1px solid #000; padding: 5px; vertical-align: top; } th { background-color: #fff; font-weight: bold; text-align: left; border-bottom: 2px solid #000; border-top: 2px solid #000;} tr { page-break-inside: avoid; page-break-after: auto; } .scene-header { font-weight: bold; font-size: 11pt; margin-top: 30px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px dashed #000; padding-bottom: 5px; page-break-after: avoid; } .tanda-block { font-weight: bold; font-style: italic; background: #f0f0f0; border: 1px solid #000; padding: 8px; margin: 20px 0; text-align: center; page-break-inside: avoid; }</style></head><body><h1 style="text-align: center; text-transform: uppercase;">GUION RADIOFÓNICO:<br>${project.general?.programName || 'SIN TÍTULO'}</h1>`;
      timelineItems.forEach((entry) => {
        if (entry.type === 'tanda') {
          html += `<div class="tanda-block">*** TANDA DE PUBLICIDAD [${formatTA(entry.duration)}] — T.A. ACUMULADO: ${formatTA(entry.computedTA)} ***</div>`;
          return;
        }

        const headerDisplay = isRadioProgram
          ? entry.isSection
            ? `BLOQUE ${entry.blockNumber || 1} — SECCIÓN ${entry.sectionNumber}: ${(entry.title || 'SIN TÍTULO').toUpperCase()} (Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)})`
            : `BLOQUE ${entry.blockNumber || 1} — ${(entry.title || 'ELEMENTO').toUpperCase()} (Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)})`
          : `ESC. ${String(entry.absoluteIndex).padStart(2, '0')} / ${entry.intExt} — ${entry.location} — ${entry.timeOfDay}`;

        html += `<div class="scene-header">${headerDisplay}</div>`;
        html += `<table>
          <colgroup>
            <col style="width: 6%;" />
            <col style="width: 22%;" />
            <col style="width: 52%;" />
            <col style="width: 10%;" />
            <col style="width: 10%;" />
          </colgroup>
          <thead><tr><th>N°</th><th>RESPONSABLE</th><th>AUDIO</th><th style="text-align: center;">T.P.</th><th style="text-align: center;">T.A.</th></tr></thead><tbody>`;

        entry.interventions.forEach((inv) => {
          let contentHtml = wrapLines(inv.content).join('<br>');
          const respUpper = (inv.responsible || '').trim().toUpperCase();
          const isSpecial = respUpper === 'CONTROL' || respUpper === 'EFECTO';
          if (isSpecial) contentHtml = `<strong style="text-decoration: underline; text-transform: uppercase;">${contentHtml}</strong>`;

          let numbersHtml = '';
          for (let i = 0; i < inv.lines; i++) {
            numbersHtml += `<div style="font-weight:bold; color:#000;">${inv.startLine + i}</div>`;
          }

          const respDisplay = isSpecial ? `<u><strong>${respUpper}:</strong></u>` : `<strong>${(inv.responsible || '').toUpperCase()}:</strong>`;
          html += `<tr><td style="text-align: center;">${numbersHtml}</td><td>${respDisplay}</td><td style="white-space: nowrap; font-size: 9pt;">${contentHtml}</td><td style="text-align: center;"><strong>${formatTA(inv.tp || 0)}</strong></td><td style="text-align: center;"><strong>${formatTA(inv.computedTA)}</strong></td></tr>`;
        });
        html += `</tbody></table>`;
      });
      html += `</body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Guion_${project.general?.programName || 'Proyecto'}.${format}`;
      a.click();
    } else if (format === 'pdf') {
      try {
        const html2pdf = await loadHtml2Pdf();
        const element = document.createElement('div');
        element.style.fontFamily = "'Courier New', Courier, monospace";
        element.style.color = '#000';
        element.style.backgroundColor = '#fff';
        element.style.padding = '10px';
        element.style.width = '100%';

        let html = `<style>*{ font-family: 'Courier New', Courier, monospace !important; }</style>
        <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; break-after: page; text-align: center;">
          <h1 style="text-transform: uppercase; font-size: 24pt; font-weight: bold; margin-bottom: 25px;">GUION RADIOFÓNICO<br><br>${project.general?.programName || 'SIN TÍTULO'}</h1>
        </div>`;

        timelineItems.forEach((entry) => {
          if (entry.type === 'tanda') {
            html += `<div style="page-break-inside: avoid; margin: 25px 0; padding: 12px; background: #f3f3f3; border: 2px dashed #444; text-align: center; font-weight: bold; font-size: 11pt;">
              *** TANDA DE PUBLICIDAD [${formatTA(entry.duration)}] &mdash; T.A. ACUMULADO: ${formatTA(entry.computedTA)} ***
            </div>`;
            return;
          }

          html += `<div style="page-break-inside: auto; margin-bottom: 35px;">`;
          const headerDisplay = isRadioProgram
            ? entry.isSection
              ? `BLOQUE ${entry.blockNumber || 1} — SECCIÓN ${entry.sectionNumber}: ${(entry.title || 'SIN TÍTULO').toUpperCase()} &nbsp;&nbsp;<span style="font-size: 9pt; font-weight: normal; color: #555;">[Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)}]</span>`
              : `BLOQUE ${entry.blockNumber || 1} — ${(entry.title || 'ELEMENTO').toUpperCase()} &nbsp;&nbsp;<span style="font-size: 9pt; font-weight: normal; color: #555;">[Plan: ${formatTA(entry.plannedSeconds)} | Real: ${formatTA(entry.realSeconds)}]</span>`
            : `ESC. ${String(entry.absoluteIndex).padStart(2, '0')} / ${entry.intExt} — ${entry.location} — ${entry.timeOfDay}`;

          html += `<div style="font-weight: bold; font-size: 11pt; margin-bottom: 15px; text-transform: uppercase; page-break-after: avoid;">${headerDisplay}</div>`;

          if (entry.interventions && entry.interventions.length > 0) {
            html += `<table style="width: 100%; border-collapse: collapse; page-break-inside: auto; table-layout: fixed;">
              <colgroup>
                <col style="width: 6%;" />
                <col style="width: 22%;" />
                <col style="width: 52%;" />
                <col style="width: 10%;" />
                <col style="width: 10%;" />
              </colgroup>
              <thead style="display: table-header-group;">
                <tr>
                  <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 8px 4px; font-size: 10pt;">N°</th>
                  <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 4px; font-size: 10pt;">RESPONSABLE</th>
                  <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 4px; font-size: 10pt;">AUDIO</th>
                  <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 8px 4px; font-size: 10pt;">T.P.</th>
                  <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 8px 4px; font-size: 10pt;">T.A.</th>
                </tr>
              </thead>
              <tbody>`;

            entry.interventions.forEach((inv) => {
              let contentHtml = wrapLines(inv.content).join('<br>');
              const respUpper = (inv.responsible || '').trim().toUpperCase();
              const isSpecial = respUpper === 'CONTROL' || respUpper === 'EFECTO';
              if (isSpecial) contentHtml = `<strong style="text-decoration: underline; text-transform: uppercase;">${contentHtml}</strong>`;

              let numbersHtml = '';
              for (let i = 0; i < inv.lines; i++) {
                numbersHtml += `<div style="font-weight:bold; color:#000;">${inv.startLine + i}</div>`;
              }

              const respDisplay = isSpecial ? `<u><strong>${respUpper}:</strong></u>` : `<strong>${(inv.responsible || '').toUpperCase()}:</strong>`;

              html += `<tr style="page-break-inside: avoid;">
                <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 11pt; text-align: center;">${numbersHtml}</td>
                <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 11pt;">${respDisplay}</td>
                <td style="padding: 10px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 9pt; white-space: nowrap;">${contentHtml}</td>
                <td style="padding: 10px 4px; vertical-align: top; text-align: center; border-bottom: 1px solid #ddd; font-size: 11pt;"><strong>${formatTA(inv.tp || 0)}</strong></td>
                <td style="padding: 10px 4px; vertical-align: top; text-align: center; border-bottom: 1px solid #ddd; font-size: 11pt;"><strong>${formatTA(inv.computedTA)}</strong></td>
              </tr>`;
            });
            html += `</tbody></table>`;
          } else {
            html += `<div style="color: #777; font-style: italic; font-size: 10pt;">(Sin intervenciones registradas)</div>`;
          }
          html += `</div>`;
        });

        element.innerHTML = html;
        await html2pdf()
          .set({
            margin: [0.75, 0.5, 0.75, 0.5],
            filename: `Guion_${project.general?.programName || 'Proyecto'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          })
          .from(element)
          .save();
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (targetSceneId) {
      setTimeout(() => {
        const el = document.getElementById(`guion-scene-${targetSceneId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('bg-blue-50');
          setTimeout(() => el.classList.remove('bg-blue-50'), 2000);
        }
      }, 100);
    }
  }, [targetSceneId]);

  const plannedSeconds = parsePlannedDuration(project.general?.duration);
  const diffSeconds = currentTA - plannedSeconds;
  let diffFormatted = '';
  if (plannedSeconds === 0) diffFormatted = '--';
  else if (diffSeconds === 0) diffFormatted = 'Exacto';
  else diffFormatted = `${diffSeconds > 0 ? '+' : '-'}${formatTA(Math.abs(diffSeconds))}`;

  const availableScenesForImport = (project.scenes || []).map((sc) => ({
    id: sc.id,
    label: formatSceneOrItemLabel(sc.id, project) + (sc.title ? ` - ${sc.title}` : sc.location ? ` - ${sc.location}` : '')
  }));

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <div className="h-16 px-8 flex justify-between items-center z-30 shrink-0 print:hidden border-b border-[var(--divider)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-medium hidden md:block">Documento de Guion</h2>
          <div className="flex items-center gap-4 text-xs font-medium border border-[var(--divider)] rounded px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-sec)]">
            <span>Previsto: {project.general?.duration || '--:--'}</span>
            <span className="text-[var(--divider)]">|</span>
            <span className={plannedSeconds > 0 ? (diffSeconds > 0 ? 'text-red-500' : 'text-green-600') : ''}>
              Calculado: {formatTA(currentTA)} ({diffFormatted})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTeleprompter(true)}
            disabled={timelineItems.length === 0}
            className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] px-3.5 py-2 rounded text-xs font-medium transition-colors outline-none flex items-center gap-1.5 focus-ring disabled:opacity-40"
            title="Abrir vista de teleprompter a pantalla completa"
          >
            <Monitor size={14} strokeWidth={2} /> <span className="hidden sm:inline">Teleprompter</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            disabled={(project.scenes || []).length === 0}
            className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] px-3.5 py-2 rounded text-xs font-medium transition-colors outline-none flex items-center gap-1.5 focus-ring disabled:opacity-40"
            title="Importar intervenciones desde una tabla Markdown"
          >
            <Upload size={14} strokeWidth={2} /> <span className="hidden sm:inline">Importar guion</span>
          </button>

          {isRadioProgram ? (
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('programa')}
              className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] px-4 py-2 rounded text-xs font-medium transition-colors outline-none flex items-center gap-2 focus-ring"
            >
              <Radio size={14} strokeWidth={2} className="shrink-0 text-[var(--accent)]" />{' '}
              <span className="hidden sm:inline">Ir a Estructura del Programa</span>
            </button>
          ) : (
            <button
              onClick={handleAddScene}
              className="bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-2 focus-ring"
            >
              <Plus size={14} strokeWidth={2} className="shrink-0" /> <span className="hidden sm:inline">Nueva Escena</span>
            </button>
          )}
          <ExportDropdown onExport={handleExport} className="hidden sm:block" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 print:p-0 bg-[#e2e8f0] print:bg-white custom-scrollbar">
        {timelineItems.length === 0 ? (
          <div className="border border-[var(--divider)] rounded p-16 flex flex-col items-center justify-center bg-white max-w-2xl mx-auto shadow-sm">
            <span className="text-sm font-medium text-gray-500 mb-6">
              {isRadioProgram ? 'Programa sin secciones o bloques' : 'Documento en Blanco'}
            </span>
            {isRadioProgram ? (
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('programa')}
                className="text-sm font-medium text-gray-800 border-b border-gray-800 hover:text-black outline-none focus-ring"
              >
                Configurar Estructura del Programa
              </button>
            ) : (
              <button
                onClick={handleAddScene}
                className="text-sm font-medium text-gray-800 border-b border-gray-800 hover:text-black outline-none focus-ring"
              >
                Añadir Primera Escena
              </button>
            )}
          </div>
        ) : (
          <div id="guion-pdf-container" className="max-w-[950px] mx-auto bg-white overflow-hidden overflow-x-auto print:border-none print:max-w-none text-black font-courier shadow-sm border border-gray-300 pb-24">
            <div className="min-w-[800px]">
              {timelineItems.map((entry) => {
                if (entry.type === 'tanda') {
                  return (
                    <div
                      key={entry.id}
                      className="mx-10 lg:mx-14 my-8 p-3.5 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded font-sans flex items-center justify-between text-xs text-amber-950 print:bg-gray-100 print:border-gray-400"
                    >
                      <div className="flex items-center gap-2 font-bold tracking-wide uppercase">
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">TANDA DE PUBLICIDAD</span>
                        <span>Bloque {entry.blockNumber}</span>
                      </div>
                      <div className="flex items-center gap-6 font-mono font-semibold">
                        <span>Duración: +{formatTA(entry.duration)}</span>
                        <span className="text-gray-600">T.A. Acumulado: {formatTA(entry.computedTA)}</span>
                      </div>
                    </div>
                  );
                }

                const scene = entry;
                const isOverTime = scene.plannedSeconds > 0 && scene.deviation > 0;

                return (
                  <div key={scene.id} id={`guion-scene-${scene.id}`} className="transition-colors print:break-inside-avoid relative pt-16 px-10 lg:px-14 group/scene">
                    <div className="mb-4 flex justify-between items-start font-sans">
                      {isRadioProgram ? (
                        <div className="flex-1 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#242424] text-white">
                              BLOQUE {scene.blockNumber || 1}
                            </span>
                            <span className="text-sm font-bold text-black tracking-wide">
                              {scene.isSection ? `SECCIÓN ${scene.sectionNumber}: ${scene.title || 'SIN TÍTULO'}` : scene.title || 'ELEMENTO'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-gray-500">
                              Plan: <strong className="text-black">{formatTA(scene.plannedSeconds)}</strong>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                              Real: <strong className={isOverTime ? 'text-red-600 font-bold' : 'text-black'}>{formatTA(scene.realSeconds)}</strong>
                            </span>
                            {scene.plannedSeconds > 0 && (
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                  isOverTime ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {scene.deviation > 0 ? `+${formatTA(scene.deviation)}` : scene.deviation < 0 ? `-${formatTA(Math.abs(scene.deviation))}` : '0"'}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 text-sm tracking-wide mb-2 font-semibold text-black">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>ESC. {String(scene.absoluteIndex).padStart(2, '0')} /</span>
                              <select
                                value={scene.intExt || 'INT.'}
                                onChange={(e) => handleUpdateScene(scene.id, 'intExt', e.target.value)}
                                className="bg-transparent hover:bg-gray-100 outline-none cursor-pointer print:appearance-none border-b border-transparent focus:border-gray-300 text-black rounded px-1 py-0.5 focus-ring"
                              >
                                <option value="INT.">INT.</option>
                                <option value="EXT.">EXT.</option>
                                <option value="INT/EXT.">INT/EXT.</option>
                              </select>
                              <span>—</span>
                              <input
                                type="text"
                                value={scene.location || ''}
                                onChange={(e) => handleUpdateScene(scene.id, 'location', e.target.value.toUpperCase())}
                                className="bg-transparent hover:bg-gray-100 outline-none placeholder-gray-400 w-48 border-b border-transparent focus:border-gray-300 px-1 py-0.5 text-black rounded focus-ring"
                                placeholder="LUGAR..."
                              />
                              <span>—</span>
                              <input
                                type="text"
                                value={scene.timeOfDay || ''}
                                onChange={(e) => handleUpdateScene(scene.id, 'timeOfDay', e.target.value.toUpperCase())}
                                className="bg-transparent hover:bg-gray-100 outline-none placeholder-gray-400 w-32 border-b border-transparent focus:border-gray-300 px-1 py-0.5 text-black rounded focus-ring"
                                placeholder="DÍA/NOCHE"
                              />
                            </div>
                          </div>
                          <ConfirmButton
                            icon={Trash2}
                            onClick={() => handleDeleteScene(scene.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 print:hidden opacity-0 group-hover/scene:opacity-100 outline-none rounded hover:bg-gray-100 ml-4 transition-all"
                          />
                        </>
                      )}
                    </div>

                    <div className="sticky top-0 z-10 bg-white border-y border-gray-300 flex text-[13px] font-courier font-bold py-2 mb-2 text-black shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                      <div className="w-12 text-center shrink-0">N°</div>
                      <div className="w-48 px-4 shrink-0">RESPONSABLE</div>
                      <div className="flex-1 px-5">AUDIO</div>
                      <div className="w-16 text-center shrink-0">T.P.</div>
                      <div className="w-20 text-center shrink-0">T.A.</div>
                    </div>

                    <div>
                      {scene.interventions.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm font-courier italic">Escribe la primera línea...</div>
                      ) : (
                        scene.interventions.map((inv, index) => (
                          <InterventionRow
                            key={inv.id}
                            intervention={inv}
                            isFirst={index === 0}
                            isLast={index === scene.interventions.length - 1}
                            projectPeople={project.people || []}
                            onUpdate={handleUpdateIntervention}
                            onDelete={() => handleDeleteIntervention(inv.id)}
                            onMove={(dir) => handleMoveIntervention(inv.id, dir)}
                            isRadioProgram={isRadioProgram}
                          />
                        ))
                      )}
                    </div>

                    <div className="py-6 flex justify-center print:hidden font-sans border-b border-dashed border-gray-200">
                      <button
                        onClick={() => handleAddIntervention(scene.id)}
                        className="bg-transparent border border-gray-300 text-gray-500 rounded text-xs font-medium px-4 py-2 hover:border-gray-500 hover:text-black transition-colors flex items-center gap-2 outline-none focus-ring"
                      >
                        <Plus size={14} className="shrink-0" /> Insertar Fila
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showImportModal && (
        <ImportarGuionModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportParsedGuion}
          targetScenes={availableScenesForImport}
        />
      )}

      {showTeleprompter && (
        <TeleprompterModal
          onClose={() => setShowTeleprompter(false)}
          timelineItems={timelineItems}
          isRadioProgram={isRadioProgram}
        />
      )}
    </div>
  );
}

// ==========================================
// 11. INVENTARIO SONORO (RECURSOS)
// ==========================================

function ResourcesManager({ project, updateProject }) {
  const [activeTab, setActiveTab] = useState('effects');
  const effects = project.soundEffects || [];
  const music = project.music || [];
  const scenes = project.scenes || [];
  const interventions = project.interventions || [];
  const musicStats = {};
  const effectsStats = {};

  const trackUsage = (dict, name, sceneObj) => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 3) return;
    const key = cleanName.toLowerCase();
    if (!dict[key]) dict[key] = { originalName: cleanName, count: 0, scenes: new Set() };
    dict[key].count++;
    if (sceneObj) {
      const label = formatSceneOrItemLabel(sceneObj.id, project);
      if (label && label !== '-') {
        dict[key].scenes.add(label);
      }
    }
  };

  scenes.forEach((scene) => {
    effects.forEach((fx) => {
      if (fx.name.length >= 3 && scene.scenario && scene.scenario.toLowerCase().includes(fx.name.toLowerCase())) {
        trackUsage(effectsStats, fx.name, scene);
      }
    });
    music.forEach((m) => {
      if (m.name.length >= 3 && scene.scenario && scene.scenario.toLowerCase().includes(m.name.toLowerCase())) {
        trackUsage(musicStats, m.name, scene);
      }
    });
  });

  interventions.forEach((inv) => {
    const sceneObj = scenes.find((s) => s.id === inv.sceneId);
    effects.forEach((fx) => {
      if (fx.name.length >= 3 && inv.content && inv.content.toLowerCase().includes(fx.name.toLowerCase())) {
        trackUsage(effectsStats, fx.name, sceneObj);
      }
    });
    music.forEach((m) => {
      if (m.name.length >= 3 && inv.content && inv.content.toLowerCase().includes(m.name.toLowerCase())) {
        trackUsage(musicStats, m.name, sceneObj);
      }
    });

    if (inv.content) {
      for (const m of inv.content.matchAll(/MÚSICA\s*(?:\([^)]+\))?\s*\[(.*?)\]/gi)) {
        trackUsage(musicStats, m[1], sceneObj);
      }
      for (const e of inv.content.matchAll(/EFECTO\s*(?:\([^)]+\))?\s*\[(.*?)\]/gi)) {
        trackUsage(effectsStats, e[1], sceneObj);
      }
    }
  });

  const getUsage = (dict, name) => {
    const key = (name || '').trim().toLowerCase();
    const stat =
      dict[key] ||
      Object.values(dict).find(
        (s) => s.originalName.toLowerCase().includes(key) || key.includes(s.originalName.toLowerCase())
      );
    return stat ? { count: stat.count, scenes: Array.from(stat.scenes).join(', ') } : { count: 0, scenes: '-' };
  };

  const handleUpdateEffect = (id, field, value) =>
    updateProject({
      ...project,
      soundEffects: effects.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      lastModified: new Date().toISOString()
    });

  const handleDeleteEffect = (id) =>
    updateProject({
      ...project,
      soundEffects: effects.filter((e) => e.id !== id),
      lastModified: new Date().toISOString()
    });

  const handleUpdateMusic = (id, field, value) =>
    updateProject({
      ...project,
      music: music.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      lastModified: new Date().toISOString()
    });

  const handleDeleteMusic = (id) =>
    updateProject({
      ...project,
      music: music.filter((m) => m.id !== id),
      lastModified: new Date().toISOString()
    });

  const handleAddEffect = () => {
    const newFx = { id: generateId(), name: 'Nuevo Efecto', category: 'ANTHROPOPHONY', description: '' };
    updateProject({ ...project, soundEffects: [newFx, ...effects], lastModified: new Date().toISOString() });
  };

  const handleAddMusic = () => {
    const newM = { id: generateId(), name: 'Nueva Pista', artist: '', duration: 0, introSeconds: 0, description: '' };
    updateProject({ ...project, music: [newM, ...music], lastModified: new Date().toISOString() });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="h-16 px-8 flex justify-between items-center border-b border-[var(--divider)] bg-[var(--bg-surface)] z-20 shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-main)] hidden md:block">Inventario Sonoro</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('effects')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider outline-none focus-ring transition-colors ${
                activeTab === 'effects' ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              Efectos (Fx)
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider outline-none focus-ring transition-colors ${
                activeTab === 'music' ? 'bg-[var(--accent)] text-[var(--bg-surface)]' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              Música (M)
            </button>
          </div>
          <div className="w-px h-6 bg-[var(--divider)] hidden sm:block"></div>
          {activeTab === 'effects' ? (
            <button
              onClick={handleAddEffect}
              className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors flex items-center gap-1"
            >
              <Plus size={12} strokeWidth={2} /> Añadir Efecto
            </button>
          ) : (
            <button
              onClick={handleAddMusic}
              className="bg-transparent border border-[var(--divider)] text-[var(--text-main)] px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider hover:border-[var(--accent)] transition-colors flex items-center gap-1"
            >
              <Plus size={12} strokeWidth={2} /> Añadir Música
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        {activeTab === 'effects' && (
          <div className="max-w-6xl mx-auto space-y-10">
            {effects.length === 0 ? (
              <div className="p-16 border border-[var(--divider)] rounded text-center text-sm font-medium text-[var(--text-sec)] bg-[var(--bg-surface)]">
                Inventario Vacío
              </div>
            ) : (
              <div className="border border-[var(--divider)] bg-[var(--bg-surface)] rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-b border-[var(--divider)] bg-[var(--bg-main)]">
                      <th className="p-4 w-12 text-center">N°</th>
                      <th className="p-4 w-1/4">Efecto</th>
                      <th className="p-4 w-48">Escenas</th>
                      <th className="p-4 w-24 text-center">Uso</th>
                      <th className="p-4 w-48">Categoría</th>
                      <th className="p-4">Notas</th>
                      <th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)] text-sm font-medium text-[var(--text-main)]">
                    {effects.map((effect, index) => {
                      const usage = getUsage(effectsStats, effect.name);
                      return (
                        <tr key={effect.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                          <td className="p-4 text-center text-[var(--text-sec)]">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={effect.name}
                              onChange={(e) => handleUpdateEffect(effect.id, 'name', e.target.value)}
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1"
                            />
                          </td>
                          <td className="p-4 text-xs text-[var(--text-sec)]">{usage.scenes}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent)] text-[var(--bg-surface)]">
                              {usage.count}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={effect.category}
                              onChange={(e) => handleUpdateEffect(effect.id, 'category', e.target.value)}
                              className="w-full text-xs bg-transparent outline-none cursor-pointer"
                            >
                              <option value="BIOPHONY">Biophony</option>
                              <option value="GEOPHONY">Geophony</option>
                              <option value="ANTHROPOPHONY">Anthropophony</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={effect.description}
                              onChange={(e) => handleUpdateEffect(effect.id, 'description', e.target.value)}
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1 text-xs"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <ConfirmButton icon={Trash2} onClick={() => handleDeleteEffect(effect.id)} className="text-[var(--text-sec)] hover:text-red-500" />
                          </td>
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
            {music.length === 0 ? (
              <div className="p-16 border border-[var(--divider)] rounded text-center text-sm font-medium text-[var(--text-sec)] bg-[var(--bg-surface)]">
                Inventario Vacío
              </div>
            ) : (
              <div className="border border-[var(--divider)] bg-[var(--bg-surface)] rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)] border-b border-[var(--divider)] bg-[var(--bg-main)]">
                      <th className="p-4 w-12 text-center">N°</th>
                      <th className="p-4 w-1/4">Título</th>
                      <th className="p-4 w-44">Artista</th>
                      <th className="p-4 w-24 text-center">Duración</th>
                      <th className="p-4 w-20 text-center">Intro</th>
                      <th className="p-4 w-36">Escenas</th>
                      <th className="p-4 w-20 text-center">Uso</th>
                      <th className="p-4">Notas Técnicas</th>
                      <th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)] text-sm font-medium text-[var(--text-main)]">
                    {music.map((track, index) => {
                      const usage = getUsage(musicStats, track.name);
                      return (
                        <tr key={track.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                          <td className="p-4 text-center text-[var(--text-sec)]">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={track.name || ''}
                              onChange={(e) => handleUpdateMusic(track.id, 'name', e.target.value)}
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1"
                              placeholder="Título..."
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={track.artist || ''}
                              onChange={(e) => handleUpdateMusic(track.id, 'artist', e.target.value)}
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1 text-xs"
                              placeholder="Artista..."
                            />
                          </td>
                          <td className="p-4 text-center">
                            <TimeInput
                              seconds={track.duration || 0}
                              onChange={(s) => handleUpdateMusic(track.id, 'duration', s)}
                              emptyWhenZero
                              placeholder="--:--"
                              className="w-16 text-center bg-transparent border-b border-transparent focus:border-[var(--accent)] outline-none text-xs font-mono font-medium"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <TimeInput
                              seconds={track.introSeconds || 0}
                              onChange={(s) => handleUpdateMusic(track.id, 'introSeconds', s)}
                              emptyWhenZero
                              placeholder="--:--"
                              className="w-14 text-center bg-transparent border-b border-transparent focus:border-[var(--accent)] outline-none text-xs font-mono font-medium"
                            />
                          </td>
                          <td className="p-4 text-xs text-[var(--text-sec)]">{usage.scenes}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent)] text-[var(--bg-surface)]">
                              {usage.count}
                            </span>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={track.description || ''}
                              onChange={(e) => handleUpdateMusic(track.id, 'description', e.target.value)}
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)] py-1 text-xs"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <ConfirmButton icon={Trash2} onClick={() => handleDeleteMusic(track.id)} className="text-[var(--text-sec)] hover:text-red-500" />
                          </td>
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

// ==========================================
// 12. ANALÍTICA Y ESTADÍSTICAS
// ==========================================

function getInterventionType(inv) {
  const resp = (inv.responsible || '').trim().toUpperCase();
  if (resp === 'CONTROL' || resp === '[CONTROL]') return 'CONTROL';
  if (resp === 'EFECTO' || resp === '[EFECTO]') return 'EFECTO';

  const c = (inv.content || '').toUpperCase();
  if (c.includes('MÚSICA [') || c.includes('MUSICA [')) return 'MÚSICA';
  if (c.includes('EFECTO [')) return 'EFECTO';

  const trimmedClean = c.trim();
  if (trimmedClean === '(SILENCIO)' || trimmedClean === '(PAUSA)') return 'SILENCIO';

  return 'VOZ / DIÁLOGO';
}

function StatisticsManager({ project }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const isRadioProgram = isRadioProgramProject(project);
  const scenes = project.scenes || [];
  const interventions = project.interventions || [];
  const plannedSeconds = parsePlannedDuration(project.general?.duration);

  const contentSeconds = interventions.reduce((sum, inv) => sum + (inv.tp || 0), 0);
  const tandasTotalSeconds = isRadioProgram ? getRadioTandasTotalSeconds(project) : 0;
  const realSeconds = isRadioProgram ? contentSeconds + tandasTotalSeconds : contentSeconds;

  const diffSeconds = realSeconds - plannedSeconds;

  let diffFormatted = '';
  if (plannedSeconds === 0) diffFormatted = 'NO DEFINIDO';
  else if (diffSeconds === 0) diffFormatted = 'EXACTO';
  else diffFormatted = `${diffSeconds > 0 ? '+' : '-'}${formatTA(Math.abs(diffSeconds))} (${diffSeconds > 0 ? 'SOBRE LO PREVISTO' : 'POR DEBAJO'})`;

  const radioStructure = isRadioProgram ? getOrderedRadioStructure(project) : null;
  const contentPct = realSeconds > 0 ? Math.round((contentSeconds / realSeconds) * 100) : 0;
  const tandasPct = realSeconds > 0 ? Math.round((tandasTotalSeconds / realSeconds) * 100) : 0;

  const typeDistribution = { 'VOZ / DIÁLOGO': 0, MÚSICA: 0, EFECTO: 0, SILENCIO: 0, CONTROL: 0 };
  const characterStats = {};

  interventions.forEach((inv) => {
    const type = getInterventionType(inv);
    typeDistribution[type]++;

    if (type === 'VOZ / DIÁLOGO' && inv.responsible && inv.responsible.trim() !== '') {
      let charName = inv.responsible.trim().toUpperCase();
      if (charName !== 'CONTROL' && charName !== '[CONTROL]' && charName !== 'EFECTO' && charName !== '[EFECTO]') {
        if (!characterStats[charName]) characterStats[charName] = { count: 0, scenes: new Set() };
        characterStats[charName].count++;

        if (inv.sceneId) {
          const label = formatSceneOrItemLabel(inv.sceneId, project);
          if (label && label !== '-') {
            characterStats[charName].scenes.add(label);
          }
        }
      }
    }
  });

  const totalInterventions = interventions.length;
  const totalVoiceInterventions = Object.values(characterStats).reduce((sum, stat) => sum + stat.count, 0);

  const pieColors = {
    'VOZ / DIÁLOGO': 'var(--accent)',
    MÚSICA: 'var(--color-planteamiento)',
    EFECTO: 'var(--color-confrontacion)',
    SILENCIO: '#9D9B92',
    CONTROL: '#242424'
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
              <span className="text-3xl font-medium text-[var(--text-main)] tracking-tight">{project.general?.duration || '--:--'}</span>
            </div>
            <div className="py-6 px-8 bg-[var(--bg-surface)] border-b-2 border-x border-t border-[var(--divider)] border-b-[var(--accent)] rounded flex flex-col items-start shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">Tiempo Real Acumulado</span>
              <span className="text-4xl font-medium tracking-tight">{formatTA(realSeconds)}</span>
            </div>
            <div className="py-6 px-8 bg-[var(--bg-surface)] border border-[var(--divider)] rounded flex flex-col items-start shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-2">Desviación</span>
              <span className={`text-xl font-medium ${plannedSeconds > 0 ? (diffSeconds > 0 ? 'text-red-600' : 'text-[var(--accent)]') : 'text-[var(--text-sec)]'}`}>
                {diffFormatted}
              </span>
            </div>
          </div>

          {isRadioProgram && (
            <div className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-6 shadow-sm">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--divider)]">
                Contenido vs Publicidad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                <div className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded border border-[var(--divider)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)] block mb-1">Tiempo de Contenido</span>
                    <span className="text-2xl font-semibold text-[var(--text-main)]">{formatTA(contentSeconds)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[var(--accent)]">{contentPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded border border-[var(--divider)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)] block mb-1">Tandas Publicitarias</span>
                    <span className="text-2xl font-semibold text-[var(--text-main)]">{formatTA(tandasTotalSeconds)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-amber-600">{tandasPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
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
                          r="25"
                          cx="50"
                          cy="50"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="50"
                          strokeDasharray={mounted ? `${dash} ${gap}` : `0 ${circumference}`}
                          strokeDashoffset={offset}
                          className="transition-all duration-1000 ease-out"
                        />
                      );
                    })}
                  </svg>
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
                {isRadioProgram ? 'Participación de voces' : 'Participación de Personajes'}
              </h3>
              {Object.keys(characterStats).length === 0 ? (
                <div className="text-sm text-[var(--text-sec)] italic bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-6 text-center">
                  No hay diálogos ni locución registrados aún.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(characterStats)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([name, stat]) => {
                      const pct = totalVoiceInterventions > 0 ? Math.round((stat.count / totalVoiceInterventions) * 100) : 0;
                      return (
                        <div key={name} className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-4 relative overflow-hidden group hover:border-[var(--accent)] transition-colors">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm font-semibold text-[var(--text-main)]">{name}</span>
                            <span className="text-sm font-bold text-[var(--text-main)]">{pct}% ({stat.count})</span>
                          </div>
                          <div className="text-[10px] text-[var(--text-sec)]">
                            En: <span className="text-[var(--text-main)]">{Array.from(stat.scenes).join(', ')}</span>
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

// ==========================================
// 13. FORMULARIO DE DATOS GENERALES
// ==========================================

function GeneralDataForm({ project, updateProject, onNext, hideNarrativeTabs }) {
  const [formData, setFormData] = useState(project.general);
  const [saveStatus, setSaveStatus] = useState('Guardado');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const formatDropdownRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const isRadioProgram = isRadioProgramFormat(formData.format);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistData = useCallback(
    (newGeneralData, updatedPeople = null) => {
      setSaveStatus('Guardando...');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        updateProject((prevProject) => ({
          ...prevProject,
          general: newGeneralData,
          people: updatedPeople || prevProject.people,
          lastModified: new Date().toISOString()
        }));
        setSaveStatus('Guardado');
      }, 600);
    },
    [updateProject]
  );

  const handleChange = (field, value) => {
    let finalValue = value;
    const fieldsToCapitalize = ['programName', 'director', 'producer', 'operator', 'productionCompany', 'station'];
    if (fieldsToCapitalize.includes(field)) {
      finalValue = capitalizeName(value);
    }
    const updated = { ...formData, [field]: finalValue };
    setFormData(updated);
    persistData(updated);
  };

  const formatOptions = ['Programa radial', 'Ficción sonora', 'Podcast', 'Entrevista', 'Documental sonoro'];
  const filteredFormats = formatOptions.filter((f) => f.toLowerCase().includes((formData.format || '').toLowerCase()));

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
            <Save size={14} strokeWidth={2} className="shrink-0" /> Guardar
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
                    value={formData.programName || ''}
                    onChange={(e) => handleChange('programName', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[var(--divider)] text-[var(--text-main)] text-3xl font-medium px-0 py-3 outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-sec)] focus-ring"
                    placeholder="Título del proyecto..."
                  />
                </FormGroup>
              </div>

              <FormGroup label="Duración Prevista" description={isRadioProgram ? 'Incluye las tandas de publicidad.' : 'Se usará para calcular la desviación real.'}>
                <Input type="text" value={formData.duration || ''} onChange={(e) => handleChange('duration', e.target.value)} placeholder="Ej. 30:00 o 01:30:00" />
              </FormGroup>

              <FormGroup label="Fecha de Emisión">
                <Input type="date" value={formData.broadcastDate || ''} onChange={(e) => handleChange('broadcastDate', e.target.value)} className="cursor-pointer" />
              </FormGroup>

              <FormGroup label="Formato">
                <div className="relative" ref={formatDropdownRef}>
                  <Input
                    type="text"
                    value={formData.format || ''}
                    onChange={(e) => handleChange('format', e.target.value)}
                    onFocus={() => setShowFormatDropdown(true)}
                    placeholder="Selecciona o escribe..."
                  />
                  {showFormatDropdown && (
                    <div className="absolute z-10 w-full mt-2 border border-[var(--divider)] bg-[var(--bg-surface)] rounded shadow-sm max-h-48 overflow-y-auto">
                      {filteredFormats.map((fmt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-[var(--text-main)] hover:bg-[var(--accent-soft)] transition-colors outline-none border-b border-[var(--divider)] last:border-0"
                          onClick={() => {
                            handleChange('format', fmt);
                            setShowFormatDropdown(false);
                          }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Número de Programa">
                <Input type="text" value={formData.programNumber || ''} onChange={(e) => handleChange('programNumber', e.target.value)} placeholder="Ej. 01, 04" />
              </FormGroup>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)] mb-8 flex items-center gap-3 pb-2 border-b border-[var(--divider)] uppercase tracking-wider">
              Equipo de Producción
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <FormGroup label="Dirección">
                <Input type="text" value={formData.director || ''} onChange={(e) => handleChange('director', e.target.value)} placeholder="Nombre del director..." />
              </FormGroup>
              <FormGroup label="Productor">
                <Input type="text" value={formData.producer || ''} onChange={(e) => handleChange('producer', e.target.value)} placeholder="Nombre del productor..." />
              </FormGroup>
              <FormGroup label="Operador (Control Técnico)">
                <Input type="text" value={formData.operator || ''} onChange={(e) => handleChange('operator', e.target.value)} placeholder="Nombre del operador técnico..." />
              </FormGroup>
              <FormGroup label="Emisora / Canal">
                <Input type="text" value={formData.station || ''} onChange={(e) => handleChange('station', e.target.value)} placeholder="Ej. Radio Nacional, 95.5 FM..." />
              </FormGroup>
            </div>
          </section>

          <div className="pt-8 border-t border-[var(--divider)] flex justify-end pb-8">
            <button
              onClick={onNext}
              className="bg-[var(--accent)] text-[var(--bg-surface)] px-8 py-3 rounded text-sm font-medium hover:opacity-90 transition-opacity outline-none flex items-center gap-3 focus-ring shadow-sm"
            >
              Continuar a {isRadioProgram ? 'Estructura del Programa' : 'Guion Radiofónico'} <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 14. NAVEGACIÓN Y WORKSPACE
// ==========================================

const NavItem = ({ activeTab, setActiveTab, id, icon: Icon, label }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab && setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 transition-colors outline-none focus-ring rounded mb-1 relative group/item ${
        isActive ? 'bg-[var(--accent-soft)] text-[var(--text-main)] font-medium' : 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)]'
      }`}
      title={label}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`} />
      <span className="ml-4 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    </button>
  );
};

function ProjectWorkspace({ project, updateProject, onClose, isDark, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('general');
  const [targetSceneId, setTargetSceneId] = useState(null);

  const isRadioProgram = isRadioProgramProject(project);
  const formatStr = (project.general?.format || '').toLowerCase();
  const hideNarrativeTabs = ['programa radial', 'podcast', 'entrevista'].some((f) => formatStr.includes(f));

  useEffect(() => {
    if (hideNarrativeTabs && (activeTab === 'estructura' || activeTab === 'escaleta')) {
      setActiveTab(isRadioProgram ? 'programa' : 'guion');
    }
  }, [hideNarrativeTabs, activeTab, isRadioProgram]);

  const handleNavigateToGuion = (sceneId) => {
    setActiveTab('guion');
    setTargetSceneId(sceneId);
  };

  const getNextTabFromGeneral = () => {
    if (isRadioProgram) return 'programa';
    if (hideNarrativeTabs) return 'guion';
    return 'estructura';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="fixed top-0 left-0 h-full bg-[var(--bg-surface)] border-r border-[var(--divider)] z-40 w-16 hover:w-64 transition-all duration-300 group flex flex-col print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-4 border-b border-[var(--divider)] shrink-0 bg-[var(--bg-surface)] z-50">
          <button
            onClick={onClose}
            className="p-2 rounded text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)] transition-colors outline-none focus-ring shrink-0"
            title="Cerrar Expediente"
          >
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
            {isRadioProgram && (
              <>
                <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="programa" icon={Radio} label="Estructura del Programa" />
                <NavItem activeTab={activeTab} setActiveTab={setActiveTab} id="pauta" icon={ListOrdered} label="Pauta" />
              </>
            )}
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
          <button
            onClick={toggleTheme}
            className="flex items-center px-2 py-2 w-full rounded text-[var(--text-sec)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)] transition-colors outline-none focus-ring"
          >
            {isDark ? <Sun size={18} strokeWidth={1.5} className="shrink-0" /> : <Moon size={18} strokeWidth={1.5} className="shrink-0" />}
            <span className="ml-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Modo {isDark ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative pl-16 print:pl-0 print:w-full">
        {activeTab === 'general' && (
          <GeneralDataForm project={project} updateProject={updateProject} onNext={() => setActiveTab(getNextTabFromGeneral())} hideNarrativeTabs={hideNarrativeTabs} />
        )}
        {activeTab === 'people' && <PeopleManager project={project} updateProject={updateProject} />}
        {activeTab === 'programa' && isRadioProgram && (
          <EstructuraProgramaManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />
        )}
        {activeTab === 'pauta' && isRadioProgram && (
          <PautaManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />
        )}
        {activeTab === 'estructura' && <EstructuraManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />}
        {activeTab === 'escaleta' && <EscaletaManager project={project} updateProject={updateProject} onNavigateToGuion={handleNavigateToGuion} />}
        {activeTab === 'guion' && (
          <GuionManager project={project} updateProject={updateProject} targetSceneId={targetSceneId} isRadioProgram={isRadioProgram} onNavigateToTab={setActiveTab} />
        )}
        {activeTab === 'recursos' && <ResourcesManager project={project} updateProject={updateProject} />}
        {activeTab === 'estadisticas' && <StatisticsManager project={project} />}
      </div>
    </div>
  );
}

// ==========================================
// 15. DASHBOARD Y RAÍZ DE LA APLICACIÓN
// ==========================================

function Dashboard({ projects, onCreate, onOpen, onDelete, isDark, toggleTheme }) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-[var(--divider)] pb-8 mb-12">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[var(--text-main)]">NARRA</h1>
            <p className="mt-2 text-sm text-[var(--text-sec)]">Sistema de Producción y Guion Radiofónico</p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-[var(--accent-soft)] text-[var(--text-sec)] transition-colors outline-none focus-ring shrink-0"
              title="Cambiar tema"
            >
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
            <button
              onClick={onCreate}
              className="text-sm font-medium text-[var(--text-main)] border-b border-[var(--text-main)] hover:text-[var(--accent)] hover:border-[var(--accent)] outline-none focus-ring transition-colors"
            >
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-[var(--bg-surface)] border border-[var(--divider)] rounded p-6 hover:border-[var(--accent)] transition-colors duration-200 cursor-pointer flex flex-col h-full focus-within:border-[var(--accent)] outline-none"
                onClick={() => onOpen(project)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpen(project);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-sec)]">
                    N° {String(project.general?.programNumber || '--').padStart(2, '0')}
                  </div>
                  <ConfirmButton
                    icon={Trash2}
                    onClick={() => onDelete(project.id)}
                    className="text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--accent-soft)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                <h3 className="font-semibold text-lg leading-snug text-[var(--text-main)] mb-1 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {project.general?.programName || 'Proyecto sin título'}
                </h3>
                <div className="text-sm text-[var(--text-sec)] mb-6">{project.general?.format || 'Formato no definido'}</div>

                <div className="mt-auto pt-4 border-t border-[var(--divider)] flex justify-between items-center text-xs text-[var(--text-sec)]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} strokeWidth={1.5} className="shrink-0" /> {project.general?.duration || '--:--'}
                  </div>
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

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedProjects = localStorage.getItem('radio_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Error al cargar proyectos:', e);
      }
    }

    const savedTheme = localStorage.getItem('radio_theme');
    if (savedTheme === 'dark') setIsDark(true);

    const style = document.createElement('style');
    style.id = 'radio-app-styles';
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
        --color-planteamiento: #2A4365;
        --color-confrontacion: #9B2C2C;
        --color-resolucion: #276749;
      }

      .dark-theme {
        --bg-main: #181917;
        --bg-surface: #20211F;
        --text-main: #E9E7E0;
        --text-sec: #9D9B92;
        --divider: #353630;
        --accent: #A8AF8E;
        --accent-soft: #303426;
        --color-planteamiento: #4299E1;
        --color-confrontacion: #F56565;
        --color-resolucion: #48BB78;
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
        .print\\:hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('radio-app-styles');
      if (el) el.remove();
    };
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
        format: 'Programa radial',
        director: '',
        producer: '',
        motive: '',
        announcers: [],
        operator: '',
        programNumber: '01',
        productionCompany: '',
        station: ''
      },
      radio: {
        blocks: [
          { id: generateId(), name: 'Bloque 1', plannedSeconds: 600, tandaSeconds: 120 }
        ]
      },
      people: [],
      scenes: [
        {
          id: generateId(),
          title: 'Apertura y Bienvenida',
          radioKind: 'elemento',
          plannedSeconds: 180,
          pautaItems: []
        }
      ],
      interventions: [],
      soundEffects: [],
      music: [],
      lastModified: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    saveProjects(updated);
    setActiveProject(newProject);
  };

  const handleUpdateProject = (updater) => {
    const resolvedProject = typeof updater === 'function' ? updater(activeProject) : updater;
    resolvedProject.lastModified = new Date().toISOString();
    const updated = projects.map((p) => (p.id === resolvedProject.id ? resolvedProject : p));
    saveProjects(updated);
    setActiveProject(resolvedProject);
  };

  const handleDeleteProject = (id) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
    if (activeProject?.id === id) setActiveProject(null);
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'dark-theme' : ''}`}>
      {activeProject ? (
        <ProjectWorkspace
          project={activeProject}
          updateProject={handleUpdateProject}
          onClose={() => setActiveProject(null)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Dashboard
          projects={projects}
          onCreate={handleCreateProject}
          onOpen={setActiveProject}
          onDelete={handleDeleteProject}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}