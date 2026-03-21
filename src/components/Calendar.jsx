import React from "react";

const Calendar = () => {
  const daysInMonth = new Date(2026, 2 + 1, 0).getDate(); // marzo = 2

  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div style={styles.grid}>
      {days.map((day) => (
        <div key={day} style={styles.day}>
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
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default Calendar;
