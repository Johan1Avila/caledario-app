import React, { useState } from "react";

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = new Date(2026, 2 + 1, 0).getDate();
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDayClick = (day) => {
    console.log("Día seleccionado:", day);
    setSelectedDay(day);
  };

  return (
    <div style={styles.grid}>
      {days.map((day) => (
        <div
          key={day}
          className="day"
          style={{
            ...styles.day,
            border: selectedDay === day ? "3px solid #4CAF50" : "none",
          }}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      ))}
    </div>
  );
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
};

export default Calendar;
