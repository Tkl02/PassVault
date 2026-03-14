import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ShieldPlus,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Darkbutton from "../components/Darkbutton";

const setupSchema = z
  .object({
    password: z.string().min(8, "A senha deve possuir no minimo 8 caracters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

function Setup({ onComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      const success = await window.api.setupMasterPassword(data.password);
      if (success) {
        onComplete();
      } else {
        setError("Nao foi possivel configurar a senha mestre");
      }
    } catch (error) {
      setError(
        error?.message
          ? `Erro ao configurar senha mestre: ${error.message}`
          : "Erro ao configurar senha mestre",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/85 shadow-xl shadow-slate-300/50 dark:shadow-slate-950/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-sm fade-up">
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="bg-teal-600/20 p-4 rounded-full mb-4 mt-3">
            <ShieldPlus
              size={40}
              className="text-teal-600 dark:text-teal-400"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Bem-Vindo ao PassVault
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm text-center px-6">
            Insira sua senha mestre para começar a usar o App
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 px-4">
            <label className="text-sm font-medium text-slate-700 dark:text-white">
              Insira sua senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-500 dark:text-slate-400"
                size={18}
              />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full dark:text-white bg-slate-50 dark:bg-slate-800 border ${errors.password ? "border-red-500" : "border-slate-300 dark:border-slate-700"} text-slate-900 pl-10 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                placeholder="Minimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2 px-4">
            <label className="text-sm font-medium text-slate-700 dark:text-white">
              Confirme sua senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-500 dark:text-slate-400"
                size={18}
              />
              <input
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"}
                className={`w-full dark:text-white bg-slate-50 dark:bg-slate-800 border ${errors.confirmPassword ? "border-red-500" : "border-slate-300 dark:border-slate-700"} text-slate-900 pl-10 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                placeholder="Repita a senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-500/10 border-red-500/50 p-3 border mx-4 rounded-lg flex items-center gap-2 text-red-500 dark:text-red-300 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="w-full flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mb-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Configurando" : "Criar Cofre"}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </button>
          </div>
        </form>
      </div>
      <div className="fade-up">
        <Darkbutton toggleTheme={toggleTheme} darkMode={darkMode} />
      </div>
    </div>
  );
}
export default Setup;
