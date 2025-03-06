#!/usr/bin/env python3
"""
Job Application Submission Script

This script automates the submission of job applications for testing purposes.
It can be used to quickly populate a job with test candidates.

Usage:
  python submit_application.py [<resumeIndex>] [options]

Arguments:
  resumeIndex - Index of the resume to use (1-4), optional

Options:
  --name <name> - Candidate name (default: based on resume index)
  --email <email> - Candidate email (default: based on resume index)
  --phone <phone> - Candidate phone (default: based on resume index)
  --cover <text> - Cover letter text (default: generic text)
  --salary <amount> - Salary expectation (default: random between 50000-120000)
  --visa - If present, indicates visa sponsorship is required
  --available <date> - Available from date (default: current date + 2 weeks)
  --url <url> - Base URL of the application (default: http://localhost:3000)
"""

import os
import sys
import random
import argparse
from datetime import datetime, timedelta
import requests
from pathlib import Path

# Default candidate profiles
DEFAULT_PROFILES = [
    {
        "name": "Alex Johnson",
        "email": "asaussier99@gmail.com",
        "phone": "555-123-4567",
        "coverLetter": "I am excited to apply for this position and believe my skills align well with your requirements.",
    },
    {
        "name": "Jamie Smith",
        "email": "hello@alexandresaussier.com",
        "phone": "555-234-5678",
        "coverLetter": "With my background in this field, I am confident I can contribute significantly to your team.",
    },
    {
        "name": "Taylor Brown",
        "email": "hello@alexandresaussier.com",
        "phone": "555-345-6789",
        "coverLetter": "I have been following your company for some time and would love to join your innovative team.",
    },
    {
        "name": "Morgan Lee",
        "email": "hello@alexandresaussier.com",
        "phone": "555-456-7890",
        "coverLetter": "My experience in similar roles has prepared me well for this position, and I'm eager to bring my skills to your organization.",
    }
]

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Submit a test job application')
    
    # Optional resume index argument
    parser.add_argument('resume_index', type=int, nargs='?', choices=range(1, 5), 
                        help='Index of the resume to use (1-4)')
    
    # Optional arguments
    parser.add_argument('--name', help='Candidate name')
    parser.add_argument('--email', help='Candidate email')
    parser.add_argument('--phone', help='Candidate phone number')
    parser.add_argument('--cover', help='Cover letter text')
    parser.add_argument('--salary', type=int, help='Salary expectation')
    parser.add_argument('--visa', action='store_true', help='Visa sponsorship required')
    parser.add_argument('--available', help='Available from date (YYYY-MM-DD)')
    parser.add_argument('--url', default='http://localhost:3000', 
                        help='Base URL of the application (default: http://localhost:3000)')
    parser.add_argument('--job-id', help='The ID of the job to apply for')
    
    return parser.parse_args()

def get_resume_path(name, script_dir):
    """Get the resume path based on the candidate's name"""
    # Convert name to firstname_lastname.pdf format
    name_parts = name.split()
    if len(name_parts) >= 2:
        firstname = name_parts[0].lower()
        lastname = name_parts[-1].lower()
        filename = f"{firstname}_{lastname}.pdf"
        
        # Check if the file exists
        resume_path = script_dir / "resumes" / filename
        if resume_path.exists():
            return resume_path
    
    # If name-based resume not found, return None
    return None

def submit_application(args):
    """Submit a job application using the provided arguments"""
    # Prompt for job ID if not provided
    job_id = args.job_id
    if not job_id:
        job_id = input("Enter the job ID to apply for: ").strip()
        if not job_id:
            print("Error: Job ID is required")
            return False
    
    # Determine resume index
    resume_index = args.resume_index
    if resume_index is None:
        # If no resume index provided, prompt user
        try:
            resume_index = int(input("Enter resume index (1-4): ").strip())
            if resume_index < 1 or resume_index > 4:
                print("Error: Resume index must be between 1 and 4")
                return False
        except ValueError:
            print("Error: Please enter a valid number")
            return False
    
    # Get the profile based on resume index
    profile = DEFAULT_PROFILES[resume_index - 1]
    
    # Set values from arguments or defaults
    name = args.name or profile["name"]
    email = args.email or profile["email"]
    phone = args.phone or profile["phone"]
    cover_letter = args.cover or profile["coverLetter"]
    salary_expectation = args.salary or random.randint(50000, 120000)
    visa_required = args.visa
    
    # Calculate available from date (default: 2 weeks from now)
    if args.available:
        available_from = args.available
    else:
        available_from = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
    
    # Get script directory
    script_dir = Path(__file__).parent
    
    # Try to get resume based on name
    resume_path = get_resume_path(name, script_dir)
    
    # If name-based resume not found, fall back to index-based resume
    if resume_path is None:
        resume_path = script_dir / "resumes" / f"resume{resume_index}.pdf"
        
        # Check if the fallback resume exists
        if not resume_path.exists():
            # Try to find any resume file
            resume_files = list(Path(script_dir / "resumes").glob("*.pdf"))
            if resume_files:
                resume_path = resume_files[0]
                print(f"Using available resume: {resume_path.name}")
            else:
                print(f"Error: No resume files found in {script_dir / 'resumes'}")
                print("Please create resume files in the tests/job-applications/resumes directory")
                print("Format: firstname_lastname.pdf (e.g., alex_johnson.pdf)")
                return False
    
    # Prepare form data
    form_data = {
        'jobId': job_id,
        'name': name,
        'email': email,
        'phone': phone,
        'coverLetter': cover_letter,
        'salaryExpectation': str(salary_expectation),
        'visaRequired': str(visa_required).lower(),
        'availableFrom': available_from
    }
    
    # Prepare file
    try:
        resume_file = open(resume_path, 'rb')
        files = {
            'resume': (resume_path.name, resume_file, 'application/pdf')
        }
        
        print(f"Submitting application for {name} to job {job_id}...")
        print(f"Using resume: {resume_path.name}")
        
        # Submit the application
        response = requests.post(
            f"{args.url}/api/recruitment/apply",
            data=form_data,
            files=files
        )
        
        # Check response
        response.raise_for_status()
        result = response.json()
        
        print("Application submitted successfully!")
        print(result)
        return True
        
    except FileNotFoundError:
        print(f"Error: Resume file not found: {resume_path}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Error submitting application: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Status code: {e.response.status_code}")
            try:
                print(f"Error details: {e.response.json()}")
            except:
                print(f"Response text: {e.response.text}")
        return False
    finally:
        # Close the file if it was opened
        if 'resume_file' in locals() and resume_file:
            resume_file.close()

def main():
    """Main function"""
    args = parse_arguments()
    submit_application(args)

if __name__ == "__main__":
    main() 