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

  // 🔓 DESBLOQUEAR AUDIO (CLAVE)
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio('/sounds/alert.mp3');
      audio.play().catch(() => { });
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  // 🔊 FUNCIÓN GLOBAL DE SONIDO
  const playSound = () => {
    const audio = new Audio('/sounds/alert.mp3');
    audio.play().catch(err => console.log("Error audio:", err));
  };

  // ⏰ PRUEBA (puedes quitarla luego)
  const testAlarm = () => {
    alert("Alarma 🔔");
    playSound();
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Calendario de eventos</h1>

      <Calendar />

      {/* 🔔 BOTÓN DE PRUEBA */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={testAlarm}>
          Probar sonido 🔊
        </button>
      </div>

      {/* 🔥 BOTÓN INSTALAR */}
      <InstallButton />
    </div>
  );
}

export default App;