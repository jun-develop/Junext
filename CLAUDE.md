@AGENTS.md

# Junext

Next.js admin template for the Jungo API.

## Rules

- `src/core/` is the future shared package: logic only, no styled UI. It imports nothing from `src/` outside `src/core/` (architecture test).
- Features never import other features. Composition happens in `src/app/`.
- Import `z` from `@/core/validation`, never from `zod`. Zod messages are translation keys.
- Read env only through `src/core/env.ts` (server-only).
- Every visible string goes through next-intl. Add `en` and `vi` keys in the same change.
- API fields stay snake_case end to end. No camelCase mapping layer.
- No barrel files. Named exports, except where Next requires default exports.
- `src/components/ui` is shadcn output: add with `pnpm dlx shadcn add`, do not hand-edit or wrap.
- `cacheComponents` is off on purpose: user data is never cached by Next.

## Commands

`make check` runs lint, typecheck, format check and tests.
`pnpm api:types` regenerates `src/lib/jungo-schema.d.ts` from the running Jungo's OpenAPI spec (override with `JUNGO_OPENAPI_URL`); commit the result.

## Code Style

Mandatory. If a request conflicts with these rules or the architecture, ask instead of inventing a convention.

- New code follows these rules from day one. A change must not add a new violation.
- Existing code is brought in line only where a change already touches it. Do not refactor unrelated legacy code just to comply.

### Layout and boundaries

- A feature lives in `src/features/<feature>/` with `messages/en.json` and `messages/vi.json` (the architecture and i18n tests already expect this).
- `src/lib/`, `src/hooks/`, `src/components/` are shared and never import `src/features/` or `src/app/` (architecture test).
- Only the server calls Jungo; the browser never calls it directly. Server-only modules start with `import 'server-only'`.
- Call Jungo through `jungo` from `@/lib/jungo` (it adds the session token and the browser's IP) and `unwrap()` the result. Protected pages call `requirePermission(code)` (403 forbidden page without it; a missing record is still 404) or `requireSession()`; server actions call `hasPermission(code)` and return `forbiddenError()`. `src/proxy.ts` only refreshes tokens and redirects. Jungo enforces permissions again.
- `features/users` is the reference CRUD feature: copy its shape (`schemas.ts`, `data.ts`, `actions.ts`, `components/`, pages under `app/(app)/users` with the list in a `(list)` group so its `loading.tsx` does not cover detail pages).
- No circular imports. Shared logic used by two features moves to `src/core/` (logic) or `src/components/` (UI), never copied.
- Add a layer, wrapper or generic helper only when a second real caller exists.

### Naming

- Files and folders `kebab-case`. Components and types `PascalCase`, no `I` prefix. Functions and variables `camelCase`.
- `UPPER_SNAKE_CASE` only for module-level literal constants (`LOCALES`, `MOBILE_BREAKPOINT`). Schemas and built objects stay `camelCase`.
- Hooks `useXxx`. Booleans `is`/`has`/`can`/`should`. Handlers `handleXxx`; callback props `onXxx`. Server actions verb + noun (`createRole`).
- Name by intent: no `data`, `item`, `value`, `result` where a precise name exists. Abbreviate only common terms (`id`, `url`, `t`).
- Jungo API contract fields and the data structures that carry them keep `snake_case` (see Rules); everything else follows the conventions above.

### Formatting and control flow

- Prettier (`.prettierrc.json`, checked by `make check`, fixed with `pnpm format`) owns layout: single quotes in TS, double quotes in JSX attributes, semicolons, trailing commas in multiline lists, 100-column width, `(x) =>` parens. Arrays, call arguments and JSX attributes stay on one line when they fit and go one per line when not; multiline JSX is wrapped in parentheses. Never hand-format against it.
- Objects with three or more properties, or with a nested object, array or function, are multiline: break after `{`, one property per line. Prettier preserves this layout. Short flat objects (`{ key, params }`) may stay inline.
- One responsibility per function. Components and exported functions use `function`; arrows for callbacks and short local helpers.
- Exported non-component functions declare a return type. Components and Next convention exports (`page`, `layout`, `register`) may infer.
- Group related data or options into one object parameter. Keep positional parameters when their order is natural (`clamp(value, min, max)`).
- Guard clauses over nesting; at most two levels of nesting inside a function.
- Every `if`, `else` and loop body has braces and starts on its own line. This includes `return`.
- No nested ternaries. No `&&` / `||` used as a statement for side effects.
- In JSX, `{condition && <X />}` and one simple ternary are fine. More branches go in a named variable or an early return.
- Give complex conditions a name.

```tsx
// Bad
if (!user) return null;
isDirty && save();
const label = isAdmin ? 'admin' : isOwner ? 'owner' : 'member';

// Good
if (!user) {
  return null;
}
if (isDirty) {
  save();
}
const label = roleLabel(user);
return <>{isAdmin && <AdminBadge />}</>;
```

### Comments

- A comment sits on its own line above the code it explains. No trailing comments; the only exception is generator markers such as `/* junext:messages:en */`.
- Explain why, or behaviour the code cannot show. Never restate the code. No commented-out code. A `TODO` says what remains and why.
- Use `//` comments in Jungo style. A doc comment is one line that starts with the function name.
- A doc comment is required on server actions, route handlers, and exported non-component functions that hold business or validation logic.
- A `Flow:` line is also required when such a function has three or more distinct steps (validate, authorize, fetch, transform, write, side effect).
- Flow lists the real steps in execution order, joined by `->`. Update it in the same change that alters those steps.
- Not required on trivial helpers, formatters, types, or components that only render.

```ts
// createRole creates a role and grants its permissions.
//
// Flow: validate input -> check permission -> create role -> grant permissions -> reload
export async function createRole(input: CreateRoleInput): Promise<Role> {
```

### React and TypeScript

- Server Components by default. Put `'use client'` on the smallest component that needs state, effects or browser APIs.
- Components render and handle UI events. Business rules, data fetching and transformation live in server actions or server functions in the feature.
- Split a component that handles unrelated concerns or that no longer reads top to bottom.
- Follow the Hooks rules (lint). The React Compiler is on, so do not add `useMemo` / `useCallback` without a measured reason.
- No `useEffect` for values derivable during render. No state that duplicates props or other state.
- Reusable components declare explicit prop types; elsewhere prefer inference.
- No `any` (lint). Type assertions and `!` need a comment above them explaining why they are safe.
- Derive types (`z.infer`, Jungo response types) instead of redeclaring them. Use `import type` for types (lint).

### API, validation and errors

- Presentation components never call `fetch`. Request and response types are explicit and mirror the Jungo contract.
- Validate every server action and route handler input with `z` from `@/core/validation` before using it.
- Prefer `async`/`await`. Use `Promise.all` / `Promise.allSettled` for independent work; `.then()` only where it is clearer.
- Catch only to handle, translate or add context; otherwise let the error propagate. No `try/catch` just to rethrow.
- Never swallow errors: a `catch` that falls through states why in a comment. Add context with `new Error(message, { cause })`.
- Never show users stack traces or raw internal errors.
- Handle loading, empty, error and success states. Disable submit while a mutation is pending.

### Security

- Authentication and authorization happen on the server. Never trust roles, permissions or identity sent by the client.
- Never expose secrets or env to client code. Never store tokens in `localStorage`; sessions are server-set cookies.
- `dangerouslySetInnerHTML` is banned (`react/no-danger`).
- Never log passwords, tokens, secrets or personal data. Redirect only to known internal paths.

### UI

- Reuse `src/components/ui`: Alert, AlertDialog (confirmations), Badge, Breadcrumb, Button, Card, Dialog, DropdownMenu, Empty (empty states), Field (form fields and errors), Input, Select, Sheet, Sidebar, Skeleton (loading), Table and Pagination, Tabs, Tooltip, and `Toaster` from `ui/sonner`.
- The app shell lives in `src/components/app-shell/`; a feature adds its sidebar entry to a group in `NAV_GROUPS` (`nav-items.ts`) and its label under `nav` in the shared messages; the ⌘K `CommandMenu` lists the same entries. `ThemeToggle` and `LocaleSwitcher` are in `src/components/`; the gear `ThemeSettings` drawer stores sidebar style and collapse mode in cookies (`layout-preferences.ts`) so the server renders them without a flash. Shared page parts: `PageHeader` (title, description, actions), `TableSearch` (debounced `?search=`), `FacetedFilter` and `ResetFilters` (toolbar filters written to the URL, repeated keys for multi-select), `SortableHeader` (`?sort_by=&sort_order=`) and `ListPagination` with `PageSizeSelect` (Jungo pagination as URL links). List state always lives in the URL. `Toaster` is mounted in the root layout. Forms follow the skeleton-template layout: a `PageHeader` with a back icon and the Cancel/`SubmitButton` actions, then one card of `FormSection`s split by `<Separator />` (title and hint left, two-column fields right), `RequiredMark` on required labels. Forms submit through `onSubmit` + `startTransition(formAction)` so a failed save keeps every field. `PasswordInput` has a show/hide toggle; `PasswordRules` and `AvatarField` are shared by the user and account forms, with their rules in `src/core/password.ts` and `src/core/person.ts`. `RowActions` is the ⋯ menu (view, edit, confirmed delete with a bound server action). There is no generic data table: a feature renders `ui/table` itself (see `features/users`).
- A component used by only one feature stays in that feature. Move it to `src/components/` when a second feature needs it.
- Colours come from theme tokens (`bg-background`, `text-muted-foreground`). No hex colours. Arbitrary Tailwind values need a comment explaining why.
- Icons from `lucide-react`. Use semantic HTML, labelled controls, visible focus, and pending feedback on every action.

### Constants and tests

- Name values that carry business or config meaning; do not name self-explanatory literals. Never hardcode secrets.
- Tests use Vitest, sit next to the source as `*.test.ts(x)`, and repo-wide checks go in `tests/`.
- Test logic, validation and transformations: success, failure and edge cases. Use `it.each` for input/output tables. Mock only at boundaries.

## Before you finish

- [ ] Rules and Code Style followed; no new violations introduced.
- [ ] Names follow the conventions.
- [ ] Functions are focused; no braceless or one-line `if`, no nested ternary.
- [ ] No trailing comments (generator markers such as `/* junext:messages:en */` stay); required doc and Flow comments exist and match the code.
- [ ] UI, business logic and Jungo calls are separated.
- [ ] Authentication and authorization are enforced on the server.
- [ ] No unjustified `any`, type assertion or `!`.
- [ ] Shared UI components are reused.
- [ ] Loading, empty, success and error states are handled.
- [ ] `en` and `vi` keys are updated together.
- [ ] Relevant tests are added or updated.
- [ ] `make check` passes.
