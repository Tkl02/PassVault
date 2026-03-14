import { Key, ShieldCheck, Settings, LogOut, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import Darkbutton from "./Darkbutton";

function Sidebar({
  active = "passwords",
  onChangePage = () => {},
  onLogout = () => {},
}) {
  const menuItems = [
    { id: "passwords", label: "Senhas", icon: ShieldCheck },
    { id: "generator", label: "Gerador", icon: Zap },
    { id: "settings", label: "Configuração", icon: Settings },
  ];
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  useEffect(() => {
    document.documentElement.className = darkMode;
    localStorage.setItem("theme", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <aside className="w-72 h-screen border-r border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl flex flex-col">
      <div className="p-6 flex items-center gap-3 fade-up">
        <div className="bg-teal-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/30">
          <Key size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          PassVault
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((items) => (
          <button
            key={items.id}
            onClick={() => onChangePage(items.id)}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border ${
              active === items.id
                ? "bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-500/30"
                : "bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500/40 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            }`}
          >
            <items.icon
              size={20}
              className={
                active === items.id
                  ? "text-white"
                  : "text-teal-600 dark:text-teal-400"
              }
            />
            <span className="text-sm font-semibold tracking-wide">
              {items.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="w-full flex items-center justify-center p-3">
        <Darkbutton toggleTheme={toggleTheme} darkMode={darkMode} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white rounded-xl bg-rose-600 hover:bg-rose-500 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
