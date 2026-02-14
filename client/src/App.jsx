// App.jsx
// Main app layout — 3-panel interface: Chat | Code | Preview
// with a version history toolbar at the top.

import { useState, useCallback, useEffect } from "react";
import { Zap, RotateCcw, Layout, Code, Eye, AlertCircle, History } from "lucide-react";
import ChatPanel from "./panels/ChatPanel";
import CodePanel from "./panels/CodePanel";
import PreviewRenderer from "./panels/PreviewRenderer";
import VersionControl from "./components/VersionControl";
import "./App.css";

const API_URL = "http://localhost:3001/api";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [activeTab, setActiveTab] = useState("preview"); // for mobile: "chat" | "code" | "preview"
  const [error, setError] = useState(null);

  const sessionId = "default";

  const handleSend = useCallback(async (prompt) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Update code
      setCode(data.code);

      // Add assistant message with explanation
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.explanation,
          explanation: data.explanation,
        },
      ]);

      // Update versions
      setVersions((prev) => [
        ...prev,
        { prompt, code: data.code, index: data.versionIndex, timestamp: new Date().toLocaleTimeString() },
      ]);
      setCurrentVersion(data.versionIndex);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleRollback = useCallback(async (versionIndex) => {
    try {
      const res = await fetch(`${API_URL}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, versionIndex }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCode(data.code);
      setCurrentVersion(versionIndex);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Rolled back to version ${versionIndex + 1}.` },
      ]);
    } catch (err) {
      setError(err.message);
    }
  }, [sessionId]);

  const handleReset = useCallback(async () => {
    try {
      await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
      setCode("");
      setVersions([]);
      setCurrentVersion(-1);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [sessionId]);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(`${API_URL}/session?sessionId=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();

        setMessages(data.history || []);
        if (data.code) setCode(data.code);
        if (data.versions) setVersions(data.versions);
        if (typeof data.currentVersionIndex === 'number') setCurrentVersion(data.currentVersionIndex);
      } catch (err) {
        console.error("Failed to restore session:", err);
      }
    }
    restoreSession();
  }, [sessionId]);

  return (
    <div className="app">
      {/* Top toolbar */}
      <header className="toolbar">
        <div className="toolbar__left">
          <h1 className="toolbar__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} className="text-yellow-400" /> UI Generator
          </h1>
          <span className="toolbar__badge">Agent</span>
        </div>

        <div className="toolbar__center">
          <VersionControl
            versions={versions}
            currentVersion={currentVersion}
            onRollback={handleRollback}
            onReset={handleReset}
          />
        </div>

        <div className="toolbar__right">
          {/* Reset moved to VersionControl, keeping right slot empty or for future use */}
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="mobile-tabs">
        <button className={`mobile-tabs__btn ${activeTab === "chat" ? "mobile-tabs__btn--active" : ""}`} onClick={() => setActiveTab("chat")}>Chat</button>
        <button className={`mobile-tabs__btn ${activeTab === "code" ? "mobile-tabs__btn--active" : ""}`} onClick={() => setActiveTab("code")}>Code</button>
        <button className={`mobile-tabs__btn ${activeTab === "preview" ? "mobile-tabs__btn--active" : ""}`} onClick={() => setActiveTab("preview")}>Preview</button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </span>
          <button onClick={() => setError(null)}><RotateCcw size={14} /></button>
        </div>
      )}

      {/* 3-panel layout */}
      <main className="panels">
        <div className={`panel panel--chat ${activeTab === "chat" ? "panel--active" : ""}`}>
          <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />
        </div>
        <div className={`panel panel--code ${activeTab === "code" ? "panel--active" : ""}`}>
          <CodePanel code={code} onCodeChange={setCode} />
        </div>
        <div className={`panel panel--preview ${activeTab === "preview" ? "panel--active" : ""}`}>
          <div className="preview-panel">
            <div className="preview-panel__header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} /> Live Preview
              </h2>
            </div>
            <PreviewRenderer code={code} />
          </div>
        </div>
      </main>
    </div>
  );
}
