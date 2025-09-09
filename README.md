# MiloMCP Studio Web

Modern web interface for the MiloMCP multi-user platform.

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand (planned)
- **Data Fetching:** TanStack Query (planned)
- **Authentication:** NextAuth.js (planned)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Update the values in `.env.local` as needed.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Additional styling
```

## Development

The project uses:
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- TypeScript for type safety
- Tailwind CSS for styling

All commits are automatically linted and formatted via git hooks.