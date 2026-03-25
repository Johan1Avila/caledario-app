import Calendar from "./components/Calendar";
import { useEffect, useState } from "react";

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("Instalada 🎉");
    }

    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 15px",
        background: "#00E5FF",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      Instalar App
    </button>
  );
}

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Calendario de eventos</h1>
      <Calendar />

      {/* 🔥 AQUÍ LO USAS */}
      <InstallButton />
    </div>
  );
}

export default App;