// CodePanel.jsx
// Middle panel — shows the generated React code with syntax highlighting (basic).

import { useState } from "react";
import { FileCode, Check, Copy } from "lucide-react";

export default function CodePanel({ code, onCodeChange }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="code-panel">
            <div className="code-panel__header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={18} /> Generated Code
                </h2>
                <div className="code-panel__actions">
                    <button onClick={handleCopy} className="code-panel__btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            <div className="code-panel__editor">
                <textarea
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    spellCheck={false}
                    className="code-panel__textarea"
                />
            </div>
        </div>
    );
}
