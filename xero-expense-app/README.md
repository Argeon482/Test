# Xero Expense Management Application

A sophisticated financial technology application designed to automate the matching of uploaded receipts to bank transactions within Xero accounts. This application streamlines expense management through intelligent OCR processing and advanced matching algorithms.

## 🚀 Features

### Core Functionality
- **Receipt Ingestion & OCR Processing**: Upload receipt images (JPG, PNG, PDF) with automatic text extraction
- **Intelligent Matching Engine**: Multi-stage matching algorithm with confidence scoring
- **Xero Integration**: Seamless OAuth 2.0 integration with automatic token management
- **Real-time Processing**: Asynchronous receipt processing with status tracking
- **Manual Review Interface**: User-friendly dashboard for reviewing low-confidence matches

### Technical Highlights
- **PERN Stack**: PostgreSQL, Express.js, React, Node.js
- **Advanced OCR**: Integration with commercial OCR APIs for accurate text extraction
- **Resilient Architecture**: Robust error handling and token refresh management
- **Scalable Design**: Built for horizontal and vertical scaling on Render

## 🏗️ Architecture

### Backend (Node.js/Express)
```
server/
├── src/
│   ├── services/
│   │   ├── xeroService.js      # Xero API integration
│   │   ├── ocrService.js       # OCR processing
│   │   └── matchingService.js  # Intelligent matching
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── receipts.js        # Receipt management
│   │   └── xero.js           # Xero API routes
│   └── app.js                # Main application
├── config/
│   └── database.js           # PostgreSQL configuration
└── scripts/
    └── migrate.js            # Database migrations
```

### Frontend (React)
```
client/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Application pages
│   ├── contexts/            # React contexts
│   └── services/            # API services
└── public/                  # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and profiles
- **xero_connections**: OAuth 2.0 credentials and tenant information
- **receipts**: Receipt lifecycle and OCR data
- **matched_pairs**: Audit trail of successful matches

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Xero Developer Account
- OCR API key (e.g., OCR.space)

### Environment Setup

1. **Backend Configuration**
```bash
cd server
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/xero_expense_app
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3001/api/xero/callback
JWT_SECRET=your_jwt_secret_key
OCR_API_KEY=your_ocr_api_key
OCR_API_URL=https://api.ocr.space/parse/image
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

2. **Install Dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. **Database Setup**
```bash
cd server
npm run db:migrate
```

4. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm run dev
```

## 🔧 Xero Integration Setup

### 1. Xero Developer Portal
1. Create a new app in the [Xero Developer Portal](https://developer.xero.com/)
2. Configure OAuth 2.0 settings:
   - Redirect URI: `http://localhost:3001/api/xero/callback`
   - Scopes: `offline_access`, `accounting.transactions.read`, `accounting.attachments`
3. Copy Client ID and Client Secret to your `.env` file

### 2. Application Flow
1. User registers/logs in
2. User initiates Xero connection via `/api/xero/auth`
3. User authorizes application in Xero
4. Application receives callback and stores tokens
5. Application can now fetch transactions and attach receipts

## 🧠 Intelligent Matching Algorithm

### Multi-Stage Matching Pipeline
1. **Exact Match**: Perfect amount and date matches
2. **Tolerant Match**: Amount within ±0.5%, date within ±4 days
3. **Fuzzy Name Match**: Merchant name similarity using Levenshtein distance
4. **Composite Scoring**: Weighted combination of all factors
5. **Manual Review**: User confirmation for ambiguous matches

### Confidence Scoring
- **Exact**: 95%+ confidence
- **Tolerant**: 85%+ confidence  
- **Fuzzy**: 75%+ confidence
- **Manual**: 50%+ confidence

## 🚀 Deployment on Render

### 1. Database Service
- Service Type: PostgreSQL
- Plan: Starter (Free) or higher
- Region: Same as web service

### 2. Backend Web Service
- Service Type: Web Service
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Configure all `.env` variables

### 3. Frontend Static Site
- Service Type: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Rewrite Rule: `/*` → `/index.html`

## 🔒 Security Features

- **OAuth 2.0**: Secure Xero integration
- **JWT Authentication**: Stateless user sessions
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet.js**: Security headers

## 📊 Monitoring & Logging

- **Winston**: Structured logging
- **Morgan**: HTTP request logging
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Receipts
- `POST /api/receipts/upload` - Upload receipt
- `GET /api/receipts/user/:userId` - Get user receipts

### Xero Integration
- `GET /api/xero/auth` - Get authorization URL
- `GET /api/xero/callback` - Handle OAuth callback
- `GET /api/xero/transactions` - Fetch bank transactions

## 🚀 Future Enhancements

### V1.0 Roadmap
- [ ] Complete multi-stage matching algorithm
- [ ] Manual review interface
- [ ] Batch receipt uploading
- [ ] Enhanced UI/UX based on MVP feedback

### Strategic Vision
- [ ] Real-time webhooks integration
- [ ] Machine learning-powered matching
- [ ] Line-item reconciliation
- [ ] Multi-platform accounting integration
- [ ] Deep linking to Xero transactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for seamless expense management**
