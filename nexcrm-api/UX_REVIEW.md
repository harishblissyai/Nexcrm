# NexCRM UX Review

## Wave 3 — Frontend UX Review

### Applied UX Fixes

#### Login Page
- **Issue**: No visual feedback during login/register
  **Fix**: Button shows "Please wait…" disabled state with spinner context
- **Issue**: No toggle between register/login modes
  **Fix**: Mode toggle button added at bottom of form
- **Issue**: Password field had no min-length hint
  **Fix**: Validation error shows "Minimum 6 characters"
- **Issue**: No email format validation on submit
  **Fix**: Inline regex validation before API call

#### Contacts Page
- **Issue**: No empty state guidance
  **Fix**: DataTable empty message: "No contacts yet. Create your first one!"
- **Issue**: Delete had no confirmation
  **Fix**: `confirm()` dialog before delete
- **Issue**: No loading state on table
  **Fix**: Spinner shown while fetching

#### Leads Page
- **Issue**: Status filter not visually distinct when active
  **Fix**: Active filter pill uses solid `bg-primary-600 text-white`
- **Issue**: No deal value formatting
  **Fix**: Value rendered as `$50,000` with `toLocaleString()`

#### Forms (All)
- **Issue**: Required fields not marked
  **Fix**: Red asterisk `*` on all required labels
- **Issue**: Error state not reflected on input border
  **Fix**: `border-red-400` applied to invalid inputs
- **Issue**: Cancel button lacked focus ring
  **Fix**: All buttons use consistent `focus:ring-2` styles via `.btn` class

#### Global
- **Issue**: No toast notifications for CRUD outcomes
  **Fix**: `react-hot-toast` integrated on all create/update/delete actions
- **Issue**: No keyboard navigation support on modals
  **Fix**: `Escape` key closes modals via `useEffect` listener
- **Issue**: Search dropdown stayed open after selecting result
  **Fix**: `setResults(null)` + `setQuery('')` on result click

#### Accessibility
- Modal has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- All icon-only buttons have `title` attributes
- Form inputs linked to labels
- Focus visible on all interactive elements (Tailwind `focus:outline-none focus:ring`)
