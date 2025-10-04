import React from "react";
import  {motion}  from "framer-motion";

const OpeningAnimation = ({ onFinish }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at center, #0f0c29, #000000 80%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
      onAnimationComplete={onFinish}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{
          overflow: "hidden",
          borderTop: "2px solid #0ff",
          borderBottom: "2px solid #0ff",
          padding: "20px 60px",
          boxShadow:
            "0 0 20px #0ff, 0 0 40px #0ff, inset 0 0 15px #0ff",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "50px" }}
          animate={{ opacity: 1, letterSpacing: "5px" }}
          transition={{ duration: 1.2, delay: 0.5 }}
          style={{
            fontSize: "3rem",
            color: "#0ff",
            textTransform: "uppercase",
            textShadow:
              "0 0 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff, 0 0 80px #0ff",
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          Attendance System
        </motion.h1>
      </motion.div>
    </motion.div>
  );
};

export default OpeningAnimation;
