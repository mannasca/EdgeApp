import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [selectedNeeds, setSelectedNeeds] = useState({});
  const [urgency, setUrgency] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // success or error
  const API = "http://127.0.0.1:8000"; // backend endpoint

  const needsList = [
    { id: "food", label: "Food" },
    { id: "water", label: "Water" },
    { id: "medicine", label: "Medicine" },
    { id: "bandages", label: "Bandages" },
    { id: "blankets", label: "Blankets" },
    { id: "power", label: "Power Supply" },
  ];

  const toggleNeed = (id) => {
    setSelectedNeeds((prev) => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      else updated[id] = 1; // default quantity
      return updated;
    });
  };

  const updateQuantity = (id, value) => {
    const num = Number(value);
    setSelectedNeeds((prev) => ({
      ...prev,
      [id]: num >= 0 ? num : 0,
    }));
  };

  const validateForm = () => {
    if (!Object.keys(selectedNeeds).length) {
      setStatus("Please select at least one need.");
      setStatusType("error");
      return false;
    }

    for (const [key, qty] of Object.entries(selectedNeeds)) {
      if (qty <= 0 || isNaN(qty)) {
        setStatus(`Please enter a valid quantity for ${key}.`);
        setStatusType("error");
        return false;
      }
    }

    if (!urgency) {
      setStatus("Please select an urgency level.");
      setStatusType("error");
      return false;
    }

    return true;
  };

  const sendNeedReport = async () => {
    setStatus(""); // clear previous messages

    if (!validateForm()) return; // run validation first

    const payload = {
      shelter_id: "A1",
      needs: Object.entries(selectedNeeds).map(([id, qty]) => ({
        type: id,
        quantity: qty,
      })),
      urgency,
    };

    try {
      await axios.post(`${API}/api/need_report`, payload);
      setStatus("Need report sent successfully!");
      setStatusType("success");
      setSelectedNeeds({});
      setUrgency("");
    } catch (err) {
      setStatus("Failed to send need report. Please try again.");
      setStatusType("error");
    }
  };

  return (
    <div className="app-container">
      <div className="form-card">
        <h1>Shelter Need Request</h1>
        <p className="subtitle">Select required items and set quantities</p>

        <div className="needs-grid">
          {needsList.map((item) => (
            <div
              key={item.id}
              className={`need-widget ${
                selectedNeeds[item.id] ? "selected" : ""
              }`}
              onClick={() => toggleNeed(item.id)}
            >
              <div className="need-header">
                <span>{item.label}</span>
              </div>

              {selectedNeeds[item.id] !== undefined && (
                <div
                  className="qty-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    className="qty-input"
                    value={selectedNeeds[item.id]}
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="section-title">Urgency</h3>
        <div className="urgency-row">
          {["low", "medium", "high"].map((level) => (
            <button
              key={level}
              className={`urgency-btn ${urgency === level ? "active" : ""}`}
              onClick={() => setUrgency(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <button className="send-btn" onClick={sendNeedReport}>
          Send Need Report
        </button>

        {status && (
          <p className={`status ${statusType}`}>{status}</p>
        )}
      </div>
    </div>
  );
}
