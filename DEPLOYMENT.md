# Deployment Guide

This guide covers deploying the chatbot application to various platforms.

## Table of Contents

- [Docker Compose (Local)](#docker-compose-local)
- [Production Checklist](#production-checklist)
- [Cloud Deployments](#cloud-deployments)
- [Monitoring and Logging](#monitoring-and-logging)

## Docker Compose (Local)

### Prerequisites
- Docker and Docker Compose installed
- Google Gemini API key

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. **Create .env file**
   ```bash
   cp server/.env.example server/.env
   ```

3. **Add your API key**
   ```bash
   # Edit server/.env and add your GEMINI_API_KEY
   ```

4. **Start the application**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:5500
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Managing Services

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up --build --force-recreate
```

## Production Checklist

Before deploying to production, ensure:

### Security
- [ ] GEMINI_API_KEY is stored securely (never commit to git)
- [ ] ALLOWED_ORIGINS is properly configured for your domain
- [ ] HTTPS/SSL is enabled on your domain
- [ ] Database credentials are secured
- [ ] Environment variables are not logged

### Performance
- [ ] Enable caching headers for static assets
- [ ] Configure CDN for static files
- [ ] Set up rate limiting on API endpoints
- [ ] Configure request timeouts
- [ ] Enable gzip compression

### Monitoring
- [ ] Set up application monitoring/logging
- [ ] Configure health check monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create monitoring dashboards
- [ ] Set up alerts for critical errors

### Testing
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Load test the API
- [ ] Test with production environment variables
- [ ] Verify CORS configuration

### Infrastructure
- [ ] Use managed database service
- [ ] Enable database backups
- [ ] Configure auto-scaling policies
- [ ] Set up load balancing
- [ ] Plan disaster recovery

## Cloud Deployments

### Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_key_here
   heroku config:set GEMINI_MODEL=gemini-1.5-flash
   heroku config:set ALLOWED_ORIGINS=https://your-app.herokuapp.com
   ```

4. **Create Procfile**
   ```
   web: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### AWS EC2

1. **Launch EC2 instance**
   - Use Ubuntu 22.04 LTS
   - Configure security groups for ports 80, 443, 8000

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

3. **Clone repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

4. **Configure and start**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your API key
   docker-compose up -d
   ```

5. **Set up reverse proxy with Nginx**
   ```bash
   sudo apt install nginx
   # Configure nginx to reverse proxy to localhost:5500 and localhost:8000
   ```

### Google Cloud Run

1. **Install Google Cloud SDK**
   ```bash
   curl https://sdk.cloud.google.com | bash
   gcloud init
   ```

2. **Create Cloud Run services**
   ```bash
   # For backend
   gcloud run deploy chatbot-server \
     --source ./server \
     --platform managed \
     --region us-central1 \
     --set-env-vars GEMINI_API_KEY=your_key

   # For frontend (or use Cloud Storage + CDN)
   gcloud run deploy chatbot-client \
     --source ./client \
     --platform managed \
     --region us-central1
   ```

### Azure Container Instances

1. **Install Azure CLI**
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Create container registry**
   ```bash
   az acr create --resource-group myResourceGroup \
     --name myChatbotRegistry --sku Basic
   ```

3. **Push images**
   ```bash
   docker tag chatbot-server myregistry.azurecr.io/chatbot-server:v1
   docker push myregistry.azurecr.io/chatbot-server:v1
   ```

4. **Deploy**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name chatbot-server \
     --image myregistry.azurecr.io/chatbot-server:v1 \
     --environment-variables GEMINI_API_KEY=your_key
   ```

## Monitoring and Logging

### Application Logging

Backend logs are output to stdout and can be captured by:

```bash
# Docker
docker-compose logs -f server

# Kubernetes
kubectl logs deployment/chatbot-server -f
```

### Health Monitoring

```bash
# Check backend health
curl http://localhost:8000/health

# Set up monitoring alerts
# Use tools like DataDog, New Relic, or Prometheus
```

### Metrics to Monitor

- API response times
- Error rates (4xx, 5xx)
- Request throughput
- Model API usage
- Database connection pool
- Memory and CPU usage

### Error Tracking

Consider integrating:

```python
# Sentry for error tracking
import sentry_sdk
sentry_sdk.init("your-sentry-dsn")

# Or use other services:
# - Rollbar
# - Bugsnag
# - Raygun
```

## Backup and Disaster Recovery

### Database Backup
- Set up automated daily backups
- Test restore procedures regularly
- Store backups in geographically separate region

### Disaster Recovery Plan
1. Document all environment variables
2. Keep infrastructure-as-code (Terraform, CloudFormation)
3. Test failover procedures
4. Maintain runbooks for common issues
5. Set up alerting for critical failures

## Scaling Considerations

### Horizontal Scaling
- Use container orchestration (Kubernetes)
- Set up load balancer for multiple instances
- Configure auto-scaling based on metrics

### Vertical Scaling
- Increase container resource limits
- Upgrade database size
- Use faster hardware

### Caching
- Add Redis for session storage
- Cache API responses where appropriate
- Use CDN for static assets

---

For additional help, refer to:
- [README.md](README.md) - Project setup
- [API Documentation](#api-docs) - API endpoints
- Official documentation for your chosen platform
