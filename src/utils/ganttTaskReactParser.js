/**
 * Parser per convertire CSV in formato gantt-task-react
 */

/**
 * Converte durata in ore
 * @param {string} duration - Durata nel formato "4h", "1.5h", "h4", etc.
 * @returns {number} - Numero di ore
 */
export const parseDuration = (duration) => {
    if (!duration || duration.trim() === '') return 8;

    // "4h", "1.5h", "4 h"
    let match = duration.match(/(\d+\.?\d*)\s*h/i);
    if (match) {
        const hours = parseFloat(match[1]);
        return hours > 0 ? hours : 8;
    }
    // "h4"
    match = duration.match(/h\s*(\d+\.?\d*)/i);
    if (match) {
        const hours = parseFloat(match[1]);
        return hours > 0 ? hours : 8;
    }

    return 8;
};

/** Mesi in italiano abbreviati (3 lettere) */
const MESI_ABBR_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

/**
 * Formatta una data con il mese abbreviato a 3 lettere (es. 15 Dic 2025)
 * @param {Date} date - Data da formattare
 * @returns {string} - Stringa formattata (es. "15 Dic 2025")
 */
export const formatDateWithAbbreviatedMonth = (date) => {
    if (date == null) return '–';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '–';
    const day = d.getDate();
    const month = MESI_ABBR_IT[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

/**
 * Porta una data a mezzanotte (00:00:00.000) in ora locale.
 * Serve per allineare le barre del Gantt alle colonne giorno/settimana/mese.
 */
const toMidnightLocal = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Calcola la data di fine per il Gantt (granularità a giorni).
 * La barra grafica va da start (incluso) a end (escluso): rispetta quindi le date From/To.
 * 8h = 1 giorno, 9h = 2 giorni, etc. Minimo 1 giorno.
 * @param {Date} startDate - Data inizio (mezzanotte)
 * @param {number} durationHours - Durata in ore
 * @returns {Date} - Data fine (mezzanotte del giorno successivo all'ultimo giorno di lavoro)
 */
export const calculateEndDate = (startDate, durationHours) => {
    const start = toMidnightLocal(startDate);
    const end = new Date(start);
    const days = Math.max(1, Math.ceil(durationHours / 8));
    end.setDate(end.getDate() + days);
    end.setHours(0, 0, 0, 0);
    return end;
};

/**
 * Determina il tipo di task
 * @param {number} durationHours - Durata in ore
 * @returns {string} - Tipo: 'task', 'milestone', o 'project'
 */
export const getTaskType = (durationHours) => {
    if (durationHours <= 0.5) return 'milestone';
    if (durationHours >= 40) return 'project';
    return 'task';
};

/**
 * Determina il colore del task in base alle risorse
 * @param {string} resources - Risorse assegnate
 * @returns {object} - Oggetto con colori
 */
export const getTaskColors = (resources) => {
    if (!resources) return {
        backgroundColor: '#3b82f6',
        progressColor: '#60a5fa',
        selectedColor: '#1e40af'
    };

    const resourceCount = resources.split('/').length;

    if (resourceCount >= 4) {
        return {
            backgroundColor: '#8b5cf6', // Viola - team completo
            progressColor: '#a78bfa',
            selectedColor: '#7c3aed'
        };
    }

    if (resourceCount >= 2) {
        return {
            backgroundColor: '#3b82f6', // Blu - team parziale
            progressColor: '#60a5fa',
            selectedColor: '#1e40af'
        };
    }

    return {
        backgroundColor: '#06b6d4', // Ciano - individuale
        progressColor: '#22d3ee',
        selectedColor: '#0891b2'
    };
};

/**
 * Determina il progresso stimato in base alla data
 * @param {Date} startDate - Data inizio
 * @returns {number} - Progresso stimato 0-100
 */
export const estimateProgress = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();

    const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));

    if (daysSinceStart < 0) return 0;
    if (daysSinceStart > 30) return 100;
    if (daysSinceStart <= 7) {
        return Math.min(30 + Math.floor((daysSinceStart / 7) * 40), 70);
    }

    return Math.min(70 + Math.floor(((daysSinceStart - 7) / 23) * 30), 100);
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const isDateString = (s) => s && DATE_REGEX.test(String(s).trim());

/**
 * Parse del file CSV e conversione in task per gantt-task-react.
 * Supporta due formati:
 * - Con data di fine: Nome, Data inizio, Data fine [, Durata] [, Risorse]  → la barra va da inizio a fine
 * - Solo durata: Nome, Data inizio, Durata, Risorse  → la barra va da inizio a inizio+durata
 */
export const parseCSVToGanttTaskReact = (csvContent) => {
    const lines = csvContent.trim().split('\n');
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');

    const tasks = dataLines.map((line, index) => {
        const columns = line.split(',').map(col => col.trim());

        let taskName, startDateStr, endDateStr, duration, resources;

        if (columns.length === 3) {
            // Nome, Data inizio, Data fine (es. FRONTEND,2025-12-16,2026-01-12)
            taskName = columns[0] || `Task ${index + 1}`;
            startDateStr = columns[1] || '2024-01-01';
            endDateStr = columns[2];
            duration = '';
            resources = '';
        } else if (columns.length >= 4) {
            resources = columns[columns.length - 1] || '';
            const secondLast = columns[columns.length - 2];
            if (isDateString(secondLast)) {
                // Nome, Data inizio, Data fine, Risorse (es. BACKEND,2025-11-28,2026-01-03,)
                endDateStr = secondLast;
                startDateStr = columns[columns.length - 3] || '2024-01-01';
                taskName = columns.slice(0, columns.length - 3).join(', ').trim() || `Task ${index + 1}`;
                duration = '';
            } else {
                // Nome, Data inizio, Data fine, Durata, Risorse (es. CALL...,2025-11-28,2025-11-28,2.5h,Sandu/...)
                duration = secondLast || '8h';
                endDateStr = columns[columns.length - 3];
                startDateStr = columns[columns.length - 4] || '2024-01-01';
                taskName = columns.slice(0, columns.length - 4).join(', ').trim() || `Task ${index + 1}`;
            }
        } else {
            taskName = columns[0] || `Task ${index + 1}`;
            startDateStr = columns[1] || '2024-01-01';
            endDateStr = null;
            duration = columns[2] || '8h';
            resources = columns[3] || '';
        }

        // Valida e crea data inizio (sempre mezzanotte locale)
        let startDate;
        try {
            if (!startDateStr || !isDateString(startDateStr)) {
                startDateStr = '2024-01-01';
            }
            startDate = new Date(startDateStr + 'T00:00:00');
            startDate.setHours(0, 0, 0, 0);
            if (isNaN(startDate.getTime())) {
                startDate = new Date('2024-01-01T00:00:00');
                startDate.setHours(0, 0, 0, 0);
            }
        } catch (e) {
            startDate = new Date('2024-01-01T00:00:00');
            startDate.setHours(0, 0, 0, 0);
        }

        // Data fine: da CSV se presente e valida, altrimenti da durata
        let endDate;
        let endFormattedStr = null; // se da CSV, mostriamo la data "ultimo giorno" (prima di +1)
        if (isDateString(endDateStr)) {
            try {
                endDate = new Date(endDateStr + 'T00:00:00');
                endDate.setHours(0, 0, 0, 0);
                if (isNaN(endDate.getTime()) || endDate.getTime() < startDate.getTime()) {
                    endDate = calculateEndDate(startDate, parseDuration(duration || '8h'));
                } else {
                    endFormattedStr = formatDateWithAbbreviatedMonth(endDate); // "3 Gen 2026" prima di +1
                    // "Fino al 2026-01-03" = ultimo giorno incluso: la barra copre tutto il giorno → fine al giorno dopo
                    endDate.setDate(endDate.getDate() + 1);
                }
            } catch (e) {
                endDate = calculateEndDate(startDate, parseDuration(duration || '8h'));
            }
        } else {
            const durationHours = parseDuration(duration || '8h');
            endDate = calculateEndDate(startDate, durationHours);
        }

        // Stesso giorno: la barra deve coprire almeno un giorno (fine = inizio + 1 giorno)
        if (endDate.getTime() <= startDate.getTime()) {
            if (endFormattedStr == null) endFormattedStr = formatDateWithAbbreviatedMonth(startDate); // mostra stesso giorno
            endDate = new Date(startDate.getTime());
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);
        }

        const durationHours = duration ? parseDuration(duration) : Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * 8;
        const progress = estimateProgress(startDate);
        const taskType = getTaskType(durationHours);
        const colors = getTaskColors(resources);
        if (taskType === 'milestone') endDate = new Date(startDate.getTime());

        const displayDuration = duration || (durationHours >= 8 ? `${Math.round(durationHours / 8)}g` : `${durationHours}h`);

        return {
            start: new Date(startDate.getTime()),
            end: new Date(endDate.getTime()),
            startFormatted: formatDateWithAbbreviatedMonth(startDate),
            endFormatted: endFormattedStr != null ? endFormattedStr : formatDateWithAbbreviatedMonth(endDate),
            name: `${taskName} (${displayDuration})`,
            id: `task_${index + 1}`,
            type: taskType,
            progress: progress,
            isDisabled: false,
            styles: {
                backgroundColor: colors.backgroundColor,
                backgroundSelectedColor: colors.selectedColor,
                progressColor: colors.progressColor,
                progressSelectedColor: colors.selectedColor
            },
            _resources: resources,
            _duration: displayDuration,
            _durationHours: durationHours,
            _originalName: taskName
        };
    });

    return tasks;
};

/**
 * Calcola statistiche sui task
 * @param {Array} tasks - Array di task
 * @returns {Object} - Statistiche
 */
export const calculateTaskStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.progress === 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStarted = tasks.filter(t => t.progress === 0).length;
    const avgProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / total;

    const totalHours = tasks.reduce((sum, t) => sum + (t._durationHours || 0), 0);
    const completedHours = tasks
        .filter(t => t.progress === 100)
        .reduce((sum, t) => sum + (t._durationHours || 0), 0);

    const allResources = new Set();
    tasks.forEach(task => {
        if (task._resources) {
            task._resources.split('/').forEach(r => allResources.add(r.trim()));
        }
    });

    return {
        total,
        completed,
        inProgress,
        notStarted,
        avgProgress: Math.round(avgProgress),
        resources: Array.from(allResources),
        resourceCount: allResources.size,
        totalHours: Math.round(totalHours * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10
    };
};

/**
 * Filtra task per risorsa
 * @param {Array} tasks - Array di task
 * @param {string} resource - Nome risorsa
 * @returns {Array} - Task filtrati
 */
export const filterTasksByResource = (tasks, resource) => {
    if (!resource) return tasks;

    return tasks.filter(task =>
        task._resources && task._resources.includes(resource)
    );
};

/**
 * Nomi dei task primari (Livello 1 - type: project).
 */
const PRIMARY_TASK_NAMES = [
    'Project Management',
    'Design e UX/UI',
    'FrontEnd',
    'BACKEND',
    'Testing e Validazione',
    'Rilascio software'
];

/**
 * Nomi dei task secondari (Livello 2) con il parent primario a cui appartengono.
 * Chiave: nome del task secondario, Valore: nome del task primario parent.
 */
const SECONDARY_TASKS = {
    // Figli di Project Management
    'Pianificazione requisiti': 'Project Management',
    'Coordinamento con il team': 'Project Management',
    // Figli di FrontEnd
    'Setup': null, // Gestito in base al contesto (FrontEnd o BACKEND)
    'Implementazione funzionalità Utente': 'FrontEnd',
    // Figli di BACKEND
    'Database': 'BACKEND',
    'API REST + Socket.io': 'BACKEND',
    'Sicurezza': 'BACKEND'
};

/**
 * Applica la gerarchia a 3 livelli ai task.
 * - Livello 1: Task primari (type: project)
 * - Livello 2: Task secondari (type: project, project: id del primario)
 * - Livello 3: Tutti gli altri (type: task, project: id del secondario corrente)
 * @param {Array} tasks - Task restituiti da parseCSVToGanttTaskReact
 * @returns {Array} - Stessi task con type e project impostati
 */
export const applyTaskHierarchy = (tasks) => {
    // Prima passata: costruiamo una mappa nome -> id per i primari
    const primaryIdMap = {};
    tasks.forEach(task => {
        const name = (task._originalName || '').trim();
        if (PRIMARY_TASK_NAMES.includes(name)) {
            primaryIdMap[name] = task.id;
        }
    });

    let currentPrimaryId = null;
    let currentPrimaryName = null;
    let currentSecondaryId = null;

    return tasks.map(task => {
        const name = (task._originalName || '').trim();

        // Livello 1: Task primario
        if (PRIMARY_TASK_NAMES.includes(name)) {
            currentPrimaryId = task.id;
            currentPrimaryName = name;
            currentSecondaryId = null; // Reset secondario
            return { ...task, type: 'project', project: undefined };
        }

        // Livello 2: Task secondario
        const isSecondary = Object.prototype.hasOwnProperty.call(SECONDARY_TASKS, name);
        if (isSecondary) {
            // Setup è speciale: appartiene a FrontEnd o BACKEND in base al contesto
            let parentName = SECONDARY_TASKS[name];
            if (name === 'Setup') {
                parentName = currentPrimaryName; // Usa il primario corrente
            }
            const parentId = parentName ? primaryIdMap[parentName] : currentPrimaryId;
            currentSecondaryId = task.id;
            return { ...task, type: 'project', project: parentId ?? undefined };
        }

        // Livello 3: Task normale (figlio del secondario corrente, o del primario se non c'è secondario)
        const parentId = currentSecondaryId ?? currentPrimaryId;
        return { ...task, project: parentId ?? undefined };
    });
};
