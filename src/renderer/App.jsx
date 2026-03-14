import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Generator from "./pages/Generator";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function App() {
  const [masterPassword, setMasterPassword] = useState(
    () => sessionStorage.getItem("masterPassword") || "",
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem("masterPassword"),
  );
  const [hasMasterPassword, setHasMasterPassword] = useState(null);
  const [currentPage, setCurrentPage] = useState("passwords");

  useEffect(() => {
    window.api.checkSetup().then((exists) => {
      setHasMasterPassword(exists);
    });
  }, []);

  if (hasMasterPassword === null)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="fade-up rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-6 py-4 text-slate-700 dark:text-slate-200 shadow-lg">
          Carregando PassVault...
        </div>
      </div>
    );

  if (!hasMasterPassword) {
    return <Setup onComplete={() => setHasMasterPassword(true)} />;
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(pwd) => {
          sessionStorage.setItem("masterPassword", pwd);
          setMasterPassword(pwd);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem("masterPassword");
    setMasterPassword("");
    setCurrentPage("passwords");
    setIsAuthenticated(false);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-transparent text-slate-900 dark:text-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-100/70 via-cyan-50 to-sky-100/70 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40" />
      <div className="flex h-full">
        <Sidebar
          active={currentPage}
          onChangePage={setCurrentPage}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto thin-scroll p-4 md:p-8 lg:p-10">
          <div className="fade-up min-h-full rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 shadow-xl backdrop-blur-md p-5 md:p-7">
            {currentPage === "passwords" && (
              <Dashboard
                masterPassword={masterPassword}
                onNavigate={setCurrentPage}
              />
            )}
            {currentPage === "generator" && (
              <Generator masterPassword={masterPassword} />
            )}
            {currentPage === "settings" && (
              <Settings masterPassword={masterPassword} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
