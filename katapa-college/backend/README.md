# Katapa College Backend

## Setup

```powershell
cd "D:\vs code\college\katapa-college\backend"
npm install
copy .env.example .env
npm run dev
```

## API

- `GET /`
- `GET /api/health`
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/contact`

## Contact Request Body

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "phone": "9876543210",
  "message": "I want admission details"
}
```
