import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const QUESTIONS = [
  "What was the moment you realized you were falling for me?",
  "Invent ridiculous nicknames and use them all night.",
  "What’s one thing I do that instantly makes you feel loved?",
  "Put on one song and dance like no one’s watching.",
  "What makes our relationship feel different from any other you’ve had?",
  "Try to make each other laugh without touching.",
  "What’s your favorite funny or embarrassing moment we’ve shared?",
  "Write each other a love note—romantic, playful, or heartfelt. Read it out loud.",
  "What’s something new you’d love for us to try together someday?",
  "Cuddle and talk about your favorite moments together this year—slow, soft, and present.",
  "Why do you choose us—even on the hard days?"
];

// Advent calendar setup
const START_DAY = 16; // Dec 16
const TOTAL_DAYS = 11;

// LocalStorage keys
const LAST_SPIN_KEY = "holiday_heart_spin_last_spin";
const ANSWERED_KEY = "holiday_answered_questions";
const MEMORY_KEY = "holiday_saved_memories";

// Locked yesterday question
const FORCED_ANSWERED = [
  "What’s one thing I do that instantly makes you feel loved?"
];

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState(null);
  const [savedMemories, setSavedMemories] = useState([]);
  const [canSpin, setCanSpin] = useState(true);
  const [day, setDay] = useState(1);

  const today = new Date();
  const todayDate = today.toDateString();

  useEffect(() => {
    // Restore answered questions
    const storedAnswered = JSON.parse(localStorage.getItem(ANSWERED_KEY)) || [];
    const answeredQuestions = Array.from(new Set([...storedAnswered, ...FORCED_ANSWERED]));
    localStorage.setItem(ANSWERED_KEY, JSON.stringify(answeredQuestions));

    setDay(answeredQuestions.length + 1);

    // Remaining questions
    const filtered = QUESTIONS.filter(q => !answeredQuestions.includes(q));
    setRemaining(filtered);

    // Restore saved memories
    const storedMemories = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
    if (!storedMemories.includes(FORCED_ANSWERED[0])) storedMemories.push(FORCED_ANSWERED[0]);
    setSavedMemories(storedMemories);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(storedMemories));

    // Daily lock
    const lastSpin = localStorage.getItem(LAST_SPIN_KEY);
    if (lastSpin === todayDate) setCanSpin(false);
  }, [todayDate]);

  // Play sound when selected
  useEffect(() => {
    if (selected) {
      const audio = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
      audio.play();
    }
  }, [selected]);

  const spin = () => {
    if (spinning || remaining.length === 0 || !canSpin) return;

    setSelected(null);
    setSpinning(true);

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const chosen = remaining[randomIndex];

    const extraSpins = 5 * 360;
    const slice = 360 / QUESTIONS.length;
    setRotation(prev => prev + extraSpins + randomIndex * slice);

    setTimeout(() => {
      setSelected(chosen);
      setRemaining(prev => prev.filter(q => q !== chosen));
      setSpinning(false);
      setCanSpin(false);

      localStorage.setItem(LAST_SPIN_KEY, todayDate);

      const answered = JSON.parse(localStorage.getItem(ANSWERED_KEY)) || [];
      answered.push(chosen);
      localStorage.setItem(ANSWERED_KEY, JSON.stringify(answered));
      setDay(answered.length + 1);
    }, 3000);
  };

  const saveMemory = () => {
    if (selected && !savedMemories.includes(selected)) {
      const updated = [...savedMemories, selected];
      setSavedMemories(updated);
      localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(to bottom, #fff7ed, #fde68a)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      {/* Snow animation */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 0.5 }}
          animate={{ y: "110vh" }}
          transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5 }}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "white"
          }}
        />
      ))}

      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 30,
        width: "90%",
        maxWidth: 400,
        height: "90%",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2>🎄 Holiday Heart Spin</h2>

        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Day {day} of {TOTAL_DAYS}
        </p>

        <p style={{ fontSize: 13, opacity: 0.6 }}>
          {canSpin ? `Unlocked: Dec ${START_DAY + day - 1}` : `Next unlock: Dec ${START_DAY + day}`}
        </p>

        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "8px solid #dc2626",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}
        >
          🎁
        </motion.div>

        <motion.button
          onClick={spin}
          disabled={!canSpin || spinning}
          animate={canSpin ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ repeat: canSpin ? Infinity : 0, duration: 2 }}
          style={{
            padding: "12px 26px",
            borderRadius: 20,
            border: "none",
            background: canSpin ? "#dc2626" : "#9ca3af",
            color: "white",
            marginBottom: 10
          }}
        >
          {spinning ? "Opening…" : canSpin ? "Open Today’s Gift 🎄" : "Come Back Tomorrow 🎅"}
        </motion.button>

        {selected && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "#fffbeb",
              padding: 16,
              borderRadius: 16,
              width: "100%",
              maxHeight: "30%",
              overflowY: "auto"
            }}
          >
            {selected}
            <button
              onClick={saveMemory}
              style={{
                marginTop: 10,
                padding: "6px 14px",
                borderRadius: 12,
                border: "none",
                background: "#dc2626",
                color: "white"
              }}
            >
              💾 Save Memory
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
