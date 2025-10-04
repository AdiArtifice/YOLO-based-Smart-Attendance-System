import { useState } from "react";
import OpeningScreen from "./OpeningScreen";
import AttendanceApp from "./AttendanceApp";

const App = () => {
  const [showOpening, setShowOpening] = useState(true);

  return (
    <div className="w-full h-screen">
      {showOpening ? (
        <OpeningScreen onFinish={() => setShowOpening(false)} />
      ) : (
        <AttendanceApp />
      )}
    </div>
  );
};

export default App;
