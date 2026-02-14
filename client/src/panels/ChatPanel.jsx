// ChatPanel.jsx
// Left panel — the chat interface where users describe their UI intent.

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Loader2, Bot, User } from "lucide-react";

export default function ChatPanel({ messages, onSend, isLoading }) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleSubmit(e) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input.trim());
        setInput("");
    }

    return (
        <div className="chat-panel">
            <div className="chat-panel__header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} /> Chat
                </h2>
                <span className="chat-panel__subtitle">Describe what you want to build</span>
            </div>

            <div className="chat-panel__messages">
                {messages.length === 0 && (
                    <div className="chat-panel__welcome">
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} /> Hey there! Tell me what UI you want.
                        </p>
                        <p className="chat-panel__hint">Try: "Build a dashboard with a sidebar, stats cards, and a bar chart"</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                        <div className="chat-msg__bubble">
                            {msg.role === "assistant" && msg.explanation ? (
                                <div className="chat-msg__explanation">{msg.explanation}</div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-msg chat-msg--assistant">
                        <div className="chat-msg__bubble chat-msg__loading">
                            <Loader2 className="animate-spin" size={18} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-panel__input" onSubmit={handleSubmit}>
                <textarea
                    className="chat-input-field"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder={isLoading ? "Generating..." : "Describe your UI..."}
                    disabled={isLoading}
                    rows={1}
                    style={{
                        resize: 'none',
                        overflowY: input.split('\n').length > 10 ? 'auto' : 'hidden',
                        height: 'auto',
                        maxHeight: '200px'
                    }}
                />
                <button type="submit" disabled={isLoading || !input.trim()} style={{ height: '40px', alignSelf: 'flex-end' }}>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
