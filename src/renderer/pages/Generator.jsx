import { useState } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Lock,
  Save,
  X,
  Globe,
  AlertCircle,
} from "lucide-react";

function Generator({ masterPassword }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    numbers: true,
    symbols: true,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [siteRef, setSiteRef] = useState("");
  const [siteError, setSiteError] = useState("");
  const [saving, setSaving] = useState(false);

  const generatePassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charset = lower;
    if (options.uppercase) charset += upper;
    if (options.numbers) charset += numbers;
    if (options.symbols) charset += symbols;

    if (!charset.length) {
      return;
    }

    const generated = Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)],
    ).join("");

    setPassword(generated);
  };

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenPopup = () => {
    setSiteRef("");
    setSiteError("");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSiteRef("");
    setSiteError("");
  };

  const handleSave = async () => {
    if (!siteRef.trim()) {
      setSiteError("A referência do site é obrigatória");
      return;
    }

    setSaving(true);
    try {
      const existing = await window.api.getPasswords(masterPassword);
      const newEntry = {
        id: crypto.randomUUID(),
        title: siteRef.trim(),
        username,
        password,
        site: siteRef.trim(),
      };

      const updated = [...(existing || []), newEntry];
      await window.api.savePasswords({ passwords: updated, masterPassword });

      setShowPopup(false);
      setSiteRef("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setSiteError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full fade-up">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 flex flex-col gap-5 p-6 md:p-7 shadow-xl backdrop-blur-sm">
        <h2 className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
          Gerador de Senhas
        </h2>

        {/* Nome de usuário */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Nome de usuário
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Opcional"
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clique em Gerar"
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Quantidade de caracteres */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Tamanho:{" "}
            <span className="text-teal-600 dark:text-teal-400 font-bold">
              {length}
            </span>
          </label>
          <input
            type="range"
            min={12}
            max={96}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="accent-teal-500 w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>12</span>
            <span>96</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Opções
          </label>
          {[
            { key: "uppercase", label: "Letras maiúsculas (A-Z)" },
            { key: "numbers", label: "Números (0-9)" },
            { key: "symbols", label: "Símbolos (!@#$...)" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300 text-sm"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="w-4 h-4 accent-teal-500 cursor-pointer"
              />
              {label}
            </label>
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={generatePassword}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-teal-600/30"
          >
            <RefreshCw size={18} />
            Gerar Senha
          </button>

          <button
            onClick={handleOpenPopup}
            disabled={!password}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all"
          >
            <Save size={18} />
            Salvar Senha
          </button>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 pop-in">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                Salvar Senha
              </h3>
              <button
                onClick={handleClosePopup}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Referência do site <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={siteRef}
                  onChange={(e) => {
                    setSiteRef(e.target.value);
                    setSiteError("");
                  }}
                  placeholder="Ex: GitHub, Google, Netflix..."
                  autoFocus
                  className={`w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-lg border ${siteError ? "border-red-500" : "border-slate-300 dark:border-slate-600"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              {siteError && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} />
                  {siteError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Generator;
