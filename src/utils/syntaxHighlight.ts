import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-csv'

export function highlightJson(code: string): string {
  return Prism.highlight(code, Prism.languages.json, 'json')
}

export function highlightCsv(code: string): string {
  // Add custom CSV grammar if not exists
  if (!Prism.languages.csv) {
    Prism.languages.csv = {
      'header': {
        pattern: /^[^,\n]+(,[^,\n]+)*(?=\n)/,
        inside: {
          'column': /[^,\n]+/
        }
      },
      'value': {
        pattern: /"[^"]*"|[^,\n]+/g,
        inside: {
          'string': /"[^"]*"/,
          'number': /\b\d+(?:\.\d+)?\b/,
          'boolean': /\b(?:true|false)\b/i,
          'null': /\bnull\b/i
        }
      },
      'delimiter': /,/
    }
  }

  return Prism.highlight(code, Prism.languages.csv, 'csv')
}

// Add syntax highlighting styles
const styles = `
.token.string { color: #a8ff60; }
.token.number { color: #ff9d00; }
.token.boolean { color: #ff628c; }
.token.null { color: #ff628c; }
.token.property { color: #ffd700; }
.token.column { color: #ffd700; font-weight: bold; }
.token.delimiter { color: #808080; }
.token.punctuation { color: #808080; }
`

// Create a style element and append it to the document head
const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)
