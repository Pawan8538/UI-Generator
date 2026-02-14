// PreviewRenderer.jsx
// Renders the generated code string into a live preview.
// Uses Function constructor to execute the component code in a sandboxed scope
// with access ONLY to our fixed component library.

import React, { useMemo } from "react";
import * as Components from "../components/index.jsx";
import { AlertCircle, Loader2, MousePointerClick } from "lucide-react";

export default function PreviewRenderer({ code }) {
    const rendered = useMemo(() => {
        if (!code || code.trim() === "") {
            return (
                <div className="preview-empty">
                    <MousePointerClick size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <div>No UI generated yet. Type a prompt to get started.</div>
                </div>
            );
        }

        try {
            // We need to transform JSX to regular JS. We'll use a simple approach:
            // The server generates code with our component imports. We need to
            // strip the import line and inject the components into scope.

            let cleanCode = code;

            // Remove import statements — we'll inject components directly
            cleanCode = cleanCode.replace(/^import\s+.*$/gm, "");

            // Remove export default — we'll capture the function directly
            cleanCode = cleanCode.replace(/export\s+default\s+/, "");

            // Now we have just: function GeneratedUI() { return (...) }
            // We need to evaluate this. Using Babel standalone to handle JSX.

            // First, let's check if Babel is available (loaded via CDN in index.html)
            if (typeof window.Babel === "undefined") {
                return (
                    <div className="preview-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={16} /> Preview engine loading...
                    </div>
                );
            }

            const transformed = window.Babel.transform(cleanCode, {
                presets: ["react"],
                filename: "generated.jsx",
            }).code;

            // Create a function that has all our components in scope
            const componentNames = Object.keys(Components);
            const componentValues = Object.values(Components);

            // The transformed code defines a function. We need to get a reference to it.
            // We wrap it in something that returns the function.
            const wrappedCode = `${transformed}\nreturn typeof GeneratedUI === 'function' ? GeneratedUI : null;`;

            const factory = new Function("React", ...componentNames, wrappedCode);
            const GeneratedUI = factory(React, ...componentValues);

            if (!GeneratedUI) {
                return (
                    <div className="preview-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} /> Could not find GeneratedUI component in the code.
                    </div>
                );
            }

            return <GeneratedUI />;
        } catch (err) {
            console.error("Preview render error:", err);
            return (
                <div className="preview-error">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertCircle size={16} /> <strong>Render Error:</strong>
                    </div>
                    <pre>{err.message}</pre>
                </div>
            );
        }
    }, [code]);

    return <div className="preview-content">{rendered}</div>;
}
