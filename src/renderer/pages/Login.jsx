import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Darkbutton from "../components/Darkbutton";
import Resetbutton from "../components/Resetbutton";
import * as z from "zod";

const loginSchema = z.object({
  masterPassword: z.string().min(1, "Senha mestre obrigatoria"),
});

function Login({ onLogin }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const isValid = await window.api.verifyMasterPassword(
        data.masterPassword,
      );

      if (isValid) {
        onLogin(data.masterPassword);
      } else {
        setError("Senha mestre incorreta");
      }
    } catch (err) {
      setError(
        err?.message
          ? `Erro ao validar acesso: ${err.message}`
          : "Erro ao validar acesso",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col gap-4 items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/85 shadow-xl shadow-slate-300/50 dark:shadow-slate-950/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="bg-teal-600/20 p-4 rounded-full mb-4 mt-3">
            <ShieldCheck
              size={40}
              className="text-teal-600 dark:text-teal-400"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cofre Bloqueado
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm text-center px-6">
            Insira sua senha mestre para acessar suas credenciais
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 px-4">
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-500 dark:text-slate-400"
                size={18}
              />
              <input
                {...register("masterPassword")}
                type="password"
                placeholder="Senha Mestre"
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                  errors.masterPassword
                    ? "border-red-500"
                    : "border-slate-300 dark:border-slate-700"
                } text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
                autoFocus
              />
            </div>
            {errors.masterPassword && (
              <p className="text-red-400 text-xs italic">
                {errors.masterPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 p-3 mx-4 rounded-lg flex items-center gap-2 text-red-500 dark:text-red-300 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="w-full flex items-center justify-center py-3 pb-5">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-600/30"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Desbloquear"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="flex items-center gap-3">
        <Darkbutton toggleTheme={toggleTheme} darkMode={darkMode} />
        <Resetbutton />
      </div>
    </div>
  );
}

export default Login;
