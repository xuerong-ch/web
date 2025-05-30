import { marked } from 'marked';

interface ProcessedText {
  content: string;
  error?: string;
}

/**
 * Processes text content by removing content before the first "---" delimiter
 * and converting the remaining content to markdown format.
 * 
 * @param text - The raw text content to process
 * @returns ProcessedText object containing the processed content and any potential errors
 */
export const processTextContent = (text: string): ProcessedText => {
  try {
    // Handle empty input
    if (!text.trim()) {
      return {
        content: '',
        error: 'El contenido está vacío'
      };
    }

    // Find the first occurrence of "---"
    const delimiterIndex = text.indexOf('---');
    
    // If no delimiter is found, return the original text as markdown
    if (delimiterIndex === -1) {
      return {
        content: marked.parse(text)
      };
    }

    // Extract content after the first "---"
    const contentAfterDelimiter = text.slice(delimiterIndex + 3).trim();
    
    // Convert to markdown
    const markdownContent = marked.parse(contentAfterDelimiter);

    return {
      content: markdownContent
    };
  } catch (error) {
    return {
      content: '',
      error: `Error al procesar el texto: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Extracts sections from the text content based on headers.
 * Useful for breaking down detailed analysis into parts.
 * 
 * @param text - The text content to process
 * @returns Object containing different sections of the analysis
 */
export const extractSections = (text: string): Record<string, string> => {
  const sections: Record<string, string> = {};
  
  try {
    // Split by headers (lines starting with #)
    const lines = text.split('\n');
    let currentSection = 'default';
    let currentContent: string[] = [];

    lines.forEach(line => {
      if (line.startsWith('#')) {
        // If we were building a section, save it
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
          currentContent = [];
        }
        // Update current section name (remove # and trim)
        currentSection = line.replace(/^#+\s*/, '').trim();
      } else {
        currentContent.push(line);
      }
    });

    // Save the last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

  } catch (error) {
    sections.error = `Error al extraer secciones: ${error instanceof Error ? error.message : String(error)}`;
  }

  return sections;
};

/**
 * Formats the text content for display by applying custom styling
 * and handling special cases.
 * 
 * @param text - The text content to format
 * @returns Formatted HTML string ready for display
 */
export const formatTextForDisplay = (text: string): string => {
  try {
    const processed = processTextContent(text);
    
    if (processed.error) {
      return `<div class="text-red-500">${processed.error}</div>`;
    }

    // Add custom classes for styling
    return processed.content
      .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4">')
      .replace(/<h2>/g, '<h2 class="text-xl font-semibold mb-3">')
      .replace(/<h3>/g, '<h3 class="text-lg font-medium mb-2">')
      .replace(/<p>/g, '<p class="mb-4">')
      .replace(/<ul>/g, '<ul class="list-disc pl-5 mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal pl-5 mb-4">')
      .replace(/<li>/g, '<li class="mb-1">');
  } catch (error) {
    return `<div class="text-red-500">Error al formatear el texto: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
};