# Process File: Development & Deployment Workflow

## 1. Development Environment
- **Local Server**: Run `npm run dev` to start the development environment.
- **Visual Feedback (Agentation)**: 
    - The **Agentation** overlay is active in development mode.
    - Use it to visually annotate issues, design tweaks, or comprehensive feedback directly on the UI.
    - AI Agents MUST respect and address visual feedback provided via this tool.

## 2. Testing Standards
Before pushing ANY code, you must:
1.  **lint & Type Check**: Ensure no TypeScript errors.
2.  **E2E Testing (Optional)**: Run `npm run test:e2e` to verify core flows only when explicitly requested.
3.  **Build Verification**: Run `npm run build` to catch production-only build errors.

## 3. Deployment Workflow (CD)
- **Platform**: Vercel (Auto-deployed).
- **Trigger**: Push to the `main` branch.
- **Process**:
    ```bash
    git add .
    git commit -m "feat: description of changes"
    git push origin main
    ```
- **Verification**: Check Vercel dashboard or live URL for deployment status.

## 4. AI Agent Guidelines
- **Always** check `ForAIContext.txt` first.
- **Run tests** only when explicitly requested by the user.
- **Never** touch the `/.github/workflows/` folder unless explicitly asked (Vercel handles deployment).
