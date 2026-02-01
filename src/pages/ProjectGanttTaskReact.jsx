import { useState, useEffect } from "react";
import { ViewMode } from "gantt-task-react";
import { GanttTaskReact } from "../components/GanttTaskReact";
import {
  parseCSVToGanttTaskReact,
  applyTaskHierarchy,
  calculateTaskStats,
  filterTasksByResource,
  formatDateWithAbbreviatedMonth
} from "../utils/ganttTaskReactParser";


// Dati CSV importati direttamente
const CSV_DATA = `Task Name,Start Date,End Date,Duration,Resources
Project Management,2025-11-28,2026-01-30,
Pianificazione requisiti,2025-11-28,2025-12-15,
CALL Google Meet con il team (riunione),2025-11-28,2025-11-28,2.5h,Sandu/Mattia/Catalin/Andrea
Creazione schema analisi SWOT,2025-12-15,2025-12-15,4h,Sandu
Creazione WBS,2025-12-15,2025-12-15,3h,Andrea
Creazione Schema GANTT,2025-12-15,2025-12-15,8h,Andrea
Coordinamento con il team,2025-11-28,2026-01-30
CALL Google Meet con il team (riunione),2025-11-28,2025-11-28,1.5h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-11,2025-12-11,2h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-13,2025-12-13,2h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-15,2025-12-15,1.5h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-17,2025-12-17,2h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-22,2025-12-22,1.5h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-30,2025-12-30,1.5h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2025-12-24,2025-12-24,1.5h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2026-01-01,2026-01-01,1h,Sandu/Mattia/Catalin/Andrea
CALL Google Meet con il team (riunione),2026-01-03,2026-01-03,1.5h,Sandu/Mattia/Catalin/Andrea
CAll Google Meet con il team (riunione),2026-02-01,2026-02-01,1.5h,Sandu/Mattia/Catalin/Andrea
CAll Google Meet con il team (riunione),2026-02-03,2026-02-03,1.5h,Sandu/Mattia/Catalin/Andrea
Aggiornamenti Schema GANTT,2026-01-24,2026-01-30,6h,Andrea
Design e UX/UI,2025-12-15,2026-01-05
Creazione Mockup,2025-12-15,2026-01-15,10h,Catalin
Creazione modale tutorial del gioco,2025-12-29,2025-12-29,4h,Catalin
Implementazione responsive mobile,2026-01-05,2026-01-05,3h,Andrea
FrontEnd,2025-12-15,2026-01-12
Setup Componenti Principali,2025-12-15,2025-12-28
configurazione repository frontend in GitHub,2025-12-15,2025-12-15,3h,Sandu/Mattia/Catalin/Andrea
Installazione progetto React/Vite,2025-12-16,2025-12-16,1h,Sandu/Mattia/Catalin/Andrea
Configurazione cloud Vercel per deploy frontend con React/Vite,2025-12-17,2025-12-17,2h,Sandu/Mattia/Catalin/Andrea
Creazione MainMenu.jsx: interfaccia per la scelta modalità di gioco,2025-12-17,2025-12-18,3h,Sandu
Completamento MainMenu.jsx,2025-12-18,2025-12-18,2h,Catalin
Creazione VersusSetup.jsx: configurazione in modalità 1 VS 1,2025-12-18,2025-12-18,2h,Catalin
Creazione EndScreen.jsx: schermata di fine partita.,2025-12-19,2025-12-19,2h,Catalin
Creazione ColorPicker.jsx: selettore colori per sequenza segreta,2025-12-19,2025-12-19,0.5h,Catalin
Creazione GuessRow: riga di tentativo singolo,2025-12-20,2025-12-20,2h,Catalin
Creazione GameBoard.jsx: area di gioco principale,2025-12-21,2025-12-21,2h,Catalin
Creazione BombHeader.jsx: componente di intestazione del gioco,2025-12-28,2025-12-28,1h,Catalin
Implementazione dell'inglese come lingua base dell'app,2025-12-28,2025-12-28,3h,Catalin
Creazione classifica,2025-12-29,2025-12-29,5h,Andrea
Creazione schermata sfida giocatore,2025-12-30,2025-12-30,1.5h,Andrea
Implementazione Funzionalità Utente,2025-12-19,2026-01-08,
Finestra di login,2025-12-19,2025-12-19,2h,Sandu
Finestra di registrazione,2025-12-20,2025-12-20,2h,Catalin
Registrazione: implementazione del ruolo utente lato frontend,2025-12-20,2025-12-20,1h,Catalin
Creazione list utenti loggati (da sfidare online),2026-01-02,2026-01-02,3h,Andrea
Inserimento pulsante Login/Logout,2026-01-08,2026-01-08,3h,Catalin
BACKEND,2025-12-16,2026-01-03,
Setup,2025-12-16,2026-12-17
Configurazione repository backend in GitHub,2025-12-16,2025-12-16,3h,Sandu/Mattia/Catalin/Andrea
Configurazione cloud Neon per deploy database PostgreSQL,2025-12-16,2025-12-16,1.5h,Catalin/Andrea
Configurazione cloud Render.com per deploy backend in Node.js/Express.js,2025-12-16,2025-12-16,2h,Sandu/Mattia/Catalin/Andrea
Installazione progetto Node.js/Express.js,2025-12-17,2025-12-17,1h,Catalin/Andrea/Sandu/Mattia
Database,2025-12-21,2025-12-21
Creazione tabella utenti in Neon,2025-12-21,2025-12-21,1h,Catalin/Andrea
Creazione connessione a database,2025-12-21,2025-12-21,1h,Andrea
API REST + Socket.io,2025-12-18,2025-12-22
Creazione server Express per sviluppo,2025-12-18,2025-12-18,1h,Andrea
Creazione controller Socket.io per lancio della sfida in modalità 1 VS 1,2025-12-19,2025-12-19,3h,Andrea
Creazione API elenco utenti loggati (online),2025-12-19,2025-12-19,3h,Andrea
Creazione API di registrazione,2025-12-20,2025-12-20,2h,Andrea
Registrazione: controllo se l'utente è loggato,2025-12-20,2025-12-20,2h,Catalin
Registrazione: codificare utente password,2025-12-20,2025-12-20,1h,Andrea
Registrazione: username univoco,2025-12-22,2025-12-22,1h,Catalin
Creazione API classifica utenti,2025-12-22,2025-12-22,3h,Andrea
Sicurezza,2025-12-18,2026-01-12
Creazione Token JWT con cookie HttpOnly e autorizzazione accesso a modalità 1 VS 1,2025-12-18,2025-12-18,6h,Andrea
Registrazione: username univoco,2025-12-22,2025-12-22,1h,Catalin
Inserimento validazione username=email,2026-01-10,2026-01-10,2h,Andrea
Gestione recupero password,2026-01-12,2026-01-12,4h,Andrea
Testing e Validazione,2026-01-20,2026-02-01
Feedback dei nostri compagni di corso,2026-01-20,2026-01-25,Ruben/Andrea-Sabetta
Correzione bug e migliorie software,2026-01-25,2026-02-01,Catalin/Andrea/Sandu
Rilascio software,2026-01-25,2026-02-02
Presentazione PowerPoint,2026-01-25,2026-02-02,Andrea/Catalin/Sandu
Completamento e correzione documentazione,2026-01-25,2026-02-03,Catalin/Andrea/Sandu
`;

export const ProjectGanttTaskReact = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [selectedResource, setSelectedResource] = useState("");
  const [stats, setStats] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const parsed = parseCSVToGanttTaskReact(CSV_DATA);
    const tasks = applyTaskHierarchy(parsed);
    setAllTasks(tasks);
    setFilteredTasks(tasks);
    setStats(calculateTaskStats(tasks));
  }, []);

  useEffect(() => {
    if (selectedResource) {
      const filtered = filterTasksByResource(allTasks, selectedResource);
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(allTasks);
    }
  }, [selectedResource, allTasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    console.log("Task cliccato:", task);
  };

  const handleTaskChange = (task) => {
    console.log("Task modificato:", task);
    // Aggiorna lo stato se necessario
    setAllTasks(prevTasks =>
      prevTasks.map(t => t.id === task.id ? task : t)
    );
  };

  const viewModes = [
    { label: "Quarter Day", value: ViewMode.QuarterDay },
    { label: "Half Day", value: ViewMode.HalfDay },
    { label: "Day", value: ViewMode.Day },
    { label: "Week", value: ViewMode.Week },
    { label: "Month", value: ViewMode.Month }
  ];

  // Task da mostrare nel pannello (dallo stato, con date e campi formattati)
  const displayTask = selectedTask
    ? (filteredTasks.find((t) => t.id === selectedTask.id) ?? selectedTask)
    : null;

  if (!stats) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "white",
        fontSize: "1.5rem"
      }}>
        Caricamento...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      padding: "20px"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: "1920px",
        margin: "0 auto",
        marginBottom: "5px"
      }}>
        <h1 style={{
          color: "white",
          fontSize: "1.2rem",
          marginBottom: "5px",
          fontFamily: "Orbitron, sans-serif"
        }}>
          📊 Mastermind Project Timeline
        </h1>
        {/*<p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Powered by gantt-task-react
        </p>*/}
      </div>

      {/* Stats Cards */}
      <div style={{
        maxWidth: "1920px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "10px",
        marginBottom: "8px"
      }}>
        <div style={{
          backgroundColor: "#1e293b",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #334155"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1px" }}>
            Totale Task
          </div>
          <div style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold" }}>
            {stats.total}
          </div>
        </div>

        <div style={{
          backgroundColor: "#1e293b",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #06b6d4"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1px" }}>
            Ore Totali
          </div>
          <div style={{ color: "#06b6d4", fontSize: "1.1rem", fontWeight: "bold" }}>
            {stats.totalHours}h
          </div>
        </div>

        <div style={{
          backgroundColor: "#1e293b",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #10b981"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1px" }}>
            Ore Completate
          </div>
          <div style={{ color: "#10b981", fontSize: "1.1rem", fontWeight: "bold" }}>
            {stats.completedHours}h
          </div>
        </div>

        <div style={{
          backgroundColor: "#1e293b",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #f59e0b"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1px" }}>
            Progresso
          </div>
          <div style={{ color: "#f59e0b", fontSize: "1.1rem", fontWeight: "bold" }}>
            {stats.avgProgress}%
          </div>
        </div>

        <div style={{
          backgroundColor: "#1e293b",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ec4899"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1px" }}>
            Team Members
          </div>
          <div style={{ color: "#ec4899", fontSize: "1.1rem", fontWeight: "bold" }}>
            {stats.resourceCount}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: "1920px",
        margin: "0 auto",
        marginBottom: "5px"
      }}>
        <div style={{
          backgroundColor: "#1e293b",
          padding: "5px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            {/* View Mode */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: "bold", marginRight: "10px" }}>
                Vista:
              </span>
              {viewModes.map(mode => (
                <button
                  key={mode.label}
                  onClick={() => setViewMode(mode.value)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: viewMode === mode.value ? "#3b82f6" : "#334155",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: viewMode === mode.value ? "bold" : "normal"
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Resource Filter */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: "bold" }}>
                Filtra per:
              </span>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#334155",
                  color: "white",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                <option value="">Tutti i membri</option>
                {stats.resources.map(resource => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>
              {selectedResource && (
                <button
                  onClick={() => setSelectedResource("")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  ✕ Rimuovi filtro
                </button>
              )}
            </div>
          </div>

          {selectedResource && (
            <div style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#0f172a",
              borderRadius: "6px",
              color: "#94a3b8"
            }}>
              Mostrando {filteredTasks.length} task assegnati a <strong style={{ color: "white" }}>{selectedResource}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      <div style={{
        maxWidth: "1920px",
        margin: "0 auto",
        marginBottom: "30px",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px"
      }}>
        <GanttTaskReact
          tasks={filteredTasks}
          viewMode={viewMode}
          onTaskClick={handleTaskClick}
          onTaskChange={handleTaskChange}
        />
      </div>

      {/* Task Details - date con mese abbreviato (es. 15 Dic 2025) */}
      {displayTask && (
        <div style={{
          maxWidth: "1600px",
          margin: "0 auto",
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "15px"
          }}>
            <h3 style={{ color: "white", margin: 0 }}>
              📋 {displayTask._originalName || displayTask.name}
            </h3>
            <button
              onClick={() => setSelectedTask(null)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#334155",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              ✕ Chiudi
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            color: "#94a3b8"
          }}>
            <div>
              <strong style={{ color: "white" }}>Data Inizio:</strong>{" "}
              {formatDateWithAbbreviatedMonth(displayTask.start)}
            </div>
            <div>
              <strong style={{ color: "white" }}>Data Fine:</strong>{" "}
              {displayTask.endFormatted ?? formatDateWithAbbreviatedMonth(displayTask.end)}
            </div>
            <div>
              <strong style={{ color: "white" }}>Durata:</strong> {displayTask._duration}
            </div>
            <div>
              <strong style={{ color: "white" }}>Progresso:</strong>{" "}
              <span style={{
                color: displayTask.progress === 100 ? "#10b981" :
                  displayTask.progress > 50 ? "#3b82f6" : "#f59e0b"
              }}>
                {displayTask.progress}%
              </span>
            </div>
            {displayTask._resources && (
              <div style={{ gridColumn: "1 / -1" }}>
                <strong style={{ color: "white" }}>Risorse Assegnate:</strong>{" "}
                {displayTask._resources.split('/').map((resource, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      margin: "4px",
                      backgroundColor: "#334155",
                      borderRadius: "4px",
                      color: "white"
                    }}
                  >
                    {resource.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGanttTaskReact;
