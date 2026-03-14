import { Trash2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

function Resetbutton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const handleReset = async () => {
    setIsResetting(true);
    setError("");
    try {
      const success = await window.api.resetSystem();
      if (success) {
        window.location.reload();
      } else {
        setError("Nao foi possivel recuperar o sistema.");
      }
    } catch (resetError) {
      setError("Erro ao recuperar o sistema.");
    } finally {
      setIsResetting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-md p-6 border border-rose-300/50 dark:border-rose-900/40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => {
              setIsExpanded(false);
              setConfirmation("");
            }}
            className="text-slate-700 hover:text-slate-400 dark:text-slate-200 dark:hover:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle
            className="text-white bg-rose-500 rounded-md p-1"
            size={30}
          />
          <div>
            <h3 className="text-rose-600 dark:text-rose-300 font-bold text-xl">
              Zona de Perigo
            </h3>
            <p className="text-slate-500 text-xs dark:text-slate-300">
              Apagar todos os dados e começar do zero
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-rose-300/50 dark:border-rose-700/40 bg-rose-50 dark:bg-rose-950/30 p-3 mb-4">
          <p className="text-rose-700 dark:text-rose-200 text-sm">
            Essa ação remove permanentemente o cofre e a senha mestre.
          </p>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-slate-500 dark:text-slate-300 text-xs">
            Digite{" "}
            <span className="font-bold text-rose-500">"resetar sistema"</span>{" "}
            para confirmar
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="resetar sistema"
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setIsExpanded(false);
              setConfirmation("");
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting || confirmation !== "resetar sistema"}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-4 rounded-xl transition-all border border-rose-500/30 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {isResetting ? "Recuperando..." : "Recuperar Sistema"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="bg-rose-500/20 p-2 rounded-xl hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <AlertTriangle size={30} />
      </button>

      {isExpanded && createPortal(modal, document.body)}
    </>
  );
}

export default Resetbutton;
