// components/index.jsx
// The fixed component library. These implementations NEVER change.
// The AI selects and composes them, it cannot modify them.

import "./components.css";
import {
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Image as ImageIcon,
    Layout,
    Home,
    Settings,
    User,
    BarChart,
    PieChart,
    FileText,
    CreditCard,
    Users
} from "lucide-react";
import React from "react";

// Icon map for Sidebar
const ICON_MAP = {
    Home: Home,
    Settings: Settings,
    User: User,
    Profile: User,
    Chart: BarChart,
    Analytics: PieChart,
    Docs: FileText,
    Billing: CreditCard,
    Users: Users,
    Dashboard: Layout,
    default: Layout
};

// ========== BUTTON ==========
export function Button({ children, variant = "primary", size = "md", disabled = false, onClick }) {
    return (
        <button
            className={`ui-btn ui-btn--${variant} ui-btn--${size}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

// ========== CARD ==========
export function Card({ title, children }) {
    return (
        <div className="ui-card">
            {title && <h3 className="ui-card__title">{title}</h3>}
            <div className="ui-card__body">{children}</div>
        </div>
    );
}

// ========== INPUT ==========
export function Input({ label, placeholder, type = "text", disabled = false }) {
    return (
        <div className="ui-input-group">
            {label && <label className="ui-input-group__label">{label}</label>}
            <input
                className="ui-input"
                type={type}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
}

// ========== TABLE ==========
export function Table({ columns = [], rows = [] }) {
    return (
        <div className="ui-table-wrapper">
            <table className="ui-table">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={ri}>
                            {row.map((cell, ci) => (
                                <td key={ci}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ========== MODAL ==========
export function Modal({ title, isOpen = true, children }) {
    if (!isOpen) return null;
    return (
        <div className="ui-modal-overlay">
            <div className="ui-modal">
                <h3 className="ui-modal__title">{title}</h3>
                <div className="ui-modal__body">{children}</div>
            </div>
        </div>
    );
}

// ========== SIDEBAR ==========
export function Sidebar({ items = [], activeItem }) {
    return (
        <nav className="ui-sidebar">
            {items.map((item, i) => {
                // Try to match icon by name, or fallback
                const IconComponent = ICON_MAP[item.label] || ICON_MAP[item.icon] || ICON_MAP.default;

                return (
                    <div
                        key={i}
                        className={`ui-sidebar__item ${item.label === activeItem ? "ui-sidebar__item--active" : ""}`}
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                        <IconComponent size={18} />
                        <span>{item.label}</span>
                    </div>
                );
            })}
        </nav>
    );
}

// ========== NAVBAR ==========
export function Navbar({ brand, items = [] }) {
    return (
        <nav className="ui-navbar">
            <div className="ui-navbar__brand">{brand}</div>
            <ul className="ui-navbar__links">
                {items.map((item, i) => (
                    <li key={i} className="ui-navbar__link">{item}</li>
                ))}
            </ul>
        </nav>
    );
}

// ========== TYPOGRAPHY ==========
export function Typography({ variant = "body", children }) {
    const Tag = variant.startsWith("h") ? variant : "p";
    return <Tag className={`ui-typo ui-typo--${variant}`}>{children}</Tag>;
}

// ========== CHART (mocked visuals) ==========
const CHART_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

export function Chart({ type = "bar", title, data = [] }) {
    // Validate and clean data
    const safeData = Array.isArray(data) ? data.map(d => ({
        label: d.label || "Unknown",
        value: typeof d.value === "number" ? d.value : 0
    })) : [];

    const isEmpty = safeData.length === 0;
    const maxVal = Math.max(...safeData.map((d) => d.value), 1);

    return (
        <div className="ui-chart">
            {title && <h4 className="ui-chart__title">{title}</h4>}

            {isEmpty ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>
                    No chart data available
                </div>
            ) : (
                <>
                    {type === "bar" && (
                        <div className="ui-chart__bars">
                            {safeData.map((d, i) => (
                                <div
                                    key={i}
                                    className="ui-chart__bar"
                                    style={{
                                        height: `${Math.max((d.value / maxVal) * 100, 4)}%`, // Min 4% height to be visible
                                        background: CHART_COLORS[i % CHART_COLORS.length],
                                    }}
                                >
                                    <span className="ui-chart__bar-label">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {type === "line" && (
                        <div className="ui-chart__line-container">
                            <svg width="100%" height="120" style={{ overflow: 'visible' }}>
                                <polyline
                                    points={safeData.map((d, i) => `${i * 60 + 30},${120 - (d.value / maxVal) * 100}`).join(" ")}
                                    fill="none"
                                    stroke="#4f46e5"
                                    strokeWidth="2"
                                />
                                {safeData.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={i * 60 + 30}
                                        cy={120 - (d.value / maxVal) * 100}
                                        r="4"
                                        fill="#4f46e5"
                                    />
                                ))}
                            </svg>
                            <div style={{ display: "flex", justifyContent: "flex-start", gap: "45px", paddingLeft: "15px", overflowX: "auto" }}>
                                {safeData.map((d, i) => (
                                    <span key={i} style={{ fontSize: 11, color: "#6b7280", minWidth: "30px", textAlign: "center" }}>{d.label}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === "pie" && (
                        <div className="ui-chart__pie">
                            <div
                                className="ui-chart__pie-visual"
                                style={{
                                    background: `conic-gradient(${safeData
                                        .map((d, i) => {
                                            const total = safeData.reduce((s, x) => s + x.value, 0) || 1;
                                            const startPct = safeData.slice(0, i).reduce((s, x) => s + (x.value / total) * 100, 0);
                                            const endPct = startPct + (d.value / total) * 100;
                                            return `${CHART_COLORS[i % CHART_COLORS.length]} ${startPct}% ${endPct}%`;
                                        })
                                        .join(", ")})`,
                                }}
                            />
                            <div className="ui-chart__pie-legend">
                                {safeData.map((d, i) => (
                                    <div key={i} className="ui-chart__pie-legend-item">
                                        <span className="ui-chart__pie-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        {d.label}: {d.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ========== IMAGE ==========
export function Image({ src = "https://placehold.co/600x400", alt, width = "100%", height = "auto" }) {
    return (
        <div className="ui-image-container" style={{ width, height, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", borderRadius: "8px" }}>
            <img
                src={src}
                alt={alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=Image+Error";
                }}
            />
        </div>
    );
}

// ========== ALERT ==========
export function Alert({ message, type = "info" }) {
    const Icon = {
        info: Info,
        success: CheckCircle,
        warning: AlertTriangle,
        error: XCircle
    }[type] || Info;

    return (
        <div className={`ui-alert ui-alert--${type}`}>
            <Icon size={18} />
            <span>{message}</span>
        </div>
    );
}

// ========== FLEX ==========
export function Flex({ direction = "row", gap = "md", align = "stretch", justify = "start", wrap = false, children }) {
    const classes = [
        "ui-flex",
        `ui-flex--${direction}`,
        `ui-flex--gap-${gap}`,
        `ui-flex--align-${align}`,
        `ui-flex--justify-${justify}`,
        wrap ? "ui-flex--wrap" : "",
    ].filter(Boolean).join(" ");

    return <div className={classes}>{children}</div>;
}

// ========== GRID ==========
export function Grid({ columns = 2, gap = "md", children }) {
    const colClass = columns > 4 ? "ui-grid--cols-4" : `ui-grid--cols-${columns}`;
    return <div className={`ui-grid ${colClass} ui-grid--gap-${gap}`}>{children}</div>;
}

// ========== CONTAINER ==========
export function Container({ children }) {
    return <div className="ui-container">{children}</div>;
}
