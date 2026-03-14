import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PasswordCard from "../components/PasswordCards";
import { Plus, Search, ShieldAlert } from "lucide-react";

function Dashboard({ masterPassword, onNavigate }) {
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadPasswords();
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeoutId = setTimeout(() => setToastMessage(""), 1800);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  const loadPasswords = async () => {
    const data = await window.api.getPasswords(masterPassword);
    if (data) setPasswords(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const updated = passwords.filter((p) => p.id !== id);
    const success = await window.api.savePasswords({
      passwords: updated,
      masterPassword,
    });
    if (success) setPasswords(updated);
  };

  const handleEdit = async (updatedItem) => {
    const updated = passwords.map((p) =>
      p.id === updatedItem.id ? updatedItem : p,
    );

    const success = await window.api.savePasswords({
      passwords: updated,
      masterPassword,
    });

    if (success) {
      setPasswords(updated);
    }

    return success;
  };

  const filteredPasswords = passwords.filter((p) =>
    p.site?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Carregando cofre...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Minhas Senhas
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Gerencie suas credenciais com segurança
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          <button
            onClick={() => onNavigate("generator")}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl transition-all font-semibold shadow-lg shadow-teal-600/30"
          >
            <Plus size={20} />
            Novo
          </button>
        </div>
      </div>

      {filteredPasswords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.map((item) => (
            <PasswordCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onNotify={setToastMessage}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-100/80 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <ShieldAlert
            size={48}
            className="text-slate-500 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-600 dark:text-slate-400">
            Nenhuma senha encontrada.
          </p>
        </div>
      )}

      {toastMessage &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[9999] rounded-xl border border-emerald-500/40 bg-slate-900 text-emerald-300 px-4 py-3 shadow-xl pop-in">
            {toastMessage}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Dashboard;
