# Module 4: Deployment and DevOps

Modern JavaScript applications require robust deployment pipelines and operational practices. This module covers CI/CD, containerization, cloud deployment, and monitoring.

---

## 4.1 Deployment Strategies

### Blue-Green Deployment

```
                    ┌─────────────┐
                    │   Router    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼─────┐
       │  Blue (v1)  │          │ Green (v2)  │
       │   Active    │          │   Standby   │
       └─────────────┘          └─────────────┘
```

```yaml
# Kubernetes blue-green
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # Switch to 'green' for deployment
  ports:
    - port: 80
```

```javascript
// Switch traffic
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

// Rollback
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Canary Deployment

```javascript
// Gradual rollout: 5% → 25% → 50% → 100%
// nginx.conf
upstream backend {
  server v1.myapp.com weight=95;
  server v2.myapp.com weight=5;  # Canary
}

// Or Kubernetes Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
```

### Rolling Deployment

```yaml
# Kubernetes rolling update
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods over desired count
      maxUnavailable: 1  # Max pods that can be down
```

### Feature Flags

```javascript
// LaunchDarkly / custom implementation
const flags = {
  newCheckout: { enabled: true, percentage: 25 },
  darkMode: { enabled: true, percentage: 100 },
  experimentalApi: { enabled: false }
};

function isFeatureEnabled(flag, userId) {
  const feature = flags[flag];
  if (!feature?.enabled) return false;
  if (feature.percentage === 100) return true;
  
  // Consistent hashing for user
  const hash = hashCode(userId + flag);
  return (hash % 100) < feature.percentage;
}

// Usage
if (isFeatureEnabled('newCheckout', user.id)) {
  return <NewCheckout />;
} else {
  return <LegacyCheckout />;
}
```

---

## 4.2 CI/CD Pipelines

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      
      - name: Deploy to production
        run: |
          # Deploy script
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

.node-cache:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

test:
  stage: test
  image: node:${NODE_VERSION}
  extends: .node-cache
  script:
    - npm ci
    - npm run lint
    - npm test

build:
  stage: build
  image: node:${NODE_VERSION}
  extends: .node-cache
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy_production:
  stage: deploy
  image: alpine:latest
  only:
    - main
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://${S3_BUCKET}
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
  agent { docker { image 'node:20' } }
  
  environment {
    CI = 'true'
  }
  
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    
    stage('Deploy') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'aws-key', variable: 'AWS_ACCESS_KEY_ID')]) {
          sh 'aws s3 sync dist/ s3://my-bucket'
        }
      }
    }
  }
  
  post {
    always {
      junit 'coverage/junit.xml'
    }
    failure {
      slackSend channel: '#deploys', message: "Build failed: ${env.BUILD_URL}"
    }
  }
}
```

---

## 4.3 Containerization

### Dockerfile Best Practices

```dockerfile
# Multi-stage build for Node.js
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Security: Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only what's needed
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    secrets:
      - db_password
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Kubernetes Basics

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myregistry/myapp:v1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp
                port:
                  number: 80
```

---

## 4.4 Cloud Platforms

### AWS Deployment

```javascript
// AWS CDK (Infrastructure as Code)
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class FrontendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 bucket for static files
    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      defaultRootObject: 'index.html',
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html'  // SPA routing
      }]
    });

    // Deploy files
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });
  }
}
```

### Vercel / Netlify

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Serverless Functions

```javascript
// Vercel API route (pages/api/hello.js or app/api/hello/route.js)
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from serverless!' });
}

// Next.js 13+ App Router
export async function GET(request) {
  return Response.json({ message: 'Hello' });
}

// Netlify Function (netlify/functions/hello.js)
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};

// AWS Lambda
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from Lambda!' })
  };
};
```

---

## 4.5 Monitoring and Logging

### Error Tracking (Sentry)

```javascript
// Initialize Sentry
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.VERSION,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0
});

// Capture errors
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { userId: user.id }
  });
}

// Set user context
Sentry.setUser({ id: user.id, email: user.email });

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'ui.click',
  message: 'User clicked checkout button',
  level: 'info'
});
```

### Structured Logging

```javascript
// Winston logger (Node.js)
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'myapp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user.id, ip: req.ip });
logger.error('Payment failed', { orderId, error: err.message });

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
});
```

### Application Performance Monitoring (APM)

```javascript
// Datadog APM
const tracer = require('dd-trace').init({
  service: 'myapp',
  env: process.env.NODE_ENV,
  version: process.env.VERSION
});

// Custom spans
const span = tracer.startSpan('process.order');
span.setTag('order.id', orderId);
try {
  await processOrder(order);
  span.setTag('order.status', 'success');
} catch (error) {
  span.setTag('error', true);
  span.setTag('error.message', error.message);
  throw error;
} finally {
  span.finish();
}

// Custom metrics
const StatsD = require('hot-shots');
const dogstatsd = new StatsD();

dogstatsd.increment('orders.created');
dogstatsd.gauge('queue.size', queue.length);
dogstatsd.histogram('order.processing_time', duration);
```

### Health Checks

```javascript
// Express health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Check dependencies
    await db.query('SELECT 1');
    await redis.ping();
    
    res.json({ 
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Liveness vs Readiness
// Liveness: Is the app alive? (restart if failed)
// Readiness: Can the app handle traffic? (stop routing if failed)
```

---

## 4.6 Edge Computing

### Edge Functions

```javascript
// Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // A/B testing at the edge
    const variant = Math.random() < 0.5 ? 'a' : 'b';
    
    const response = await fetch(`https://origin.example.com${url.pathname}`, {
      headers: { 'X-Variant': variant }
    });
    
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Variant', variant);
    
    return newResponse;
  }
};

// Vercel Edge Functions
import { NextResponse } from 'next/server';

export const config = { runtime: 'edge' };

export default function handler(request) {
  const country = request.geo?.country || 'US';
  
  // Geo-based routing
  if (country === 'CN') {
    return NextResponse.redirect('https://cn.example.com');
  }
  
  return NextResponse.next();
}
```

### CDN Configuration

```javascript
// Cache-Control headers
// Immutable assets (hashed filenames)
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',
  immutable: true
}));

// HTML (always revalidate)
app.get('/*.html', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile('index.html');
});

// API responses
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  res.json(products);
});
```

---

## 4.7 Summary

| Topic | Key Tools & Practices |
|-------|----------------------|
| **Strategies** | Blue-green, canary, feature flags |
| **CI/CD** | GitHub Actions, GitLab CI, Jenkins |
| **Containers** | Multi-stage Docker, docker-compose, K8s |
| **Cloud** | AWS CDK, Vercel, Netlify, serverless |
| **Monitoring** | Sentry, Winston, Datadog, health checks |
| **Edge** | Cloudflare Workers, Vercel Edge |

### DevOps Checklist

- [ ] CI pipeline: lint → test → build → deploy
- [ ] Automated testing with coverage requirements
- [ ] Staging environment mirroring production
- [ ] Feature flags for risky deployments
- [ ] Health checks and readiness probes
- [ ] Structured logging with correlation IDs
- [ ] Error tracking (Sentry or equivalent)
- [ ] Performance monitoring and alerting
- [ ] Rollback strategy documented
- [ ] Infrastructure as Code (CDK/Terraform)

---

**End of Module 4: Deployment and DevOps**

Next: Module 5 — Career Development
