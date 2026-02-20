# System Guidelines

Use this file to govern the AI's behavior within this codebase. 

## General Architecture Rules

1. **State Management:** Keep state local when possible, or extract complex state orchestration into custom hooks inside `src/app/hooks/`. Do not introduce global state managers.
2. **API Communication:** All communication with the backend MUST go through `apiClient` defined in `src/app/api/index.ts`. Do not make raw `fetch` or `axios` calls from components.
3. **Immutability:** Always treat state as immutable. Use functional setState patterns or array mapping when updating logs or users.

## UI/UX Guidelines

* **Colors & Theme:** The application uses a subtle, minimal theme defined in `tailwind.config.ts`. Prefer existing utility classes for spacing (e.g., `gap-4`, `p-6`) over arbitrary values.
* **Component Splitting:** If a component grows over 200 lines, extract its parts. For example, large dialogs should have their form logic split from their presentation.
* **Icons:** Use `lucide-react` for all iconography. Ensure icons have consistent `size` props aligned with surrounding text (usually `h-4 w-4` or `h-5 w-5`).

## Documentation & AI Collaboration

* **TypeScript Definitions:** Any new data structure must be added to `src/app/components/types.ts` with comprehensive JSDoc comments explaining its purpose in the product domain. This helps subsequent AI agents understand the intent.
* **Context Overlap:** If an instruction contradicts `ForAIContext.txt`, ALWAYS defer to `ForAIContext.txt`. It is the definitive source of truth.
