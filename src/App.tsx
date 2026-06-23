import { useState, useEffect, useRef } from "react";
// import type { FormEvent } from "react";
import "./index.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Sekuens pembuka otomatis saat halaman di-load
  useEffect(() => {
    triggerConfetti(70);
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
        triggerConfetti(50);
      }, 2200),
      pushIntroBubble("Dear Zahra pacar ak tercinta", 3700),
      pushIntroBubble(
        "dari yang pertama kali km marahin org salah nomer sampe sekarang, masih betah aja gemes liat km wkwkwk",
        5400,
      ),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
      // Filter(Boolean) digunakan untuk membuang baris kosong jika ada double enter
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

        <div className="scroll-hint">
          ↓ scroll buat liat lebih banyak cinta ↓
        </div>

        {/* Kenapa Kamu Lovable Card */}
        <div className="extra-card">
          <h2 className="wobbly">
            kenapa km paling lovable se-galaksi, bub 🌸
          </h2>
          <p>(real moments, no debat ya yang)</p>
          <div className="reasons">
            <div className="reason">
              <span className="className">1.</span> dari chat pertama km galak
              bgt "salah nomor kali mas nya" eh malah jadi sayang sampe sekarang
              wkwkwk
            </div>
            <div className="reason">
              <span className="className">2.</span> tiap malem bawel nyuruh km
              bobo, padahal akunya yg susah tidur klo blm ngucapin "bobo yang"
            </div>
            <div className="reason">
              <span className="className">3.</span> bakmi seafood D'cost itu
              enak, tp tetep ga seenak dengerin km cerita "AAAAA senangg" pas
              masakan km jadi
            </div>
            <div className="reason">
              <span className="className">4.</span> km kuat banget, kerja sampe
              malem, masih sempet bilang "jangan lupa solat ya mas" ke aku
            </div>
            <div className="reason">
              <span className="className">5.</span> happy birthday, pacar ak
              tercinta. makin nambah umurnya, makin nambah jg sabarnya ngadepin
              aku yg bawel 💗
            </div>
          </div>
        </div>

        <div className="footer-note wobbly">
          made by yogi, with 200% unnecessary love, cuma buat km 💗
        </div>
      </div>
    </>
  );
}
