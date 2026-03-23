import React, { useState, useEffect, useRef } from "react";

const Calendar = () => {
  const triggeredRef = useRef(new Set());
  const alarmRef = useRef(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [time, setTime] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendarEvents");
    return saved ? JSON.parse(saved) : {};
  });

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // 🔊 CONFIGURAR AUDIO
  useEffect(() => {
    alarmRef.current = document.createElement("audio");
    alarmRef.current.src = "/sounds/alarm.mp3";
    alarmRef.current.preload = "auto";
    alarmRef.current.load();

    const unlockAudio = async () => {
      try {
        await alarmRef.current.play();
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;

        setAudioUnlocked(true);
        console.log("🔓 Audio desbloqueado");
      } catch (err) {
        console.log("Error desbloqueando audio:", err);
      }

      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
  }, []);

  // 🔔 ALARMAS
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      Object.entries(events).forEach(([key, event]) => {
        if (!event.time) return;

        const [eventYear, eventMonth, eventDay] = key.split("-").map(Number);
        const [eventHour, eventMinute] = event.time.split(":").map(Number);

        const eventDate = new Date(
          eventYear,
          eventMonth,
          eventDay,
          eventHour,
          eventMinute,
        );

        const diff = now - eventDate;
        const uniqueKey = `${key}-${event.time}`;

        if (diff >= 0 && diff < 1000 && !triggeredRef.current.has(uniqueKey)) {
          triggeredRef.current.add(uniqueKey);

          console.log("⏰ ALARMA DISPARADA:", event);

          // 🔊 SONIDO
          if (alarmRef.current) {
            alarmRef.current.currentTime = 0;

            alarmRef.current.play().catch((err) => {
              console.log("❌ Error audio:", err);
            });
          }

          // ⏱️ Mostramos alerta
          setTimeout(() => {
            alert(`⏰ Evento: ${event.note || "Sin nota"}`);

            // 🛑 DETENER SONIDO DESPUÉS DEL OK
            if (alarmRef.current) {
              alarmRef.current.pause();
              alarmRef.current.currentTime = 0;
            }
          }, 200);

          // ⚠️ ALERT DESPUÉS DEL AUDIO
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [events, audioUnlocked]);

  // 💾 GUARDAR
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleDayClick = (day) => {
    setSelectedDay(day);

    const key = `${year}-${month}-${day}`;
    const event = events[key];

    if (event) {
      setNote(event.note);
      setStatus(event.status || "");
      setTime(event.time || "");
    } else {
      setNote("");
      setStatus("");
      setTime("");
    }

    setShowModal(true);
  };

  return (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <button onClick={() => setCurrentDate(new Date(year, month - 1))}>
          ⬅️
        </button>

        <h2>
          {currentDate.toLocaleString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button onClick={() => setCurrentDate(new Date(year, month + 1))}>
          ➡️
        </button>
      </div>

      {/* CALENDARIO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "10px",
          padding: "20px",
        }}
      >
        {/* 🔊 BOTÓN DE PRUEBA */}
        {/* 
        <button
          onClick={() => {
            alarmRef.current
              .play()
              .then(() => console.log("🔊 SONANDO"))
              .catch((err) => console.log("❌ ERROR:", err));
          }}
        >
          Probar sonido
        </button>
        */}
        {days.map((day) => {
          const key = `${year}-${month}-${day}`;
          const event = events[key];

          const isToday =
            day === currentDay &&
            currentMonth === month &&
            currentYear === year;

          let backgroundColor = "#E0E0E0";

          if (event?.status === "pendiente") {
            backgroundColor = "#FFD54F";
          } else if (event?.status === "confirmado") {
            backgroundColor = "#81C784";
          }

          return (
            <div
              key={day}
              style={{
                height: "80px",
                backgroundColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "15px",
                cursor: "pointer",
                border: isToday ? "3px solid #2196F3" : "none",
              }}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h2>Día {selectedDay}</h2>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Sin estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
            </select>

            <button
              onClick={() => {
                const updated = { ...events };
                const key = `${year}-${month}-${selectedDay}`;

                if (!status && !note && !time) delete updated[key];
                else updated[key] = { note, status, time };

                setEvents(updated);
                setShowModal(false);
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
