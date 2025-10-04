import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import FacultyLogin from "./FacultyLogin";

const AttendanceApp = () => {
  const webcamRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  // Faculty login state
  const [facultyData, setFacultyData] = useState(null);
  // Mode selection after login: 'webcam' | 'image' | null
  const [mode, setMode] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  // Annotated / visualization image returned from workflow (base64 data URI)
  const [annotatedImage, setAnnotatedImage] = useState(null);

  const sendImage = useCallback(async (imageSrc) => {
    if (!facultyData || !imageSrc) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!response.ok) throw new Error("Detection failed");

      const data = await response.json();
      setDetections(data.detections || data.predictions || []);

      // Attempt to locate an annotated / visualization image key from the workflow response
      const annotatedCandidates = [
        data.image, // sometimes workflows return { image: "<base64>" }
        data.visualization,
        data.annotated_image,
        data.annotatedImage,
        data.output_image,
      ].filter(Boolean);
      if (annotatedCandidates.length > 0) {
        let imgVal = annotatedCandidates[0];
        // If it already looks like a data URI keep it, else prepend jpeg header
        if (typeof imgVal === 'string') {
          if (!imgVal.startsWith('data:image')) {
            // Heuristic: add prefix assuming jpeg
            imgVal = `data:image/jpeg;base64,${imgVal}`;
          }
          setAnnotatedImage(imgVal);
        }
      } else {
        // Clear previous when no image returned (optional)
        // setAnnotatedImage(null);
      }

      setAttendance((prev) => {
        const newAttendance = { ...prev };
        (data.detections || []).forEach((person) => {
          if (person?.id) newAttendance[person.id] = true;
        });
        return newAttendance;
      });
    } catch (err) {
      console.error("Error during detection:", err);
    } finally {
      setLoading(false);
    }
  }, [facultyData]);

  const captureAndSend = async () => {
    if (!facultyData || mode !== 'webcam') return; // block until login and webcam mode
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;
      await sendImage(imageSrc);
    }
  };

  useEffect(() => {
    if (!facultyData || mode !== 'webcam') return undefined;
    const interval = setInterval(() => {
      captureAndSend();
    }, 3000);
    return () => clearInterval(interval);
  }, [facultyData, mode]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setUploadedPreview(typeof dataUrl === 'string' ? dataUrl : null);
      await sendImage(typeof dataUrl === 'string' ? dataUrl : undefined);
      // allow re-selecting the same file again
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const downloadAttendance = () => {
    const dataStr = JSON.stringify(
      { ...facultyData, attendance },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveAttendanceToBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/save-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...facultyData, attendance }),
      });
      const result = await response.json();
      alert(result.message);
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Failed to save attendance to server");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Attendance Page */}
      <div
        style={{
          width: '1490px',
          margin: "auto",
          textAlign: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          filter: !facultyData ? "blur(5px)" : "none",
          pointerEvents: !facultyData ? "none" : "auto",
        }}
      >
        <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>
          Attendance System using YOLO & Face Recognition
        </h1>

        {/* Mode selection after login */}
        {facultyData && !mode && (
          <div style={{ margin: "16px 0" }}>
            <p style={{ marginBottom: 10, fontWeight: 600 }}>Choose input method</p>
            <button onClick={() => setMode('webcam')} style={{ marginRight: 8 }}>
              Use Webcam
            </button>
            <button onClick={() => setMode('image')}>
              Upload Image
            </button>
          </div>
        )}

        {/* Webcam Mode */}
        {facultyData && mode === 'webcam' && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={1000}
              height={480}
              videoConstraints={{ width: 1000, height: 480, facingMode: "user" }}
            />
            <div style={{ margin: "10px 0" }}>
              <button onClick={captureAndSend} disabled={loading}>
                {loading ? "Detecting..." : "Detect Attendance Now"}
              </button>
              <button onClick={() => setMode(null)} style={{ marginLeft: 10 }}>
                Change Mode
              </button>
            </div>
          </>
        )}

        {/* Image Upload Mode */}
        {facultyData && mode === 'image' && (
          <div style={{ margin: "10px 0" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {uploadedPreview && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={uploadedPreview}
                  alt="uploaded preview"
                  style={{ maxWidth: 1000, maxHeight: 480 }}
                />
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setMode(null)}>
                Change Mode
              </button>
            </div>
          </div>
        )}

        {/* Annotated Image (if provided by workflow) */}
        {annotatedImage && (
          <div style={{ marginTop: 20 }}>
            <h2>Annotated Result</h2>
            <img
              src={annotatedImage}
              alt="Annotated detections"
              style={{ maxWidth: 1000, maxHeight: 480, border: '2px solid #222' }}
            />
          </div>
        )}

        <h2>Detected Faces:</h2>
        {(!detections || detections.length === 0) ? <p>No faces detected yet.</p> : (
          <ul>
            {detections.map((person, idx) => {
              const id = person.id || person.class || idx;
              return (
                <li key={id}>
                  {(person.name || person.class || 'Unknown')} (ID: {id})
                </li>
              );
            })}
          </ul>
        )}

        <h2>Attendance Marked:</h2>
        {Object.keys(attendance).length === 0 ? (
          <p>No attendance recorded yet.</p>
        ) : (
          <ul>
            {Object.keys(attendance).map((id) => (
              <li key={id}>Person ID: {id} - Present</li>
            ))}
          </ul>
        )}

        <div style={{  }}>
          <button
            onClick={downloadAttendance}
            disabled={Object.keys(attendance).length === 0}
          >
            Download Attendance JSON
          </button>
          <button
            onClick={saveAttendanceToBackend}
            disabled={Object.keys(attendance).length === 0}
            style={{ marginLeft: 10 }}
          >
            Save Attendance to Server
          </button>
        </div>
      </div>

      {/* Faculty Login */}
      {!facultyData && <FacultyLogin onLogin={(data) => { setFacultyData(data); setMode(null); }} />}
    </div>
  );
};

export default AttendanceApp;
