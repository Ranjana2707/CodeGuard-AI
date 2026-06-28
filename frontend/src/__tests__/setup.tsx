import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr:  ({ children, ...props }: any) => <tr  {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}))
