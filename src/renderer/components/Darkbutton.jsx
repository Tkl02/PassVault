import { Sun, Moon } from "lucide-react";

function Darkbutton({ toggleTheme, darkMode }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="relative w-[68px] h-9 rounded-full px-1.5 transition-colors duration-300 flex items-center bg-slate-300 dark:bg-slate-700 border border-slate-400/60 dark:border-slate-600"
    >
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          darkMode === "light"
            ? "translate-x-0 bg-white text-slate-700"
            : "translate-x-7 bg-slate-900 text-amber-200"
        }`}
      >
        {darkMode === "light" ? <Moon size={14} /> : <Sun size={14} />}
      </div>
    </button>
  );
}
export default Darkbutton;
