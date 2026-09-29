import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { io } from "socket.io-client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const time = (value) => new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit"
}).format(new Date(value));

function Login({ onLogin }) {
  const [name, setName] = useState("");
  return (
    <div className="login">
      <div className="login-card">
        <div className="brand"><span className="brand-icon">⌁</span><div><b>PulseChat</b><small>REAL-TIME MESSAGING</small></div></div>
        <div className="login-copy">
          <small>WELCOME</small>
          <h1>Talk in<br/><em>real time.</em></h1>
          <p>Enter a username and join the shared conversation.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onLogin(name.trim()); }}>
          <label>USERNAME</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kishan" autoFocus />
          <button>Enter chat <span>↗</span></button>
        </form>
        <div className="tech">MERN · SOCKET.IO · MONGODB</div>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    if (!username) return;

    axios.get(`${API_URL}/messages`)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setError("Could not load chat history."));

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("online");
      socket.emit("user:join", username);
    });
    socket.on("disconnect", () => setStatus("offline"));
    socket.on("connect_error", () => {
      setStatus("offline");
      setError("Chat server is unavailable.");
    });
    socket.on("message:new", (item) => {
      setMessages((old) => old.some((m) => m._id === item._id) ? old : [...old, item]);
    });
    socket.on("users:update", setUsers);
    socket.on("typing:update", ({ username: name, isTyping }) => {
      setTyping(isTyping && name !== username ? name : "");
    });
    socket.on("chat:error", ({ message: msg }) => setError(msg));

    return () => socket.disconnect();
  }, [username]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (e) => {
    e.preventDefault();
    const clean = message.trim();
    if (!clean || !socketRef.current) return;
    socketRef.current.emit("message:send", { message: clean });
    socketRef.current.emit("typing:stop");
    setMessage("");
  };

  const typingChange = (e) => {
    setMessage(e.target.value);
    socketRef.current?.emit("typing:start");
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socketRef.current?.emit("typing:stop"), 900);
  };

  if (!username) return <Login onLogin={setUsername} />;

  return (
    <div className="app">
      <aside>
        <div className="brand"><span className="brand-icon">⌁</span><div><b>PulseChat</b><small>REAL-TIME MESSAGING</small></div></div>
        <div className="profile"><div className="avatar">{username[0].toUpperCase()}</div><div><b>{username}</b><small><i/> Online</small></div></div>
        <div className="label">CHAT ROOM</div>
        <div className="room"><strong>#</strong><div><b>General</b><small>{messages.length} messages</small></div><i/></div>
        <div className="label">ONLINE NOW · {users.length}</div>
        <div className="users">{users.map(u => <div className="user" key={u.socketId}><span>{u.username[0].toUpperCase()}</span>{u.username}{u.username === username ? " (you)" : ""}<i/></div>)}</div>
        <div className="connection"><i className={status}/>{status === "online" ? "Connected" : status === "offline" ? "Disconnected" : "Connecting..."}</div>
      </aside>

      <main>
        <header><div><b># General</b><small>Everyone can join this conversation</small></div><span className="online">● {users.length} online</span></header>

        <section className="messages">
          <div className="welcome"><div>#</div><b>Welcome to General</b><small>This is the beginning of the conversation.</small></div>
          {messages.map(m => {
            const mine = m.username === username;
            return <div className={`msg ${mine ? "mine" : ""}`} key={m._id}>
              {!mine && <div className="msg-avatar">{m.username[0].toUpperCase()}</div>}
              <div className="msg-content"><div className="meta"><b>{mine ? "You" : m.username}</b><time>{time(m.createdAt)}</time></div><p>{m.message}</p></div>
            </div>;
          })}
          {typing && <div className="typing"><span/><span/><span/> {typing} is typing...</div>}
          <div ref={bottom}/>
        </section>

        {error && <button className="error" onClick={() => setError("")}>{error} ×</button>}

        <form className="composer" onSubmit={send}>
          <input value={message} onChange={typingChange} onBlur={() => socketRef.current?.emit("typing:stop")} placeholder="Write a message..." maxLength={1000}/>
          <small>{message.length}/1000</small>
          <button disabled={!message.trim()}>Send ↗</button>
        </form>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
