import { useState, useRef } from "react";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
  FileArchive,
} from "lucide-react";
import { createPortal } from "react-dom";

function Settings({ masterPassword }) {
  const [exportStatus, setExportStatus] = useState(null);
  const [exportMessage, setExportMessage] = useState("");

  // Import popup state
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importOldPassword, setImportOldPassword] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const [importPasswordError, setImportPasswordError] = useState("");
  const [importFileError, setImportFileError] = useState("");
  const fileInputRef = useRef(null);

  // ─── Export ───────────────────────────────────────────────
  const handleExport = async () => {
    setExportStatus("loading");
    setExportMessage("");
    try {
      const passwords = await window.api.getPasswords(masterPassword);
      const success = await window.api.exportData({
        data: passwords,
        masterPassword,
      });

      if (success) {
        setExportStatus("success");
        setExportMessage("Backup exportado com sucesso");
      } else {
        setExportStatus("error");
        setExportMessage("Exportação cancelada");
      }
    } catch {
      setExportStatus("error");
      setExportMessage("Erro ao exportar backup");
    } finally {
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  // ─── Import popup helpers ─────────────────────────────────
  const openImportPopup = () => {
    setImportFile(null);
    setImportOldPassword("");
    setImportStatus(null);
    setImportMessage("");
    setImportPasswordError("");
    setImportFileError("");
    setShowImportPopup(true);
  };

  const closeImportPopup = () => {
    setShowImportPopup(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".enc")) {
      setImportFileError("Selecione um arquivo .enc válido");
      setImportFile(null);
      return;
    }
    setImportFileError("");
    setImportFile(file);
  };

  // ─── Import confirm ───────────────────────────────────────
  const handleImportConfirm = async () => {
    let valid = true;

    if (!importFile) {
      setImportFileError("Selecione um arquivo .enc");
      valid = false;
    }
    if (!importOldPassword.trim()) {
      setImportPasswordError("Informe a senha mestre do backup");
      valid = false;
    }
    if (!valid) return;

    setImportStatus("loading");
    setImportMessage("");

    try {
      // Convert file to base64 to send through IPC
      const arrayBuffer = await importFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const count = await window.api.importData({
        fileBase64: base64,
        oldPassword: importOldPassword,
        currentPassword: masterPassword,
      });

      if (count === null) {
        setImportStatus("error");
        setImportMessage("Importação cancelada");
      } else {
        setImportStatus("success");
        setImportMessage(`${count} senha(s) importada(s) com sucesso`);
        setTimeout(() => closeImportPopup(), 2000);
      }
    } catch (err) {
      setImportStatus("error");
      setImportMessage(err?.message || "Arquivo inválido ou senha incorreta");
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-up">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          Configurações
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Gerencie os dados do seu cofre
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 divide-y divide-slate-200 dark:divide-slate-700">
        {/* Exportar */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-3 rounded-xl">
              <Download
                size={22}
                className="text-indigo-500 dark:text-indigo-400"
              />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold">
                Exportar Backup
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Salva todas as senhas em um arquivo{" "}
                <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                  .enc
                </span>{" "}
                criptografado com sua senha mestre atual
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-fit">
            <button
              onClick={handleExport}
              disabled={exportStatus === "loading"}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              {exportStatus === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Exportar
            </button>
            {exportStatus === "success" && (
              <p className="text-emerald-500 text-xs flex items-center gap-1">
                <CheckCircle2 size={12} /> {exportMessage}
              </p>
            )}
            {exportStatus === "error" && (
              <p className="text-rose-500 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {exportMessage}
              </p>
            )}
          </div>
        </div>

        {/* Importar */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl">
              <Upload
                size={22}
                className="text-emerald-500 dark:text-emerald-400"
              />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold">
                Importar Backup
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Restaura senhas de um arquivo{" "}
                <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                  .enc
                </span>{" "}
                — informe a senha usada ao gerar o backup
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-fit">
            <button
              onClick={openImportPopup}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <Upload size={18} />
              Importar
            </button>
          </div>
        </div>
      </div>

      {/* ── Import Popup ── */}
      {showImportPopup &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-5 pop-in">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                  Importar Backup
                </h3>
                <button
                  onClick={closeImportPopup}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* File picker */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  Arquivo de backup <span className="text-rose-400">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-colors text-left ${
                    importFileError
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : importFile
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-teal-500 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <FileArchive
                    size={20}
                    className={
                      importFile
                        ? "text-emerald-500"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  />
                  <span
                    className={`text-sm truncate ${
                      importFile
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {importFile
                      ? importFile.name
                      : "Clique para selecionar um arquivo .enc"}
                  </span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".enc"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {importFileError && (
                  <p className="text-rose-400 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {importFileError}
                  </p>
                )}
              </div>

              {/* Old master password */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  Senha mestre do backup{" "}
                  <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500"
                    size={18}
                  />
                  <input
                    type="password"
                    value={importOldPassword}
                    onChange={(e) => {
                      setImportOldPassword(e.target.value);
                      setImportPasswordError("");
                    }}
                    placeholder="Senha usada para gerar o backup"
                    className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl border ${
                      importPasswordError
                        ? "border-rose-500"
                        : "border-slate-300 dark:border-slate-600"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm`}
                  />
                </div>
                {importPasswordError && (
                  <p className="text-rose-400 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {importPasswordError}
                  </p>
                )}
              </div>

              {/* Feedback */}
              {importStatus === "success" && (
                <p className="text-emerald-500 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> {importMessage}
                </p>
              )}
              {importStatus === "error" && (
                <p className="text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {importMessage}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeImportPopup}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportConfirm}
                  disabled={importStatus === "loading"}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all font-medium text-sm flex items-center justify-center gap-2"
                >
                  {importStatus === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {importStatus === "loading" ? "Importando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Settings;
