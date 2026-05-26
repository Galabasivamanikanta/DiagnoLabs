# DiagnoLabs - Git Helper

Repo lo git repo **lede** ani `git status` chuste message ostundi (`fatal: not a git repository`).

## 1) Git push cheyadaniki steps

### Step A: Remote setup undha leda check cheyyandi
- `git remote -v` command run cheyyandi

### Step B: Repo create cheyandi (git not initialized)
Repo lo `.git` lekapothe:
```bash
git init
```

### Step C: Commit cheyyandi
```bash
git add .
git commit -m "Add India labs finder (state/city/pincode + tests per lab)"
```

### Step D: GitHub remote add & push
```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## 2) Already changes unayi (this task)
- Backend:
  - `backend/controllers/locationLabController.js`
  - `backend/routes/indiaLabs.js`
  - `backend/server.js` updated
- Frontend:
  - `frontend/src/pages/IndiaLabsFinder.jsx`
  - `frontend/src/App.jsx` updated

## 3) Note
`.git` lekapothe remote push avvadhu—first `git init`/remote add cheyyali.

