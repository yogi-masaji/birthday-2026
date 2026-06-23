import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function App() {
  // Step 1: Pulsing Heart, Step 2: Birthday Text, Step 3: Surprise Button, Step 4: Chatbot
  const [introStep, setIntroStep] = useState<1 | 2 | 3 | 4>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [heartExploded, setHeartExploded] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Retro Chime Sound Synthesizer (Pure AudioContext, no external package required)
  const playRetroSound = (notes: number[], delayStep = 150) => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }, index * delayStep);
      });
    } catch (e) {
      console.log("AudioContext blocked or not supported by browser yet.");
    }
  };

  // Helper untuk waktu chat
  const timeNow = (): string => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // Efek auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Efek ledakan confetti bawaan HTML asli
  const triggerConfetti = (count = 60) => {
    const colors = ["#ff3fa4", "#b6ff3c", "#ffd23f", "#3fd9ff", "#fff"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const size = 6 + Math.random() * 6;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.4}px`;
      piece.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  };

  // Handle klik Step 1: Hati Pulsing Meledak/Membesar
  const handleHeartClick = () => {
    playRetroSound([261.63, 329.63, 392.0, 523.25], 100); // C4 -> E4 -> G4 -> C5
    setHeartExploded(true);

    // Berpindah ke Step 2 (Teks ucapan ulang tahun) setelah efek zoom hati selesai
    setTimeout(() => {
      setIntroStep(2);

      // Berpindah ke Step 3 (Tombol kejutan muncul secara perlahan setelah beberapa saat)
      setTimeout(() => {
        setIntroStep(3);
        playRetroSound([523.25, 659.25, 783.99], 120); // C5 -> E5 -> G5
      }, 1500);
    }, 800);
  };

  // Handle klik Step 3: Berpindah ke Chatbot (Step 4)
  const handleSurpriseClick = () => {
    playRetroSound(
      [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5],
      80,
    ); // Upward scale chime
    setIntroStep(4);
  };

  // Sekuens pembuka otomatis chatbot saat user memasuki Step 4
  useEffect(() => {
    if (introStep !== 4) return;

    triggerConfetti(80);
    setTimeout(() => triggerConfetti(40), 1200);

    const pushIntroBubble = (text: string, delay: number) => {
      return setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: text,
            time: timeNow(),
          },
        ]);
        playRetroSound([600], 0); // Short cute incoming message pop sound
      }, delay);
    };

    const timers = [
      pushIntroBubble("bub 🎀", 400),
      setTimeout(() => setIsTyping(true), 1100),
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: "HAPPY BIRTHDAY SAYANGGGG 💗🎂✨",
            time: timeNow(),
          },
        ]);
        playRetroSound([523.25, 659.25, 783.99, 1046.5], 100);
        triggerConfetti(50);
      }, 2200),
      pushIntroBubble("Dear Zahra pacar ak tercinta", 3700),
      pushIntroBubble(
        "Happy birthday buat pacar aku tercinta yang paling cantik. Aku berharap hari ini penuh sama hal-hal yang bikin kamu bahagia. Makasih banyak ya udah ada di hidup aku dan selalu nemenin aku sejauh ini. Semoga kita bisa terus bareng-bareng selamanya. Aku selalu doain kamu sehat, panjang umur, sukses, dan segala urusan kamu selalu dipermudah. I'm so proud of you and I love you more than words can say 💞",
        5400,
      ),
    ];

    return () => timers.forEach(clearTimeout);
  }, [introStep]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSending) return;

    setInputInputValue("");
    const userMessageId = Math.random().toString();

    // 1. Tambahkan bubble chat Zahra ke UI
    const updatedMessages: Message[] = [
      ...messages,
      { id: userMessageId, role: "user", content: text, time: timeNow() },
    ];
    setMessages(updatedMessages);

    setIsTyping(true);
    setIsSending(true);
    playRetroSound([440], 0);

    try {
      const payloadHistory = updatedMessages.slice(-8).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 2. Panggil Serverless Backend Netlify
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatHistory: payloadHistory,
        }),
      });

      if (!response.ok) throw new Error("API down");

      const data = await response.json();
      setIsTyping(false);

      // 3. SEPARATE BUBBLE LOGIC: Pecah teks berdasarkan '\n'
      const textLines = (data.reply as string)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // 4. Masukkan baris-baris tersebut ke UI sebagai bubble terpisah
      setMessages((prev) => [
        ...prev,
        ...textLines.map((line) => ({
          id: Math.random().toString(),
          role: "assistant" as const,
          content: line,
          time: timeNow(),
        })),
      ]);
      playRetroSound([523.25, 659.25], 100);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "Aapa bub? coba kirim ulanggg sinyalku jelek",
          time: timeNow(),
        },
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <style>{`
        /* RETRO VARIABLES & MAIN CSS INLINED */
        :root {
          --pink: #ff3fa4;
          --pink-deep: #d6157e;
          --lime: #b6ff3c;
          --lime-deep: #8fd91e;
          --cream: #fdf6e3;
          --ink: #20140f;
          --shell: #ff0f8f;
          --screen-frame: #2a2a2a;
          --bubble-them: #cdeaff;
          --bubble-me: #ffe27a;
        }

        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          background: var(--pink);
          font-family: 'Courier New', monospace;
          overscroll-behavior: none;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.25) 0%, transparent 35%),
            radial-gradient(circle at 85% 80%, rgba(255,255,255,0.2) 0%, transparent 35%),
            repeating-linear-gradient(45deg, var(--pink) 0px, var(--pink) 18px, #ff5fb4 18px, #ff5fb4 36px);
          padding: 18px;
          position: relative;
          overflow-x: hidden;
        }

        .wobbly {
          font-family: 'Segoe Print', 'Comic Sans MS', 'Bradley Hand', cursive;
        }

        .sparkle-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .sparkle {
          position: absolute;
          font-size: 22px;
          opacity: 0.85;
          animation: floaty 6s ease-in-out infinite;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.6));
        }

        @keyframes floaty {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-22px) rotate(8deg); }
        }

        .device {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
          background: var(--shell);
          border-radius: 38px;
          padding: 16px 14px 26px;
          box-shadow:
            0 0 0 6px #ff85c8,
            0 0 0 10px #c2007a,
            0 25px 50px -10px rgba(0,0,0,0.5),
            inset 0 2px 10px rgba(255,255,255,0.3);
          animation: deviceIn 0.7s cubic-bezier(.18,1.3,.4,1) both;
        }

        @keyframes deviceIn {
          0% { transform: scale(0.7) rotate(-6deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .device::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 16px;
          background: #c2007a;
          border-radius: 0 0 12px 12px;
        }

        .ears {
          position: absolute;
          top: -22px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 18px;
          pointer-events: none;
        }

        .ear {
          width: 34px;
          height: 34px;
          background: var(--lime);
          border: 4px solid var(--lime-deep);
          border-radius: 50%;
          box-shadow: 0 4px 0 rgba(0,0,0,0.15);
        }

        .screen-frame {
          background: var(--screen-frame);
          border-radius: 22px;
          padding: 10px;
          box-shadow: inset 0 0 0 3px #111, inset 0 0 14px rgba(0,0,0,0.6);
        }

        .screen {
          background: var(--cream);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.08);
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }

        .screen-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0,0,0,0.025) 0px,
            rgba(0,0,0,0.025) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          z-index: 5;
        }

        .titlebar {
          text-align: center;
          padding: 12px 10px 8px;
          border-bottom: 3px dashed var(--pink-deep);
          background: linear-gradient(180deg, #fff6e8, var(--cream));
          position: relative;
          z-index: 2;
        }

        .titlebar h1 {
          margin: 0;
          font-size: 22px;
          color: var(--pink-deep);
          letter-spacing: 0.5px;
          text-shadow: 1px 1px 0 #fff, 2px 2px 0 rgba(0,0,0,0.08);
        }

        .titlebar .sub {
          font-size: 10px;
          color: #a36b00;
          margin-top: 2px;
          letter-spacing: 1px;
        }

        .heart-pulse {
          display: inline-block;
          animation: pulse 1.1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        .chat-area {
          flex: 1;
          padding: 14px 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          z-index: 2;
          max-height: 440px;
        }

        .bubble-row {
          display: flex;
          flex-direction: column;
          max-width: 84%;
          animation: pop 0.35s cubic-bezier(.2,1.4,.4,1) both;
        }

        @keyframes pop {
          0% { transform: scale(0.7) translateY(8px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .bubble-row.them { align-self: flex-start; }
        .bubble-row.me { align-self: flex-end; }

        .bubble {
          padding: 9px 13px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.45;
          border: 2px solid var(--ink);
          box-shadow: 2px 3px 0 rgba(0,0,0,0.15);
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .bubble-row.them .bubble {
          background: var(--bubble-them);
          border-bottom-left-radius: 3px;
        }

        .bubble-row.me .bubble {
          background: var(--bubble-me);
          border-bottom-right-radius: 3px;
        }

        .meta {
          font-size: 9px;
          color: #876b4d;
          margin-top: 3px;
          padding: 0 4px;
        }

        .bubble-row.me .meta { text-align: right; }

        .typing-row .bubble {
          background: var(--bubble-them);
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 11px 14px;
        }

        .dot {
          width: 6px; height: 6px;
          background: var(--pink-deep);
          border-radius: 50%;
          animation: bounce 1.2s infinite ease-in-out;
        }

        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        .inputbar {
          display: flex;
          gap: 8px;
          padding: 10px 12px 12px;
          border-top: 3px dashed var(--pink-deep);
          background: linear-gradient(0deg, #fff6e8, var(--cream));
          position: relative;
          z-index: 3;
        }

        .inputbar input {
          flex: 1;
          border: 2px solid var(--ink);
          border-radius: 20px;
          padding: 10px 14px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          background: #fff;
          outline: none;
          min-width: 0;
        }

        .inputbar input:focus {
          box-shadow: 0 0 0 3px var(--lime);
        }

        .sendbtn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          background: var(--pink-deep);
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 2px 3px 0 rgba(0,0,0,0.2);
          transition: transform 0.12s ease;
          flex-shrink: 0;
        }

        .sendbtn:active { transform: scale(0.88); }
        .sendbtn:disabled { opacity: 0.6; cursor: not-allowed; }

        .footer-note {
          text-align: center;
          margin-top: 14px;
          color: #fff;
          font-size: 11px;
          opacity: 0.85;
          letter-spacing: 0.5px;
        }

        .confetti-piece {
          position: fixed;
          top: -20px;
          z-index: 10002;
          pointer-events: none;
          will-change: transform;
          animation: fall linear forwards;
        }

        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
        }

        .extra-card {
          width: 100%;
          max-width: 380px;
          margin-top: 16px;
          background: var(--cream);
          border-radius: 18px;
          border: 3px solid var(--pink-deep);
          padding: 16px 16px 18px;
          box-shadow: 4px 6px 0 rgba(0,0,0,0.18);
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .extra-card h2 {
          color: var(--pink-deep);
          margin: 0 0 8px;
          font-size: 17px;
        }

        .extra-card p {
          font-size: 13px;
          color: #5b3d22;
          line-height: 1.6;
          margin: 0 0 12px;
        }

        .reasons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .reason {
          background: #fff;
          border: 2px solid var(--ink);
          border-radius: 12px;
          padding: 9px 12px;
          font-size: 12.5px;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .reason span.num {
          font-weight: bold;
          color: var(--pink-deep);
          flex-shrink: 0;
        }

        .scroll-hint {
          color: rgba(255,255,255,0.9);
          font-size: 11px;
          margin-top: 10px;
          text-align: center;
          animation: bobDown 1.6s infinite ease-in-out;
        }

        @keyframes bobDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        /* STEP 1-3 INTRO OVERLAY CSS WITH OPAQUE LANDING */
        .intro-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 1s ease-in-out;
          overflow: hidden;
        }

        /* Solid beautiful sweet pink color for Step 1 (No transparency, no blur) */
        .intro-backdrop.step-1 {
          background: #ffffff;
        }

        /* Solid beautiful stripey-pink transition for Step 2 and 3 */
        .intro-backdrop.step-2, .intro-backdrop.step-3 {
          background: repeating-linear-gradient(
            45deg,
            #ff9ebb 0px,
            #ff9ebb 18px,
            #ff75a0 18px,
            #ff75a0 36px
          );
        }

        .intro-backdrop.fade-out {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-50px) scale(0.95);
        }

        .intro-heart-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .intro-heart-container:active {
          transform: scale(0.9);
        }

        .pulsing-heart {
          width: 140px;
          height: 140px;
          color: #ff0f8f;
          fill: currentColor;
          filter: drop-shadow(0 0 15px rgba(255, 15, 143, 0.7));
          animation: gentle-heart-pulse 1.4s infinite ease-in-out;
          transition: transform 0.8s cubic-bezier(0.9, 0, 0.1, 1), opacity 0.5s ease;
        }

        /* Fill screen when exploded to cover the background cleanly */
        .pulsing-heart.exploded {
          transform: scale(80);
          opacity: 0;
        }

        @keyframes gentle-heart-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .click-me-tag {
          position: absolute;
          font-family: 'Segoe Print', 'Comic Sans MS', cursive;
          font-size: 16px;
          font-weight: bold;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          pointer-events: none;
          animation: text-pulse 1.4s infinite ease-in-out;
          transition: opacity 0.3s ease;
        }

        @keyframes text-pulse {
          0%, 100% { transform: scale(1) rotate(-3deg); opacity: 0.9; }
          50% { transform: scale(1.1) rotate(3deg); opacity: 1; }
        }

        .birthday-text-panel {
          text-align: center;
          padding: 24px;
          max-width: 90%;
          animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          z-index: 10000;
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .birthday-title {
          font-family: 'Segoe Print', 'Comic Sans MS', cursive;
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 4px 10px rgba(194, 0, 122, 0.8), 2px 2px 0px #c2007a;
          line-height: 1.3;
          margin-bottom: 20px;
        }

        .surprise-button {
          font-family: 'Courier New', monospace;
          background: #b6ff3c;
          color: #20140f;
          font-weight: bold;
          font-size: 15px;
          padding: 14px 28px;
          border: 3px solid #20140f;
          border-radius: 30px;
          box-shadow: 0 8px 0 #20140f, 0 15px 25px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.15s ease;
          animation: bounceButton 2s infinite ease-in-out;
          z-index: 10001;
        }

        .surprise-button:hover {
          background: #c3ff60;
        }

        .surprise-button:active {
          transform: translateY(4px);
          box-shadow: 0 4px 0 #20140f, 0 8px 15px rgba(0,0,0,0.2);
        }

        @keyframes bounceButton {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Intro Sequence Overlay Screen */}
      {introStep < 4 && (
        <div
          className={`intro-backdrop step-${introStep} ${introStep === 4 ? "fade-out" : ""}`}
        >
          {/* STEP 1: Pulsing Heart Floating with Opaque Solid Background */}
          {introStep === 1 && (
            <div className="intro-heart-container" onClick={handleHeartClick}>
              <svg
                className={`pulsing-heart ${heartExploded ? "exploded" : ""}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {!heartExploded && (
                <span className="click-me-tag">Click Me 💖</span>
              )}
            </div>
          )}

          {/* STEP 2: Transition Display "Happy Birthday pacar ak" */}
          {introStep >= 2 && (
            <div className="birthday-text-panel">
              <h1 className="birthday-title animate-bounce">
                Happy Birthday
                <br />
                pacar ak 💖
              </h1>

              {/* STEP 3: "Click here for surprise" Button */}
              {introStep === 3 && (
                <button
                  className="surprise-button"
                  onClick={handleSurpriseClick}
                >
                  Click here for surprise 🎁
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sparkle Layer */}
      <div className="sparkle-layer">
        {["💗", "✨", "🎀", "💌", "🌸", "💕", "🎂"].map((emoji, idx) => (
          <div
            key={idx}
            className="sparkle"
            style={{
              left: `${(idx * 15) % 95}%`,
              top: `${(idx * 13) % 90}%`,
              animationDuration: `${4 + (idx % 3)}s`,
              animationDelay: `${idx * 0.2}s`,
              fontSize: `${14 + (idx % 5) * 4}px`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Retro Device */}
        <div className="device">
          <div className="ears">
            <div className="ear"></div>
            <div className="ear"></div>
          </div>

          <div className="screen-frame">
            <div className="screen">
              <div className="screen-scanlines"></div>

              <div className="titlebar">
                <h1 className="wobbly">
                  Pesan <span className="heart-pulse">💗</span>
                </h1>
                <div className="sub">YOGI IS TYPING SOMEWHERE FOR YOU</div>
              </div>

              {/* Chat Area */}
              <div className="chat-area" id="chatArea" ref={chatAreaRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bubble-row ${msg.role === "user" ? "me" : "them"}`}
                  >
                    <div className="bubble">{msg.content}</div>
                    <div className="meta">{msg.time}</div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="bubble-row them typing-row">
                    <div className="bubble">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendMessage} className="inputbar">
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputInputValue(e.target.value)}
                  placeholder="gemes..."
                  maxLength={200}
                  autoComplete="off"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="sendbtn"
                  disabled={isSending || !inputValue.trim()}
                >
                  {isSending ? "..." : "➤"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="scroll-hint">↓ SCROLLLL ↓</div>

        <div className="footer-note wobbly">
          made with Love, cuma buat km 💗
        </div>
      </div>
    </>
  );
}
