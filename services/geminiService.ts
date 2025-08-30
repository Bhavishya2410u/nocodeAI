import { GoogleGenAI } from "@google/genai";
import type { CanvasComponent } from '../types';

// Safely get the API key without crashing the app on load.
const getApiKey = (): string | undefined => {
    try {
        // In a browser environment, a polyfill is expected to place `process.env` on the window object.
        return (window as any).process?.env?.API_KEY;
    } catch (e) {
        console.error("Could not access process.env.API_KEY", e);
        return undefined;
    }
};

const apiKey = getApiKey();

// Initialize AI client only if the key exists. Functions will check for the client's existence.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;


function formatComponentsForPrompt(components: CanvasComponent[], indentLevel = 0): string {
    if (components.length === 0 && indentLevel === 0) {
        return "The user has not added any components. Generate a visually appealing landing page with a main heading, a paragraph of text, and a call-to-action button. The theme should be modern and clean.";
    }

    const indent = '  '.repeat(indentLevel);
    return components.map((comp, index) => {
        const propsString = Object.entries(comp.props)
            .map(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'desktop' in value && 'tablet' in value && 'mobile' in value) {
                    const responsiveString = `desktop: "${value.desktop}", tablet: "${value.tablet}", mobile: "${value.mobile}"`;
                    return `${key}: { ${responsiveString} }`;
                }
                return `${key}: "${value}"`;
            })
            .join(', ');
            
        let componentStr = `${indent}${index + 1}. A '${comp.type}' component with these properties: { ${propsString} }.`;

        if (comp.children && comp.children.length > 0) {
            componentStr += `\n${indent}  It contains the following child components:\n` + formatComponentsForPrompt(comp.children, indentLevel + 2);
        }

        return componentStr;
    }).join('\n');
}

export async function generateFrontendCode(components: CanvasComponent[]): Promise<string> {
    if (!ai) {
      throw new Error("Gemini AI client is not initialized. Please configure your API_KEY.");
    }
    const componentPrompt = formatComponentsForPrompt(components);
    const fullPrompt = `
      You are an expert frontend developer specializing in creating pixel-perfect, **responsive** UIs with HTML and Tailwind CSS.
      Your task is to generate a single, complete, standalone HTML file based on a hierarchical component structure.

      **CRITICAL: Your output MUST be mobile-first.** Use base utility classes for mobile styles, \`md:\` prefixes for tablet styles, and \`lg:\` prefixes for desktop styles.

      **Requirements:**
      1.  **Structure:** The file must be a valid HTML5 document.
      2.  **Styling:** Use Tailwind CSS via the official CDN. You MUST use Tailwind utility classes for all styling.
      3.  **Responsiveness:** Many properties are provided as objects with \`mobile\`, \`tablet\`, and \`desktop\` keys.
          - **Mobile:** Apply the \`mobile\` value directly (e.g., \`text-lg\`).
          - **Tablet:** Apply the \`tablet\` value with the \`md:\` prefix (e.g., \`md:text-xl\`).
          - **Desktop:** Apply the \`desktop\` value with the \`lg:\` prefix (e.g., \`lg:text-2xl\`).
          - **Optimization:** If a value is the same across breakpoints, you don't need to repeat it. E.g., if mobile and tablet are identical, just define the mobile class, and then the desktop class with \`lg:\`.
      4.  **Layout:** Pay close attention to parent-child relationships and responsive layout properties.
          - For 'FlexContainer' and 'Card', a \`gridColumns\` property of \`{ mobile: 1, tablet: 2, desktop: 4 }\` must translate to classes: \`grid-cols-1 md:grid-cols-2 lg:grid-cols-4\`.
          - A \`flexDirection\` of \`{ mobile: 'column', tablet: 'column', desktop: 'row' }\` must translate to \`flex-col lg:flex-row\`.
          - Apply other flex/grid properties (\`justifyContent\`, \`alignItems\`, \`gap\`) responsively.
      5.  **Properties:** Meticulously apply all specified properties (padding, margin, color, fontSize, etc.) using their corresponding Tailwind classes, following the responsive rules above. For numeric values (px), map them to Tailwind's spacing/font-size scale where possible (e.g., 16px -> p-4, text-base; 24px -> p-6, text-xl).
      6.  **Aesthetics:** The body should have a dark theme (\`bg-slate-900\`). Ensure the output is professional, modern, and visually appealing.
      7.  **Purity:** Output only pure HTML with Tailwind classes. No JavaScript, React, or JSX.

      **User's Design Hierarchy:**
      ${componentPrompt}

      **Example Responsive Translation:**
      - A property \`paddingTop: { mobile: 8, tablet: 16, desktop: 24 }\` should become class string \`pt-2 md:pt-4 lg:pt-6\`.
      - A property \`textAlign: { mobile: 'center', tablet: 'center', desktop: 'left' }\` should become class string \`text-center lg:text-left\`.

      Now, generate the complete HTML file based on the user's design.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        
        const codeBlock = response.text;
        // Clean potential markdown formatting
        const cleanedCode = codeBlock.replace(/^```(html)?\n/, '').replace(/\n```$/, '');
        return cleanedCode;
    } catch (error) {
        console.error("Error generating frontend code:", error);
        throw new Error("Failed to generate frontend code. Please check the console for details.");
    }
}


export async function generateBackendCode(prompt: string): Promise<string> {
    if (!ai) {
      throw new Error("Gemini AI client is not initialized. Please configure your API_KEY.");
    }
    const fullPrompt = `
      You are an expert backend developer specializing in Node.js, Express, and Prisma.
      Based on the user's request, generate a complete, production-ready 'server.js' file and a 'schema.prisma' file.

      **User Request:** "${prompt}"

      **Instructions for 'server.js':**
      - Set up a basic Express server.
      - Enable CORS using the 'cors' package.
      - Import and instantiate PrismaClient.
      - Create full boilerplate CRUD (Create, Read, Update, Delete) API endpoints for each model.
      - Implement robust error handling using try/catch blocks for all database operations.
      - Return appropriate HTTP status codes (e.g., 200, 201, 400, 404, 500).
      - Include basic data validation for required fields on CREATE and UPDATE routes.

      **Instructions for 'schema.prisma':**
      - Define models that accurately reflect the user's request.
      - Include appropriate data types, relations, and default values (like \`@default(now())\` for timestamps).

      **Output Format:**
      Provide the output in two separate, clearly labeled markdown code blocks. Include a third block listing the necessary npm dependencies.

      ### Required Dependencies
      \`\`\`bash
      npm install express cors @prisma/client
      npm install prisma --save-dev
      npx prisma init
      \`\`\`

      ### schema.prisma
      \`\`\`prisma
      // provider and generator
      datasource db {
        provider = "sqlite"
        url      = "file:./dev.db"
      }
      generator client {
        provider = "prisma-client-js"
      }

      // Your models here...
      \`\`\`

      ### server.js
      \`\`\`javascript
      const express = require('express');
      const { PrismaClient } = require('@prisma/client');
      const cors = require('cors');

      const prisma = new PrismaClient();
      const app = express();

      app.use(cors());
      app.use(express.json());

      // Your routes here...

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(\`Server is running on port \${PORT}\`);
      });
      \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text;
    } catch (error)
    {
        console.error("Error generating backend code:", error);
        throw new Error("Failed to generate backend code. Please check the console for details.");
    }
}