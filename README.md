# Barber Shop Template

A modern, responsive barber shop website template built with Next.js, TypeScript, and Tailwind CSS. This template provides a complete booking system with admin dashboard, email notifications, and Google Calendar integration.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Booking System**: Complete appointment booking and management
- **Admin Dashboard**: Secure admin panel for managing bookings
- **Email Notifications**: Automated email confirmations and reminders
- **Google Calendar Integration**: Sync appointments with Google Calendar
- **Multi-language Support**: Internationalization support
- **Database Integration**: PostgreSQL with Prisma ORM
- **Security**: JWT authentication and security headers
- **SEO Optimized**: Meta tags, sitemap, and robots.txt

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Email**: Nodemailer
- **Calendar**: Google Calendar API
- **Deployment**: Vercel ready

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── dashboard/     # Admin dashboard
│   ├── booking/       # Booking pages
│   ├── lib/          # Utility functions
│   └── translations/ # Language files
├── prisma/           # Database schema and migrations
└── public/           # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Calendar API credentials

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
```

## API Endpoints

- `POST /api/auth/login` - Admin authentication
- `GET /api/availability` - Get available time slots
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `PUT /api/bookings/[id]/approve` - Approve booking
- `PUT /api/bookings/[id]/reject` - Reject booking
- `PUT /api/bookings/[id]/cancel` - Cancel booking

## Database Schema

The application uses Prisma with the following main models:
- User (admin users)
- Booking (appointments)
- Service (barber services)
- Availability (time slots)

## Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Security Features

- JWT-based authentication
- Security headers (CSP, HSTS, XSS protection)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure password hashing with bcrypt

## Performance Optimizations

- Next.js 15 optimizations
- CSS optimization with critters
- Image optimization
- Static generation where possible
- Bundle analysis support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.
