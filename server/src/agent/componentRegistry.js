// componentRegistry.js
// This is the single source of truth for every component the AI is allowed to use.
// If a component is not listed here, it does not exist to the AI.

const COMPONENT_REGISTRY = {
  Button: {
    description: "A clickable button",
    props: {
      children: { type: "string", required: true, description: "Button label text" },
      variant: { type: "enum", values: ["primary", "secondary", "outline", "danger"], default: "primary" },
      size: { type: "enum", values: ["sm", "md", "lg"], default: "md" },
      disabled: { type: "boolean", default: false },
      onClick: { type: "string", description: "What happens when clicked (just a description)" },
    },
  },
  Card: {
    description: "A container with a border and padding, used to group related content",
    props: {
      title: { type: "string", description: "Card header title" },
      children: { type: "node", required: true, description: "Content inside the card" },
    },
  },
  Input: {
    description: "A text input field",
    props: {
      label: { type: "string", description: "Label above the input" },
      placeholder: { type: "string", description: "Placeholder text" },
      type: { type: "enum", values: ["text", "email", "password", "number", "search"], default: "text" },
      disabled: { type: "boolean", default: false },
    },
  },
  Table: {
    description: "A data table that shows rows and columns",
    props: {
      columns: { type: "array", items: "string", required: true, description: "Column header names" },
      rows: { type: "array", items: "array", required: true, description: "2D array of cell values" },
    },
  },
  Modal: {
    description: "A popup dialog/overlay",
    props: {
      title: { type: "string", required: true, description: "Modal title" },
      isOpen: { type: "boolean", default: true },
      children: { type: "node", required: true, description: "Content inside the modal" },
    },
  },
  Sidebar: {
    description: "A vertical navigation panel on the left side",
    props: {
      items: { type: "array", items: "object", required: true, description: "Array of {label, icon} objects" },
      activeItem: { type: "string", description: "Currently active item label" },
    },
  },
  Navbar: {
    description: "A horizontal navigation bar at the top",
    props: {
      brand: { type: "string", description: "Brand/logo text" },
      items: { type: "array", items: "string", description: "Navigation link labels" },
    },
  },
  Typography: {
    description: "Text element for headings and body text",
    props: {
      variant: { type: "enum", values: ["h1", "h2", "h3", "h4", "body", "caption"], default: "body" },
      children: { type: "string", required: true, description: "The text content" },
    },
  },
  Chart: {
    description: "A simple chart/graph (uses mocked data)",
    props: {
      type: { type: "enum", values: ["bar", "line", "pie"], default: "bar" },
      title: { type: "string", description: "Chart title" },
      data: {
        type: "array",
        items: "object",
        description: "Array of objects. Each object MUST have 'label' (string) and 'value' (number). Example: [{'label': 'A', 'value': 10}]",
      },
    },
  },
  Image: {
    description: "An image placeholder",
    props: {
      src: { type: "string", description: "Image URL (e.g. 'https://placehold.co/600x400')", default: "https://placehold.co/600x400" },
      alt: { type: "string", required: true, description: "Alt text for the image" },
      width: { type: "string", default: "100%", description: "Width of the image" },
      height: { type: "string", default: "auto", description: "Height of the image" },
    },
  },
  Alert: {
    description: "A notification/alert banner",
    props: {
      message: { type: "string", required: true, description: "Alert message" },
      type: { type: "enum", values: ["info", "success", "warning", "error"], default: "info" },
    },
  },
  Flex: {
    description: "A flexbox layout container to arrange children horizontally or vertically",
    props: {
      direction: { type: "enum", values: ["row", "column"], default: "row" },
      gap: { type: "enum", values: ["sm", "md", "lg"], default: "md" },
      align: { type: "enum", values: ["start", "center", "end", "stretch"], default: "stretch" },
      justify: { type: "enum", values: ["start", "center", "end", "between", "around"], default: "start" },
      wrap: { type: "boolean", default: false },
      children: { type: "node", required: true },
    },
  },
  Grid: {
    description: "A CSS grid layout container",
    props: {
      columns: { type: "number", default: 2, description: "Number of columns" },
      gap: { type: "enum", values: ["sm", "md", "lg"], default: "md" },
      children: { type: "node", required: true },
    },
  },
  Container: {
    description: "A centered content wrapper with max-width",
    props: {
      children: { type: "node", required: true },
    },
  },
};

// List of allowed component names for quick whitelist checks
const ALLOWED_COMPONENTS = Object.keys(COMPONENT_REGISTRY);

// Build a text description of all components for the AI prompts
function getComponentSummaryForPrompt() {
  let summary = "AVAILABLE COMPONENTS (you can ONLY use these):\n\n";
  for (const [name, config] of Object.entries(COMPONENT_REGISTRY)) {
    summary += `<${name}>: ${config.description}\n`;
    summary += `  Props:\n`;
    for (const [propName, propConfig] of Object.entries(config.props)) {
      let line = `    - ${propName}`;
      if (propConfig.type === "enum") {
        line += ` (one of: ${propConfig.values.join(", ")})`;
      } else {
        line += ` (${propConfig.type})`;
      }
      if (propConfig.required) line += " [REQUIRED]";
      if (propConfig.default !== undefined) line += ` [default: ${propConfig.default}]`;
      if (propConfig.description) line += ` — ${propConfig.description}`;
      summary += line + "\n";
    }
    summary += "\n";
  }
  return summary;
}

export { COMPONENT_REGISTRY, ALLOWED_COMPONENTS, getComponentSummaryForPrompt };
