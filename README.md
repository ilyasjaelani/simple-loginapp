# CI/CD Setup Guide - Simple Login App

## 📋 Overview

Pipeline ini mengimplementasikan GitOps workflow dengan:
- **CI**: GitHub Actions (build & push Docker images)
- **CD**: ArgoCD (automated deployment ke Kubernetes)

## 🏗️ Architecture

```
Code Push → GitHub Actions → Build Images → Push to ghcr.io 
    ↓
Update GitOps Repo → ArgoCD detects changes → Deploy to K8s
```

## 📦 Repository Structure

### 1. Application Repository (simple-loginapp)
```
simple-loginapp/
├── .github/workflows/
│   └── ci-cd-pipeline.yaml       # GitHub Actions workflow
├── frontend/
│   ├── Dockerfile                # Frontend Docker image
│   └── ...
├── backend/
│   ├── Dockerfile                # Backend Docker image
│   └── ...
└── README.md
```

### 2. GitOps Repository (simple-loginapp-gitops)
```
simple-loginapp-gitops/
├── apps/simple-loginapp/
│   ├── namespace.yaml            # Kubernetes namespace
│   ├── frontend-deployment.yaml  # Frontend K8s resources
│   ├── backend-deployment.yaml   # Backend K8s resources
│   └── db-secret.yaml            # Database credentials (template)
└── argocd/
    └── application.yaml          # ArgoCD Application manifest
```

## 🚀 Setup Instructions

### Step 1: Prepare GitHub Repositories

1. **Create Personal Access Token (PAT)**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Set name: `GITOPS_PAT`
   - Select scopes:
     - ✅ `repo` (full control)
     - ✅ `workflow`
   - Generate and **save the token**

2. **Add Secret to Application Repository**
   - Go to `simple-loginapp` repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GITOPS_PAT`
   - Value: (paste your PAT from step 1)
   - Click "Add secret"

### Step 2: Setup Application Repository Files

1. **Add GitHub Actions Workflow**
   ```bash
   # Di repository simple-loginapp
   mkdir -p .github/workflows
   cp ci-cd-workflow.yaml .github/workflows/ci-cd-pipeline.yaml
   ```

2. **Add/Update Dockerfiles**
   ```bash
   # Copy Dockerfiles ke masing-masing direktori
   cp frontend-Dockerfile frontend/Dockerfile
   cp backend-Dockerfile backend/Dockerfile
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline with GitHub Actions"
   git push origin main
   ```

### Step 3: Setup GitOps Repository

1. **Organize Kubernetes Manifests**
   ```bash
   # Di repository simple-loginapp-gitops
   mkdir -p apps/simple-loginapp
   mkdir -p argocd
   
   # Copy manifests
   cp namespace.yaml apps/simple-loginapp/
   cp frontend-deployment.yaml apps/simple-loginapp/
   cp backend-deployment.yaml apps/simple-loginapp/
   cp db-secret.yaml apps/simple-loginapp/
   cp argocd-application.yaml argocd/application.yaml
   ```

2. **Update Database Secret**
   ```bash
   # Edit apps/simple-loginapp/db-secret.yaml
   # Ganti dengan credentials database yang sebenarnya
   vim apps/simple-loginapp/db-secret.yaml
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Setup GitOps manifests for ArgoCD"
   git push origin main
   ```

### Step 4: Deploy ArgoCD Application

1. **Apply ArgoCD Application**
   ```bash
   kubectl apply -f argocd/application.yaml
   ```

2. **Verify ArgoCD Application**
   ```bash
   # Check application status
   kubectl get applications -n argocd
   
   # Get detailed status
   kubectl describe application simple-loginapp -n argocd
   ```

3. **Access ArgoCD UI**
   ```bash
   # Port forward ArgoCD server
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   
   # Get admin password
   kubectl -n argocd get secret argocd-initial-admin-secret \
     -o jsonpath="{.data.password}" | base64 -d
   
   # Open browser: https://localhost:8080
   # Username: admin
   # Password: (dari command di atas)
   ```

### Step 5: Test the Pipeline

1. **Make a code change**
   ```bash
   # Di repository simple-loginapp
   echo "// Test change" >> frontend/server.js
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```

2. **Monitor GitHub Actions**
   - Go to repository → Actions tab
   - Watch the workflow run

3. **Monitor ArgoCD**
   - Open ArgoCD UI
   - Click on `simple-loginapp` application
   - Watch the sync process

## 🔍 Verification Steps

### 1. Check Images in GitHub Container Registry
```bash
# View your packages
# Go to: https://github.com/ilyasjaelani?tab=packages
```

### 2. Check Kubernetes Deployments
```bash
# Check pods
kubectl get pods -n simple-loginapp

# Check services
kubectl get svc -n simple-loginapp

# Check deployment status
kubectl get deployments -n simple-loginapp

# View pod logs
kubectl logs -f deployment/frontend -n simple-loginapp
kubectl logs -f deployment/backend -n simple-loginapp
```

### 3. Check ArgoCD Sync Status
```bash
# CLI method
kubectl get application simple-loginapp -n argocd -o yaml

# Or use ArgoCD UI
```

## 🔄 How It Works

### CI Process (GitHub Actions)
1. **Trigger**: Push to `main` branch
2. **Build**: 
   - Checkout code
   - Build Docker images (frontend & backend)
   - Tag with short commit SHA
3. **Push**: 
   - Login to ghcr.io
   - Push images to GitHub Container Registry
4. **Update GitOps**:
   - Checkout GitOps repository
   - Update image tags in deployment manifests
   - Commit and push changes

### CD Process (ArgoCD)
1. **Detect**: ArgoCD monitors GitOps repository
2. **Sync**: Automatically applies changes to Kubernetes
3. **Health Check**: Monitors deployment health
4. **Self-Heal**: Reverts manual changes if enabled

## 🎯 Image Tagging Strategy

- **Format**: `ghcr.io/ilyasjaelani/simple-loginapp-{frontend|backend}:{tag}`
- **Tags**:
  - `{short-sha}`: 7-character commit SHA (main deployment tag)
  - `latest`: Always points to latest main branch build
  - `{branch-name}`: For feature branches

Example:
```
ghcr.io/ilyasjaelani/simple-loginapp-frontend:a1b2c3d
ghcr.io/ilyasjaelani/simple-loginapp-frontend:latest
ghcr.io/ilyasjaelani/simple-loginapp-backend:a1b2c3d
ghcr.io/ilyasjaelani/simple-loginapp-backend:latest
```

## 🔐 Security Considerations

1. **Secrets Management**
   - ✅ Use GitHub Secrets for PAT
   - ✅ Use Kubernetes Secrets for DB credentials
   - ⚠️ Never commit secrets to Git

2. **Image Security**
   - Use multi-stage builds
   - Scan images for vulnerabilities
   - Keep base images updated

3. **Access Control**
   - Limit PAT permissions
   - Use RBAC in Kubernetes
   - Restrict ArgoCD access

## 🛠️ Troubleshooting

### GitHub Actions Fails

**Check logs:**
```bash
# Go to repository → Actions tab → Click failed workflow
```

**Common issues:**
- PAT not set correctly
- Dockerfile errors
- Registry authentication issues

### ArgoCD Not Syncing

**Check application status:**
```bash
kubectl describe application simple-loginapp -n argocd
```

**Common issues:**
- Repository not accessible
- Invalid manifests
- Namespace not created
- Sync policy not configured

### Pods Not Running

**Check pod status:**
```bash
kubectl get pods -n simple-loginapp
kubectl describe pod <pod-name> -n simple-loginapp
kubectl logs <pod-name> -n simple-loginapp
```

**Common issues:**
- Image pull errors (check registry access)
- Resource limits too low
- Database connection issues
- Missing secrets

## 📊 Monitoring

### GitHub Actions
- View in: Repository → Actions tab
- Metrics: Build time, success rate

### ArgoCD
- View in: ArgoCD UI
- Metrics: Sync status, health status, last sync time

### Kubernetes
```bash
# Resource usage
kubectl top pods -n simple-loginapp

# Events
kubectl get events -n simple-loginapp --sort-by='.lastTimestamp'
```

## 🎓 Next Steps

1. **Add Testing**
   - Unit tests in CI pipeline
   - Integration tests
   - Security scanning

2. **Add Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Logging with ELK/Loki

3. **Add Multiple Environments**
   - Dev, Staging, Production
   - Environment-specific configs
   - Progressive rollouts

4. **Improve Deployment**
   - Canary deployments
   - Blue-green deployments
   - Rollback strategies

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in GitHub Actions and ArgoCD
3. Verify Kubernetes resource status
4. Check this documentation for setup steps
5. If users not exist, create table on the DB using this command:

```sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---
**Created by**: Ilyas Jaelani
**Last Updated**: 2026