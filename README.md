# AfricaTech Jobs

A comprehensive job board platform that scrapes and aggregates tech job listings from across Africa, providing developers and tech professionals with access to the latest opportunities.

## Features

- 🌍 **Multi-Country Coverage**: Jobs from 20+ African countries
- 🔍 **Advanced Filtering**: Search by location, job type, experience level, and more
- 🤖 **Automated Scraping**: Regular updates from LinkedIn, Indeed, Remote.co, and other platforms
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- ⚡ **Real-time Updates**: Fresh job listings with automatic data refresh
- 🏢 **Company Insights**: Detailed company information and profiles

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Puppeteer, Cheerio, Axios
- **UI Components**: shadcn/ui
- **Deployment**: Vercel/Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd africatechjobs/apps/africatechjobs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)

   b. Go to Settings > API to get your project credentials

   c. Update the `.env` file with your Supabase credentials:

   ```env
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
   ```

4. **Set up the database**

   a. Apply the database migration:

   ```bash
   supabase db push
   ```

   b. Generate TypeScript types:

   ```bash
   npm run generate-types
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Database Schema

The application uses the following main entities:

- **Jobs**: Job listings with detailed information
- **Companies**: Company profiles and information
- **Tags**: Job skills and technologies
- **ScrapeLogs**: Scraping operation logs

## Scraping Jobs

The application includes automated scraping from multiple sources:

### Manual Scraping

Trigger a manual scrape via the web interface or API:

```bash
curl -X POST http://localhost:3000/api/scrape
```

### Supported Sources

- **LinkedIn**: Tech jobs across African countries
- **Indeed**: Job listings from Indeed Africa domains
- **Remote.co**: Remote work opportunities in Africa

### Scraper Configuration

Scrapers are configured in `src/lib/scraper.ts` with:

- Rate limiting and error handling
- Country-specific targeting
- Duplicate detection
- Data validation

## API Endpoints

### Jobs

- `GET /api/jobs` - List jobs with filtering and pagination
- `GET /api/jobs/[id]` - Get specific job details
- `POST /api/jobs` - Create new job (admin)
- `PUT /api/jobs/[id]` - Update job (admin)
- `DELETE /api/jobs/[id]` - Delete job (admin)

### Scraping

- `POST /api/scrape` - Trigger job scraping
- `GET /api/scrape` - Get scraping logs

### Statistics

- `GET /api/stats` - Get platform statistics

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-types` - Generate TypeScript types from Supabase schema

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── job-card.tsx      # Job listing card
│   ├── job-list.tsx      # Job listings container
│   └── job-filters.tsx   # Search and filters
├── lib/                  # Utility libraries
│   ├── jobs/             # Job-related services
│   │   └── enhanced-scraper.ts # Job scraping service
│   ├── supabase/         # Supabase client and utilities
│   └── utils/            # Helper functions
├── trigger/              # Background job definitions
└── types/               # TypeScript definitions
    └── database.ts      # Auto-generated Supabase types
supabase/
├── config.toml          # Supabase configuration
├── migrations/          # Database migrations
│   └── 001_initial_migration.sql
└── README.md           # Supabase setup guide
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support:

- Open an issue on GitHub
- Contact the maintainers

---

Built with ❤️ for the African tech community
