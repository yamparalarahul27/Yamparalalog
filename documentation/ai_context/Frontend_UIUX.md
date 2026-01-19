# UI/UX Frontend File

## Visual Design System
- **Radius**: Fully rounded components (`rounded-full`) for all interactive elements.
- **Color Palette**: 
  - Indigo/Blue as primary accent.
  - White backgrounds for premium card surfaces.
  - Subtle shadows (`shadow-sm`, `shadow-md`) for depth.
- **Animations**:
  - Pulsing indigo dots for active/status indicators.
  - Smooth transitions for tab switching and dialog openings.
- **Background**: Custom marble/blue wallpaper applied globally in `App.tsx`.

## Key User Flows
1. **Authentication Flow**:
   - Vertical/Horizontal selection grid.
   - Expandable "Design Team" accordion.
   - 4-digit PIN entry overlay.
2. **Tab Navigation**:
   - Persistent header with 3-tab navigation.
   - Content updates via `Radix Tabs` for instant switching.
3. **Log Creation Flow**:
   - Modal-based entry.
   - Drag-and-drop image upload.
   - Log linking via multi-select checkboxes.

## Component Hierarchy (`src/app/components/`)
- `App.tsx`: Main Controller & State.
- `LoginScreen.tsx`: The auth gateway.
- `DesignLogCard.tsx`: Complex card with media & comments.
- `AddLogDialog.tsx`: Central form for data entry.
- `ui/`: Design system primitives (Button, Input, etc.).
- `UPIDialog.tsx`: Payment and support interface.

## User Experience Standards
- **Skeleton Loading**: Used in Logs and Wiki to maintain layout during fetches.
- **Optimistic UI**: Deleting logs happens instantly for zero-latency feel.
- **Toast Notifications**: Used for every server interaction success/failure.
