import React, { useState, useEffect, useRef } from "react";

const Calendar = () => {
  const triggeredRef = useRef(new Set());

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

  // 🔔 ALARMAS (CORREGIDO)
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
        const uniqueKey = key + event.time;

        if (diff >= 0 && diff < 1000 && !triggeredRef.current.has(uniqueKey)) {
          triggeredRef.current.add(uniqueKey);

          console.log("⏰ ALARMA DISPARADA:", event);

          alert(`⏰ Evento: ${event.note || "Sin nota"}`);
        }
      });
    }, 1000); // ✅ IMPORTANTE

    return () => clearInterval(interval);
  }, [events]);

  // 💾 GUARDAR EN LOCALSTORAGE
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

  const styles = {
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "10px",
      padding: "20px",
    },
    day: {
      height: "80px",
      backgroundColor: "#E0E0E0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "15px",
      cursor: "pointer",
      transition: "0.2s",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modal: {
      backgroundColor: "#1e1e1e",
      padding: "20px",
      borderRadius: "10px",
      width: "300px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "none",
    },
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
      <div style={styles.grid}>
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
                ...styles.day,
                backgroundColor,
                border:
                  selectedDay === day
                    ? "3px solid #ababab"
                    : isToday
                      ? "3px solid #2196F3"
                      : "none",
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Día {selectedDay}</h2>

            <input
              type="text"
              placeholder="Escribe una nota"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.input}
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={styles.input}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.input}
            >
              <option value="">Sin estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
            </select>

            <button
              onClick={() => {
                const updatedEvents = { ...events };
                const key = `${year}-${month}-${selectedDay}`;

                if (!status && !note && !time) {
                  delete updatedEvents[key];
                } else {
                  updatedEvents[key] = {
                    note,
                    status,
                    time,
                  };
                }

                setEvents(updatedEvents);
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
