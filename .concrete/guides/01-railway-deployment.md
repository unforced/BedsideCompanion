# Guide 01: Railway Deployment

This guide outlines the steps to deploy the Bedside Companion application to Railway.

## Prerequisites

- [Railway account](https://railway.app/) (sign up if you don't have one)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional but recommended)
- Git installed on your local machine
- GitHub account (recommended)

## Step 1: Prepare Your Application for Deployment

Ensure your application has the following files:

1. **Procfile**: Tells Railway how to run your application
   ```
   web: python app.py
   ```

2. **requirements.txt**: Lists all Python dependencies
   ```
   Flask==2.3.3
   Flask-SocketIO==5.3.4
   python-socketio==5.8.0
   python-engineio==4.5.1
   Werkzeug==2.3.7
   eventlet==0.33.3
   ```

3. **railway.json**: Configuration for Railway
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python app.py",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

4. **runtime.txt**: Specifies the Python version
   ```
   python-3.9.18
   ```

5. **.gitignore**: Excludes unnecessary files from deployment
   ```
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   venv/
   ENV/
   # ... other entries
   ```

## Step 2: Initialize Git Repository

If your project is not already a Git repository, initialize one:

```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

## Step 3: Deploy to Railway

### Option 1: Deploy via Railway Dashboard (Recommended for First-Time Users)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository
6. Railway will automatically detect your application type and deploy it

### Option 2: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize Railway project:
   ```bash
   railway init
   ```

4. Deploy your application:
   ```bash
   railway up
   ```

## Step 4: Configure Environment Variables (Optional)

If you need to set environment variables (like SECRET_KEY):

1. Go to your project in the Railway dashboard
2. Click on the "Variables" tab
3. Add your environment variables:
   - `SECRET_KEY`: A secure random string
   - `DEBUG`: Set to "False" for production

## Step 5: Access Your Deployed Application

1. In the Railway dashboard, go to your project
2. Click on the "Settings" tab
3. Find the "Domains" section
4. Railway provides a public URL for your application (e.g., `https://bedside-companion-production.up.railway.app`)

## Step 6: Test Your Deployed Application

1. Open the provided URL in your browser
2. Test the web interface
3. Test the webhook endpoints:
   ```
   curl https://your-railway-url.up.railway.app/webhook?action=music_toggle
   ```

## Troubleshooting

If you encounter issues:

1. Check the logs in the Railway dashboard
2. Ensure all dependencies are correctly listed in requirements.txt
3. Verify that your application is configured to run on the port provided by Railway
4. Check that your application is binding to 0.0.0.0 (all interfaces) and not just localhost

## Continuous Deployment

Railway automatically deploys new changes when you push to your connected GitHub repository. To update your application:

1. Make changes to your code
2. Commit the changes:
   ```bash
   git add .
   git commit -m "Update application"
   ```
3. Push to GitHub:
   ```bash
   git push
   ```

Railway will automatically detect the changes and deploy the updated application. 