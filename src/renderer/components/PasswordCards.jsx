import { useState } from "react";
import { Copy, Edit2, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";

function PasswordCard({ item, onEdit, onDelete, onNotify = () => {} }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    site: "",
    username: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const getSiteLabel = () => item.site || item.title || "Sem titulo";

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || "");
      onNotify(`${label} copiado com sucesso`);
    } catch (error) {
      onNotify(`Falha ao copiar ${label.toLowerCase()}`);
    }
  };

  const openEditModal = () => {
    setEditForm({
      site: item.site || item.title || "",
      username: item.username || "",
      password: item.password || "",
    });
    setShowEditModal(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setShowDeleteModal(false);
    setIsExpanded(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const updatedItem = {
      ...item,
      site: editForm.site.trim(),
      title: editForm.site.trim(),
      username: editForm.username,
      password: editForm.password,
    };

    try {
      const success = await onEdit(updatedItem);
      if (success) {
        setShowEditModal(false);
        onNotify("Credencial atualizada");
      } else {
        onNotify("Falha ao salvar alteracoes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className={`relative w-full min-h-[172px] cursor-pointer transition-all duration-500 ${
          isExpanded ? "scale-105" : "hover:scale-[1.02]"
        }`}
      >
        {/* Container Principal com Animação */}
        <div
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={`w-full h-full rounded-2xl p-5 md:p-6 transition-all duration-500 shadow-xl border ${
            isExpanded
              ? "bg-teal-600 ring-2 ring-teal-300 border-teal-400"
              : "bg-slate-50/95 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-teal-500/50"
          }`}
        >
          {!isExpanded ? (
            // FRENTE: Nome do Site
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="bg-slate-200 dark:bg-slate-700/50 p-3 rounded-full">
                <ExternalLink
                  size={24}
                  className="text-teal-600 dark:text-teal-300"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase text-center break-words">
                {getSiteLabel()}
              </h3>
            </div>
          ) : (
            // VERSO: Detalhes (Usuário e Senha)
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-teal-100 hover:text-white text-xs font-bold uppercase"
                >
                  ← Voltar
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal();
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                    aria-label="Editar credencial"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="p-1.5 hover:bg-rose-500/40 rounded-lg text-rose-100 transition-colors"
                    aria-label="Excluir credencial"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Campo Usuário */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-teal-100 uppercase tracking-widest">
                  Usuário
                </label>
                <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <input
                    readOnly
                    value={item.username}
                    className="bg-transparent border-none text-sm text-white w-full focus:outline-none"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.username, "Usuario");
                    }}
                    className="text-teal-100 hover:text-white"
                    aria-label="Copiar usuario"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-teal-100 uppercase tracking-widest">
                  Senha
                </label>
                <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={item.password}
                    className="bg-transparent border-none text-sm text-white w-full focus:outline-none font-mono"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    className="text-teal-100 hover:text-white"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.password, "Senha");
                    }}
                    className="text-teal-100 hover:text-white"
                    aria-label="Copiar senha"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl pop-in">
            <h3 className="text-slate-900 dark:text-white text-xl font-semibold">
              Confirmar exclusao
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Deseja realmente excluir o item <strong>{getSiteLabel()}</strong>?
              Esta acao nao pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl pop-in">
            <h3 className="text-slate-900 dark:text-white text-xl font-semibold">
              Editar credencial
            </h3>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm">
                Site
              </label>
              <input
                type="text"
                value={editForm.site}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, site: e.target.value }))
                }
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm">
                Usuario
              </label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm">
                Senha
              </label>
              <input
                type="text"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default PasswordCard;
