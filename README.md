# CareerMatch

CareerMatch is an AI-assisted resume analysis and job recommendation application. It extracts information from an uploaded resume, evaluates resume content, identifies skills and ATS keywords, and matches the resume against available job listings.

## Features

- PDF and DOCX resume upload.
- Resume text extraction.
- Resume analysis through a FastAPI machine-learning backend.
- ATS keyword analysis and resume scoring.
- Technical skill identification.
- Education and experience information extraction.
- Job recommendations based on resume-to-job semantic similarity.
- Job browsing, search, and remote-job filtering.
- Resume data reuse between the dashboard and recommendations without uploading again.

## Application workflow

1. Upload a resume from the homepage.
2. The Next.js upload API extracts the resume text.
3. The extracted text is sent to the FastAPI analysis service.
4. The analysis response is stored in browser session storage.
5. The dashboard displays resume and ATS information.
6. The recommendations page reuses the stored resume text to rank job listings.
7. The Job Explorer provides a separate view of available listings.

## Technology

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- Machine-learning and NLP components
- Sentence-transformer-based semantic matching

### Job data
- Arbeitnow job listings through the application's jobs API.

## Project structure

```text
resume-analyzer-and-job-recommendation-system/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   ├── jobs/
│   │   └── recommendations/
│   ├── dashboard/
│   ├── recommendations/
│   ├── jobs/
│   ├── analyze/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
├── ml-backend/
├── public/
├── package.json
└── README.md
```

## Requirements

- Node.js and npm
- Python 3.13 or a compatible Python version
- The Python dependencies listed in the backend requirements file
- The frontend dependencies listed in `package.json`

## Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd resume-analyzer-and-job-recommendation-system
```

Install frontend dependencies:

```bash
npm install
```

Set up the Python environment:

```powershell
cd ml-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Return to the project root:

```powershell
cd ..
```

## Running the application

Start the FastAPI service using the ASGI application entry point configured in the backend project. Check the backend entry-point file and configuration for the correct Uvicorn module and port.

Start the Next.js development server from the project root:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The FastAPI service must be running and reachable at the address configured in the upload and recommendation API routes.

## Production build

```bash
npm run build
npm start
```

## Important implementation details

- The homepage is the primary resume upload interface.
- The upload API accepts PDF and DOCX files and enforces a 5 MB size limit.
- Resume data is stored in browser `sessionStorage` under the key `resumeAnalysis`.
- The dashboard and recommendations page reuse the stored resume data.
- The recommendations page uses the extracted resume text and job feed to request semantic matches.
- The Job Explorer can be used independently of resume analysis.

## Limitations

- Job availability and listing details depend on the external job-feed source.
- Semantic similarity is a text-matching measure. It is not a hiring probability or guarantee of eligibility.
- Resume scores and keyword results are automated indicators and should be reviewed by the applicant.
- The browser session must retain its stored resume data to move between the dashboard and recommendations without uploading again.

## Development

Before submitting changes, run:

```bash
npm run build
```

Check that the frontend and FastAPI backend are both available when testing resume upload and job recommendations.