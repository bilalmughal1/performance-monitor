# Web Performance Monitor

A full-stack web application to track Google PageSpeed Insights metrics over time for multiple websites.

Built as a production-ready system with authentication, security, data isolation, and performance visualization.

## Features

- Track LCP, INP, CLS, Performance, SEO, Accessibility
- Mobile and Desktop PageSpeed runs
- Historical trends with charts and filters
- CSV export for reporting
- Per-user data isolation using Supabase Row Level Security
- Rate-limited and timeout-safe API calls
- Secure server-side PageSpeed API usage

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Auth + Postgres + RLS
- Google PageSpeed Insights API
- Vercel Deployment
- Chart.js

## Architecture Highlights

- Server-side API routes with service role isolation
- Strict Row Level Security on all user data
- Cascading deletes for relational integrity
- Normalized URL handling and validation
- Separate mobile and desktop performance tracking

## Live Demo

https://performance-monitor-beta.vercel.app/

## Repository

https://github.com/bilalmughal1/performance-monitor

## Author

Fahad Bilal Saleem  
https://fahadbilal.com  
LinkedIn: https://linkedin.com/in/fahadbilalsaleem
