import React, { useState, useEffect, useRef } from "react";

const Calendar = () => {
  const triggeredRef = useRef(new Set());
  const alarmRef = useRef(null);

  const [activeAlarm, setActiveAlarm] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("none");
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

  // 🔔 Permisos
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 🔊 Audio
  useEffect(() => {
    alarmRef.current = new Audio("/sounds/alarm.mp3");

    const unlockAudio = async () => {
      try {
        await alarmRef.current.play();
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
        setAudioUnlocked(true);
      } catch { }

      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
  }, []);

  // 🔔 Notificación
  const showNotification = (event) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification("📅 Recordatorio", {
        body: event.note || "Tienes un evento",
      });
      n.onclick = () => window.focus();
    }
  };

  // 🛑 Stop
  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    setActiveAlarm(null);
  };

  // ⏳ Snooze
  const snoozeAlarm = () => {
    if (!activeAlarm) return;

    stopAlarm();

    const { key } = activeAlarm;
    const event = events[key];
    if (!event) return;

    const [hour, minute] = event.time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute + 5);

    const newTime = date.toTimeString().slice(0, 5);

    const updatedEvents = {
      ...events,
      [key]: { ...event, time: newTime },
    };

    triggeredRef.current.clear();
    setEvents(updatedEvents);
  };

  // 🔔 Alarmas con repetición
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      Object.entries(events).forEach(([key, event]) => {
        if (!event.time) return;

        const [y, m, d] = key.split("-").map(Number);
        const [h, min] = event.time.split(":").map(Number);

        let shouldTrigger = false;

        const eventDate = new Date(y, m, d, h, min);
        const diff = now - eventDate;

        if (event.repeat === "none") {
          shouldTrigger = Math.abs(diff) < 500;
        }

        if (event.repeat === "daily") {
          shouldTrigger =
            now.getHours() === h &&
            now.getMinutes() === min;
        }

        if (event.repeat === "weekly") {
          const eventDay = new Date(y, m, d).getDay();

          shouldTrigger =
            now.getDay() === eventDay &&
            now.getHours() === h &&
            now.getMinutes() === min;
        }

        const uniqueKey = `${key}-${event.time}`;

        if (shouldTrigger && !triggeredRef.current.has(uniqueKey)) {
          triggeredRef.current.add(uniqueKey);

          showNotification(event);

          if (alarmRef.current && audioUnlocked) {
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch(() => { });
          }

          setActiveAlarm({ ...event, key });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [events, audioUnlocked]);

  // 💾 Guardar
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    const key = `${year}-${month}-${day}`;
    const event = events[key];

    setNote(event?.note || "");
    setStatus(event?.status || "");
    setTime(event?.time || "");
    setRepeat(event?.repeat || "none");

    setShowModal(true);
  };

  return (
    <>
      {/* 🔥 Banner */}
      {activeAlarm && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#333",
          color: "#fff",
          padding: "15px",
          borderRadius: "10px",
          display: "flex",
          gap: "10px",
          zIndex: 9999
        }}>
          <span>⏰ {activeAlarm.note || "Evento"}</span>

          <button onClick={stopAlarm}>Detener</button>
          <button onClick={snoozeAlarm}>Posponer 5 min</button>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
        <button onClick={() => setCurrentDate(new Date(year, month - 1))}>⬅️</button>
        <h2>{currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1))}>➡️</button>
      </div>

      {/* CALENDARIO */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "10px",
        padding: "20px"
      }}>
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${month}-${day}`;
          const event = events[key];

          const isToday =
            day === currentDay &&
            month === currentMonth &&
            year === currentYear;

          return (
            <div key={day}
              onClick={() => handleDayClick(day)}
              style={{
                height: "80px",
                background: event?.status === "pendiente" ? "#FFD54F"
                  : event?.status === "confirmado" ? "#81C784" : "#E0E0E0",
                border: isToday ? "3px solid #00E5FF" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                cursor: "pointer"
              }}>
              {day}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            background: "#1e1e1e",
            padding: "20px",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <h2>Día {selectedDay}</h2>

            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota" />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />

            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Sin estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
            </select>

            {/* 🔥 NUEVO */}
            <select value={repeat} onChange={e => setRepeat(e.target.value)}>
              <option value="none">Sin repetición</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
            </select>

            <button onClick={() => {
              const key = `${year}-${month}-${selectedDay}`;
              const updated = { ...events };

              if (!note && !status && !time) delete updated[key];
              else updated[key] = { note, status, time, repeat };

              triggeredRef.current.clear();

              setEvents(updated);
              setShowModal(false);
            }}>
              Guardar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;