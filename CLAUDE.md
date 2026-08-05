# Project: Ahl El Quran - Quran Memorization Tracking System

Islamic education platform for tracking student Quran memorization progress.
Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Commands

- **Dev**: `npm run dev` (starts development server on http://localhost:3000)
- **Build**: `npm run build` (production build)
- **Start**: `npm start` (starts production server)
- **Lint**: `npm run lint` (ESLint check)
- **Type Check**: `npx tsc --noEmit` (TypeScript validation)

## Architecture

```
app/                    # Next.js App Router pages
├── memorization/       # Memorization tracking feature
├── students/           # Student management feature
├── showcase/           # Public showcase feature
└── layout.tsx          # Root layout with AppLayout

components/             # React components
├── layout/             # Layout components (Sidebar, Topbar, AppLayout)
├── memorization/       # Memorization-specific components
├── students/           # Student management components
└── ui/                 # Reusable UI components

types/                  # TypeScript type definitions
├── memorization.ts     # Memorization domain types
└── student.ts          # Student domain types

utils/                  # Utility functions
└── cn.ts               # Class name merger (clsx + tailwind-merge)
```

## Tech Stack

- **Framework**: Next.js 16.2.9 (App Router with React Server Components)
- **React**: 19.2.4 (latest with concurrent features)
- **TypeScript**: 5.x (strict mode enabled)
- **Styling**: Tailwind CSS 4.x (utility-first CSS)
- **Icons**: Lucide React (consistent icon library)
- **Path Aliases**: `@/*` resolves to project root

## Rules

### Code Style
- Use TypeScript for all new files - no JavaScript
- Enable strict mode - no `any` types without explicit reasoning
- Prefer named exports over default exports for components
- Use functional components with hooks - no class components
- Follow React Server Component patterns (Next.js 16 defaults to RSC)

### Component Patterns
- Keep components small and focused (single responsibility)
- Use Tailwind classes with `cn()` utility for conditional styling
- Extract reusable UI to `components/ui/`
- Feature-specific components go in their feature folder
- Use TypeScript interfaces for props (not `type` for component props)

### File Naming
- Components: PascalCase (e.g., `StudentForm.tsx`)
- Utils/hooks: camelCase (e.g., `useStudentData.ts`)
- Types: PascalCase (e.g., `Student`, `MemorizationRecord`)
- Pages: lowercase with hyphens (e.g., `app/student-details/page.tsx`)

### Next.js Specific
- READ `node_modules/next/dist/docs/` before making Next.js changes
- Pages use `page.tsx`, layouts use `layout.tsx`
- Use React Server Components by default (no 'use client' unless needed)
- Add 'use client' only for interactivity (state, effects, event handlers)
- Prefer Server Actions for mutations over API routes when possible
- Use `loading.tsx` for loading states, `error.tsx` for error boundaries

### State Management
- Use React hooks (useState, useReducer) for local state
- Lift state up when multiple components need it
- Consider Context for deeply nested prop drilling
- No external state management library unless explicitly needed

### Data Fetching
- Use async/await in Server Components for data fetching
- Cache aggressively with Next.js built-in caching
- Handle loading and error states explicitly
- Use Suspense boundaries for better UX

### Performance
- Optimize images with Next.js Image component
- Code split by route automatically (App Router default)
- Lazy load heavy components with dynamic imports
- Keep bundle size reasonable - check before adding new dependencies

### Accessibility
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers when possible
- Maintain color contrast ratios (WCAG AA minimum)

## Gotchas

- **Next.js 16**: Breaking changes from Next.js 13/14 - always check docs
- **React 19**: New features like `use()` and improved Server Components
- **Tailwind CSS 4**: Uses new PostCSS plugin architecture
- **Path Aliases**: `@/` is configured but may need VS Code restart after changes
- **Server vs Client**: Components are Server by default - add 'use client' for interactivity
- **Lucide Icons**: Tree-shakeable, only import specific icons needed

## Development Workflow

1. Run `npm run dev` to start development server
2. Make changes in feature-specific folders
3. Use TypeScript strict mode - fix all type errors
4. Test in browser (http://localhost:3000)
5. Run `npm run lint` before committing
6. Run `npx tsc --noEmit` to check types

## Local Module Documentation

See module-specific guidelines:
- `components/memorization/CLAUDE.md` - Memorization tracking patterns
- `components/students/CLAUDE.md` - Student management patterns
- `types/CLAUDE.md` - Type definition standards

## Related Documentation

@docs/architecture.md - System design and data flow
@docs/adr/ - Architecture Decision Records
@.claude/rules/code-style.md - Detailed coding standards
@.claude/rules/component-patterns.md - Component design patterns
@.claude/rules/accessibility.md - A11y guidelines
