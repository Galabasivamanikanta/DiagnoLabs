# CHAPTER 10 — DEPLOYMENT

## 10.1 Cloud Infrastructure Setup
Getting all 14 workspaces online required deploying our three main components to different cloud providers.

**Frontend:**
We deployed the React 18 frontend on Vercel. We connected our GitHub repository and selected the frontend directory. The build command was set to `npm run build` and the output directory to `dist` (since we used Vite 5). We also added necessary environment variables, like the backend API URL.

**Backend:**
The Node.js 20 LTS backend was deployed on Render as a Web Service. We connected the same GitHub repository, specifying the backend root. The start command was set to `node server.js`. We carefully copied over our environment variables, including `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`. 

**Database:**
For the database, we created a cluster on MongoDB Atlas. We set up the database user credentials and retrieved the connection string. Crucially, we updated the Network Access settings to whitelist Render's IP addresses (using `0.0.0.0/0` temporarily during setup) so the backend could connect to the database.

## 10.2 CI/CD Pipeline Configuration
To keep things simple, we did not set up complex CI/CD tools like Jenkins. Instead, we used the built-in GitHub integrations provided by Vercel and Render. Our workflow is straightforward: whenever any of the four team members pushes code to the `main` branch on GitHub, it triggers automatic builds. Vercel detects changes in the frontend folder and redeploys the React app, while Render detects backend changes and restarts the Express server. We configured branch protection rules on GitHub to prevent direct pushes to `main` without review, though we sometimes bypassed this when fixing urgent bugs.

## 10.3 Production URLs and SSL Verification

| Component | Provider | URL | SSL Status | Last Deployment Date |
| :--- | :--- | :--- | :--- | :--- |
| Frontend | Vercel | https://diagnolabs-client.vercel.app | TLS 1.3 Active | Sep 22, 2026 |
| Backend API | Render | https://diagnolabs-api.onrender.com | TLS 1.3 Active | Sep 22, 2026 |
| Database | MongoDB Atlas | mongodb+srv://... | TLS 1.3 Active | N/A |
