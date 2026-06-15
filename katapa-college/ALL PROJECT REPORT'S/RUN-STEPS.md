# Project Run Steps

Use these 3 commands only:

```powershell
cd "d:\vs code\college\katapa-college"
npm run install:all
powershell -ExecutionPolicy Bypass -File .\start-project.ps1
```

This single start file does the following:

- stops old processes on ports `5000` and `5173`
- starts MongoDB if `mongod` is installed
- starts backend
- starts frontend
- prints a quick status check

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000`

If database does not start, install MongoDB Community Server and verify:

```powershell
mongod --version
```
