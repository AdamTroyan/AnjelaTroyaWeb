# Angela Troy Real Estate Website

A modern real estate website built with Next.js, featuring property listings, inquiry management, and administrative tools.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Styling:** Tailwind CSS 4
- **Maps:** Leaflet
- **Email:** Nodemailer
- **Authentication:** NextAuth.js
- **Storage:** AWS S3 / Cloudflare R2
- **TypeScript:** Full type safety

## 📦 Quick Start (Development)

### Prerequisites

- Node.js 20+ 
- PostgreSQL (or use SQLite for quick start)
- Redis (optional for development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd anjelaweb

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database scripts
npm run db:migrate       # Run migrations (production)
npm run db:migrate:dev   # Run migrations (development)
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema to database

# Admin scripts
npm run create-admin     # Create admin user
npm run create-user      # Create regular user
npm run cleanup-pii      # Clean up PII data
```

## 🌐 Deployment

This project is ready to deploy on multiple platforms:

### Hetzner Cloud (Recommended - Full Control)

For complete control and cost-effectiveness (~€6.49/month):

```bash
# See detailed guide in Hebrew
cat DEPLOYMENT-HE.md

# Or English version
cat deployment/README.md
```

Quick steps:
1. Create Hetzner Cloud server (CPX22, Ubuntu 24.04)
2. Run `setup-server.sh` on the server
3. Clone this repository
4. Run `deployment/deploy.sh`
5. Configure domain and SSL

**Includes:**
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ SSL certificates
- ✅ Automated backups
- ✅ Security hardening

[Read Full Deployment Guide →](deployment/README.md)

### Netlify

Built-in support with `netlify.toml`:

```bash
npm run build
# Deploy to Netlify
```

### Vercel

Native Next.js support:

```bash
vercel deploy
```

## 🗂️ Project Structure

```
anjelaweb/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── properties/   # Property listings
│   │   └── ...
│   ├── components/       # Reusable components
│   └── lib/              # Utilities and helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/
│   └── uploads/          # User uploaded files
├── scripts/              # Utility scripts
├── deployment/           # Deployment scripts and configs
│   ├── setup-server.sh   # Server setup
│   ├── deploy.sh         # Deploy/update app
│   ├── nginx.conf        # Nginx configuration
│   └── ...
└── ...
```

## 🔐 Environment Variables

### Required for Development

```env
DATABASE_URL="postgresql://user:password@localhost:5432/anjelaweb"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional but Recommended

```env
# Email (for contact forms)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user"
SMTP_PASSWORD="password"

# Storage (for images)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-key"
R2_SECRET_ACCESS_KEY="your-secret"
R2_BUCKET_NAME="bucket-name"

# Anti-spam
NEXT_PUBLIC_TURNSTILE_SITE_KEY="site-key"
TURNSTILE_SECRET_KEY="secret-key"
```

See [.env.example](.env.example) for full configuration.

## 📊 Features

- ✅ Property listings with image galleries
- ✅ Advanced search and filtering
- ✅ Interactive maps (Leaflet)
- ✅ Property inquiry forms
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ User authentication
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ SEO optimized
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Multi-language support (i18n ready)

## 🛠️ Development

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name description

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (visual DB editor)
npm run db:studio
```

### Admin User

```bash
# Create admin user interactively
npm run create-admin
```

### Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📈 Performance

- Next.js App Router for optimal performance
- Image optimization with next/image
- Static generation where possible
- API route caching
- Redis for session management
- PostgreSQL with optimized queries

## 🔒 Security

- CSRF protection
- Rate limiting on API routes
- SQL injection prevention (Prisma)
- XSS prevention
- Security headers (CSP, HSTS, etc.)
- Environment variable validation
- Input sanitization

## 📝 Documentation

- [Deployment Guide (Hebrew)](DEPLOYMENT-HE.md)
- [Deployment Guide (English)](deployment/README.md)
- [Quick Reference Card](deployment/QUICK-REFERENCE.md)
- [Changes Summary](CHANGES-SUMMARY.md)

## 🆘 Support & Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Find and kill process
npx kill-port 3000
```

**Database connection error:**
```bash
# Check PostgreSQL is running
# Check DATABASE_URL in .env
```

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

For production issues, see [deployment/README.md](deployment/README.md#troubleshooting).

## 📄 License

Private - All Rights Reserved

## 👥 Author

Angela Troy Real Estate

---

**Need help?** Check the documentation files or create an issue.

Happy coding! 🚀
