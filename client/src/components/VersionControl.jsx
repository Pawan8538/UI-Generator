// components/VersionControl.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, History, RotateCcw } from 'lucide-react';

export default function VersionControl({ versions, currentVersion, onRollback, onReset }) {
    if (versions.length === 0) return null;

    return (
        <div className="version-control">
            <div className="version-control__nav">
                <button
                    className="version-control__btn"
                    disabled={currentVersion <= 0}
                    onClick={() => onRollback(currentVersion - 1)}
                    title="Previous Version"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="version-control__info">
                    v{currentVersion + 1} <span className="text-dim">/ {versions.length}</span>
                </span>

                <button
                    className="version-control__btn"
                    disabled={currentVersion >= versions.length - 1}
                    onClick={() => onRollback(currentVersion + 1)}
                    title="Next Version"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="version-control__divider"></div>

            <button className="version-control__reset" onClick={onReset} title="Reset All">
                <RotateCcw size={14} />
                <span>Reset</span>
            </button>

            <style jsx>{`
        .version-control {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        .version-control__nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .version-control__info {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          min-width: 60px;
          text-align: center;
        }
        .text-dim { color: var(--text-dim); }
        .version-control__btn {
          background: transparent;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .version-control__btn:hover:not(:disabled) {
          background: var(--bg-panel);
          color: var(--accent);
        }
        .version-control__btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .version-control__divider {
          width: 1px;
          height: 16px;
          background: var(--border);
        }
        .version-control__reset {
          background: transparent;
          border: none;
          color: var(--danger);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .version-control__reset:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
        </div>
    );
}
