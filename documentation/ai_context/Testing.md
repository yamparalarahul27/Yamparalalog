# Test File: Quality Assurance (Optional)

## Automated Testing (Playwright)
- **Framework**: Playwright (E2E browser testing).
- **Configuration**: `playwright.config.ts`.
- **Location**: `tests/` directory.

### Core Test Modules
- `auth.spec.ts`: Login success/failure, PIN changes, and session management.
- `header.spec.ts`: UI rounding, pulses, support dialog, and mobile responsiveness.
- `logs.spec.ts`: CRUD operations, soft-delete, restore, and admin commenting.
- `wiki.spec.ts`: Page creation, markdown editing, and YouTube video verification.
- `resources.spec.ts`: Sharing links and verifying Microlink image previews.

## Pass & Fail Cases

### [PASS] Requirements
- **Auth**: User enters 2703 -> Dashboard is visible within 1 second.
- **UI**: Support button class list contains `bg-white` and `rounded-full`.
- **Logs**: Deleting a log removes it from the grid and increases the Trash count.

### [FAIL] Preventative Cases
- **Auth**: Entering "0000" must show "Invalid PIN" and block dashboard access.
- **Logic**: A non-admin user must not see the "Admin Panel" menu item in the Options dropdown.
- **Validation**: Attempting to save a log without a title must be blocked by frontend validation.

## Running Tests
```bash
npm run test:e2e      # Run all tests in terminal
npm run test:e2e:ui   # Run in interactive UI mode
```
