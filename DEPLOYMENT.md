# Deployment Guide

## Option 1: Railway (Recommended - Easy & Free)

### Backend Deployment

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd smart-zambia-api
   
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   - Go to Railway dashboard
   - Click on your service
   - Add variables:
     - `JWT_SECRET`: your-secret-key
     - Database variables auto-configured

4. **Get API URL**
   - Railway provides: `https://your-app.railway.app`
   - Update frontend `js/api.js` with this URL

### Frontend Deployment (Netlify)

1. **Prepare Frontend**
   ```bash
   cd smart-zambia-frontend
   
   # Update API_BASE in js/api.js
   const API_BASE = 'https://your-app.railway.app/api';
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag & drop `smart-zambia-frontend` folder
   - Or use CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod
     ```

3. **Configure**
   - Set custom domain (optional)
   - Enable HTTPS (automatic)

---

## Option 2: Heroku

### Backend

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create App**
   ```bash
   cd smart-zambia-api
   heroku create smart-zambia-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Run Schema**
   ```bash
   heroku pg:psql < schema.sql
   ```

### Frontend (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd smart-zambia-frontend
   vercel --prod
   ```

---

## Option 3: AWS (Advanced)

### Backend (EC2 + RDS)

1. **Create RDS PostgreSQL Instance**
   - Go to AWS RDS Console
   - Create PostgreSQL database
   - Note connection details

2. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Open ports: 22, 80, 443, 3001

3. **Setup Server**
   ```bash
   ssh ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone/upload your code
   git clone your-repo
   cd smart-zambia-api
   npm install
   
   # Create .env
   nano .env
   # Add your RDS credentials
   
   # Start with PM2
   pm2 start server.js --name smart-zambia-api
   pm2 startup
   pm2 save
   ```

4. **Setup Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/smart-zambia
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/smart-zambia /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Frontend (S3 + CloudFront)

1. **Create S3 Bucket**
   - Enable static website hosting
   - Upload frontend files

2. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS

---

## Environment-Specific Configuration

### Development
```javascript
// js/api.js
const API_BASE = 'http://localhost:3001/api';
```

### Production
```javascript
// js/api.js
const API_BASE = 'https://api.smartzambia.com/api';
```

Or use environment detection:
```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://api.smartzambia.com/api';
```

---

## Post-Deployment Checklist

- [ ] Update API URL in frontend
- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Check CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring (optional)
- [ ] Configure backups
- [ ] Update README with live URLs

---

## Monitoring & Maintenance

### Railway
- Built-in metrics dashboard
- View logs: `railway logs`

### Heroku
- View logs: `heroku logs --tail`
- Metrics in dashboard

### AWS
- CloudWatch for logs
- Set up alarms for errors

---

## Database Backups

### Railway/Heroku
- Automatic daily backups
- Manual backup: Use pg_dump

### AWS RDS
- Enable automated backups
- Set retention period

### Manual Backup
```bash
pg_dump -h your-host -U your-user -d smart_zambia > backup.sql
```

### Restore
```bash
psql -h your-host -U your-user -d smart_zambia < backup.sql
```

---

## Cost Estimates

### Free Tier (Recommended for MVP)
- **Railway**: Free tier (500 hours/month)
- **Netlify**: Free tier (100GB bandwidth)
- **Total**: $0/month

### Paid (Production)
- **Railway**: $5-20/month
- **Heroku**: $7-25/month
- **AWS**: $10-50/month (varies)
- **Domain**: $10-15/year

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL environment variable
- Verify database is running
- Check firewall rules

### "CORS error in production"
- Update CORS origin in server.js
- Add production domain to allowed origins

### "502 Bad Gateway"
- Check if backend is running
- Verify port configuration
- Check logs for errors

---

## Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use platform-specific secrets management

2. **CORS**
   - Restrict to specific domains in production
   ```javascript
   app.use(cors({
     origin: ['https://smartzambia.com']
   }));
   ```

3. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use(limiter);
   ```

4. **HTTPS Only**
   - Force HTTPS in production
   - Use HSTS headers

---

## Domain Setup

1. **Buy Domain** (Namecheap, GoDaddy, etc.)

2. **Configure DNS**
   - A record: `@` → Your server IP
   - CNAME: `www` → Your domain
   - CNAME: `api` → Your API URL

3. **Update Code**
   - Frontend: `https://smartzambia.com`
   - API: `https://api.smartzambia.com`

---

**Recommended Stack for Beginners:**
- Backend: Railway
- Frontend: Netlify
- Database: Railway PostgreSQL
- Total Cost: Free (with limits)
