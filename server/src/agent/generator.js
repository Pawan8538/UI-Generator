// generator.js
// Step 2 of the agent pipeline.
// Takes the JSON plan from the Planner and converts it into valid React/JSX code.
// This is a DETERMINISTIC function — no AI involved, just a tree-to-code mapper.

import { ALLOWED_COMPONENTS } from "./componentRegistry.js";

function escapeJSX(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/{/g, "&#123;")
        .replace(/}/g, "&#125;");
}

function generateCodeFromPlan(plan) {
    if (!plan || !plan.layout) {
        return '// No layout plan provided\nexport default function GeneratedUI() {\n  return <div>No UI generated yet.</div>;\n}';
    }

    const usedComponents = new Set();

    function renderNode(node, indent = 2) {
        const pad = " ".repeat(indent);

        // If it's just a string, return it as text
        if (typeof node === "string") {
            return `${pad}${escapeJSX(node)}`;
        }

        if (!node || !node.type) return "";

        // STRICTNESS CHECK: If component is not in registry, do NOT render it.
        // This prevents "hallucinated" HTML tags like <div>, <span>, etc.
        if (!ALLOWED_COMPONENTS.includes(node.type)) {
            console.warn(`[Generator] Blocked prohibited component: ${node.type}`);
            return `${pad}{/* ⚠️ Blocked prohibited component: "${node.type}" */}`;
        }

        usedComponents.add(node.type);

        const tag = node.type;
        const props = node.props || {};
        const children = node.children || [];

        // Build the props string
        let propsStr = "";
        for (const [key, value] of Object.entries(props)) {
            if (key === "children") continue; // children go inside the tag
            if (typeof value === "string") {
                propsStr += ` ${key}="${value}"`;
            } else if (typeof value === "boolean") {
                propsStr += value ? ` ${key}` : ` ${key}={false}`;
            } else if (typeof value === "number") {
                propsStr += ` ${key}={${value}}`;
            } else {
                // arrays, objects — pass as JSX expression
                propsStr += ` ${key}={${JSON.stringify(value)}}`;
            }
        }

        // If the component has a "children" prop that is a string (like Button), render it inline
        const childrenPropText = typeof props.children === "string" ? escapeJSX(props.children) : props.children;

        // Figure out what goes inside the tags
        const hasNestedChildren = children.length > 0;
        const hasTextChildren = typeof childrenPropText === "string";

        if (!hasNestedChildren && !hasTextChildren) {
            // Self-closing
            return `${pad}<${tag}${propsStr} />`;
        }

        if (hasTextChildren && !hasNestedChildren) {
            return `${pad}<${tag}${propsStr}>${childrenPropText}</${tag}>`;
        }

        // Has nested children
        let code = `${pad}<${tag}${propsStr}>\n`;
        if (hasTextChildren) {
            code += `${pad}  ${childrenPropText}\n`;
        }
        for (const child of children) {
            code += renderNode(child, indent + 2) + "\n";
        }
        code += `${pad}</${tag}>`;
        return code;
    }

    const bodyCode = renderNode(plan.layout, 4);
    const componentsList = Array.from(usedComponents);

    // Build the import statement
    const importLine =
        componentsList.length > 0
            ? `import { ${componentsList.join(", ")} } from "./components";\n\n`
            : "";

    const fullCode = `${importLine}export default function GeneratedUI() {
  return (
${bodyCode}
  );
}`;

    return fullCode;
}

export { generateCodeFromPlan };
