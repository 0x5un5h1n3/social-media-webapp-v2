# Social Media Webapp v2

![Social Media Webapp v2 Screenshot](images/screenshot.png)

## Table of Contents

- [Overview](#overview)
- [Project Requirements](#project-requirements)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker Configuration](#docker-configuration)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Social Media Webapp v2 is a modern, full-stack social media application built with Next.js, MongoDB, and TypeScript. The project demonstrates a comprehensive web application with user authentication, post management, and interactive features

## Project Requirements

The project was designed with the following key objectives:

### Core Functionality

- Implement a secure user authentication system
- Enable post creation, editing, and management
- Develop a like/interaction mechanism
- Ensure responsive and adaptive design
- Implement multiple layers of security features

### Deployment Objectives

- Create a robust CI/CD pipeline that builds the application and runs comprehensive unit tests
- Develop a single, unified repository with multi-container Docker configuration
- Implement a comprehensive docker-compose.yml for seamless application deployment

## Features

### User Management

- Secure user registration and login
- reCAPTCHA protection against bot registrations
- JWT-based authentication
- User profile management

### Post Management

- Create posts with text and image uploads
- Edit and delete personal posts
- Like/unlike functionality
- Timestamp tracking for posts
- Post ownership and access control

### Security Implementations

- Input validation
- Password hashing with bcrypt
- Protected API routes
- Token-based authentication
- reCAPTCHA verification

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Hot Toast
- React Icons

### Backend

- Node.js
- MongoDB
- Mongoose ODM
- JWT Authentication
- Bcrypt.js

### Development Tools

- Jest (Testing Framework)
- ESLint
- Husky
- Lint Staged

### DevOps

- Docker
- Docker Compose
- GitHub Actions CI/CD

## Prerequisites

- Node.js (v23+)
- npm (v10+)
- Docker
- Docker Compose
- MongoDB

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/0x5un5h1n3/social-media-webapp-v2.git
cd social-media-webapp-v2
```

### 2. Install Dependencies

```bash
npm install
```

## Environment Setup

Create a `.env.local` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/social_media_webapp_v2

# Authentication
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRATION=1h

# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Compose

```bash
docker-compose up --build
```

## Testing

### Test Suite Overview

Total test files: 6

Test files include:

- login.test.ts
- register.test.ts
- posts.test.ts
- post.test.ts
- user.test.ts
- passwordHash.test.ts

### Run All Tests

```bash
npm test
```

### Specific Test Options

```bash
# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Docker Configuration

- `Dockerfile`: Application containerization
- `docker-compose.yml`: Multi-container orchestration
- Services: Next.js application, MongoDB

## Deployment

### CI/CD Pipeline

- Automated testing
- Code linting
- Docker image building
- Deployment validation via GitHub Actions

## Project Structure

```
social-media-webapp-v2/
│
├── app/                # Next.js routes and pages
├── __tests__/          # Comprehensive test suites
│   ├── api/            # API endpoint tests
│   └── models/         # Data model tests
├── components/         # Reusable React components
├── models/             # Mongoose data models
├── utils/              # Utility functions and helpers
├── public/             # Static assets
├── docker-compose.yml  # Docker Compose configuration
└── Dockerfile          # Docker image definition
```

## Authentication Flow

1. User registers with username, email, password
2. reCAPTCHA verification
3. Password hashed and securely stored
4. JWT token generated upon successful login
5. Protected routes require valid authentication token

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write comprehensive tests
- Update documentation
- Ensure all tests pass before submitting

## Troubleshooting

- Verify all environment variables are correctly set
- Check MongoDB connection string
- Validate Docker configurations
- Review GitHub Actions logs for CI/CD pipeline issues

## License

Distributed under the [MIT License](LICENSE)
