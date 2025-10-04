import React, { useState } from "react";

const FacultyLogin = ({ onLogin }) => {
  const [facultyPID, setFacultyPID] = useState("");
  const [subject, setSubject] = useState("");
  const [slots, setSlots] = useState([]);
  const [classType, setClassType] = useState("Theory"); // Practical or Theory

  const handleSlotChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setSlots(selectedOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (facultyPID && subject && slots.length > 0 && classType) {
      onLogin({ facultyPID, subject, slots, classType });
    } else {
      alert("Please fill all details!");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          width: "400px",
          textAlign: "center",
        }}
      >
        <h2>Faculty Login</h2>

        {/* Faculty PID */}
        <div style={{ margin: "15px 0" }}>
          <input
            type="text"
            placeholder="Enter Faculty PID"
            value={facultyPID}
            onChange={(e) => setFacultyPID(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        {/* Subject Dropdown */}
        <div style={{ margin: "15px 0" }}>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          >
            <option value="">Select Subject</option>
            <option value="AI">AI</option>
            <option value="WC">WC</option>
            <option value="DAT">DAT</option>
            <option value="AIH">AIH</option>
            <option value="APM">APM</option>
          </select>
        </div>

        {/* Multiple Slot Selection */}
        <div style={{ margin: "15px 0" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Select Slots (Multiple Allowed)
          </label>
          <select
            multiple
            value={slots}
            onChange={handleSlotChange}
            style={{ width: "100%", padding: "10px", height: "120px" }}
          >
            <option value="1">Slot 1</option>
            <option value="2">Slot 2</option>
            <option value="3">Slot 3</option>
            <option value="4">Slot 4</option>
            <option value="5">Slot 5</option>
            <option value="6">Slot 6</option>
          </select>
        </div>

        {/* Practical or Theory */}
        <div style={{ margin: "15px 0" }}>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          >
            <option value="Theory">Theory</option>
            <option value="Practical">Practical</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "10px 20px" }}>
          Start Attendance
        </button>
      </form>
    </div>
  );
};

export default FacultyLogin;


