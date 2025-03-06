# Job Application Testing

This directory contains tools for testing the job application functionality of the resourcing app.

## Directory Structure

- `/resumes`: Contains dummy PDF resumes for testing
- `submit_application.py`: Python script to programmatically submit job applications

## Creating Test Resumes

Create PDF resumes using the following naming convention:
- `firstname_lastname.pdf` (e.g., `alex_johnson.pdf`, `jamie_smith.pdf`)

Alternatively, you can use numbered resumes:
- `resume1.pdf`, `resume2.pdf`, etc.

Each resume should contain basic information like:
- Name, contact details
- Education
- Work experience
- Skills

## Using the Submission Script

### Prerequisites

Install required dependencies:

```bash
pip install requests
```

### Basic Usage

```bash
python submit_application.py
```

The script will prompt you for:
1. Job ID (required)
2. Resume index (if not provided as an argument)

### Command-line Options

```bash
python submit_application.py [<resumeIndex>] [options]
```

Example:
```bash
python submit_application.py 1 --job-id abc123
```
This submits an application for Alex Johnson (using `alex_johnson.pdf` if available, otherwise `resume1.pdf`) to the job with ID "abc123".

### Advanced Options

You can customize the application with these options:

```bash
python submit_application.py --name "Custom Name" --email "custom@example.com" --salary 75000 --visa
```

Available options:
- `--job-id <id>`: The ID of the job to apply for (if not provided, will prompt)
- `--name <name>`: Custom candidate name
- `--email <email>`: Custom email address
- `--phone <phone>`: Custom phone number
- `--cover <text>`: Custom cover letter text
- `--salary <amount>`: Salary expectation
- `--visa`: Flag to indicate visa sponsorship is required
- `--available <date>`: Available from date (YYYY-MM-DD format)
- `--url <url>`: Base URL of the application (default: http://localhost:3000)

## Resume File Naming

The script will look for resume files in the following order:
1. A file named `firstname_lastname.pdf` based on the candidate's name (e.g., `alex_johnson.pdf`)
2. A file named `resume{index}.pdf` based on the resume index (e.g., `resume1.pdf`)
3. Any available PDF file in the resumes directory

## Finding Job IDs

Job IDs can be found in the URL when viewing a job posting:
`https://your-app-url.com/jobs/[jobId]`

## Batch Submission

You can use a simple shell script to submit multiple applications at once:

```bash
#!/bin/bash
# batch_submit.sh

# Prompt for job ID
read -p "Enter the job ID to apply for: " JOB_ID

if [ -z "$JOB_ID" ]; then
  echo "Error: Job ID is required"
  exit 1
fi

# Submit all 4 test applications
python submit_application.py 1 --job-id $JOB_ID
python submit_application.py 2 --job-id $JOB_ID
python submit_application.py 3 --job-id $JOB_ID
python submit_application.py 4 --job-id $JOB_ID

echo "All applications submitted!"
```

Make it executable with `chmod +x batch_submit.sh` and run with `./batch_submit.sh`. 