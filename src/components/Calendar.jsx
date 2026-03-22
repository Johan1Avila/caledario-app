import React, { useState, useEffect } from "react";

const Calendar = () => {
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

  const daysInMonth = new Date(2026, 2 + 1, 0).getDate();
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDayClick = (day) => {
    setSelectedDay(day);

    const event = events[day];

    if (event) {
      setNote(event.note);
      setStatus(event.status || "");
    } else {
      setNote("");
      setStatus("");
    }

    setShowModal(true);
  };

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

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
      <div style={styles.grid}>
        {days.map((day) => {
          const event = events[day];

          const isToday =
            day === currentDay && currentMonth === 2 && currentYear === 2026;

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

                if (!status && !note) {
                  delete updatedEvents[selectedDay];
                } else {
                  updatedEvents[selectedDay] = { note, status };
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
