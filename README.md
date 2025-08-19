# Vending-dashboard


This project is a web-based dashboard designed to monitor and manage machine data, alerts, and maintenance logs. It provides a centralized interface for viewing machine status, tracking real-time alerts, and uploading data from CSV or JSON files to a backend database.

## Features
Machines Overview: View a list of all registered machines with key details like ID, name, location, and revenue.

Real-time Alerts: Monitor and manage alerts triggered by machines, with options to resolve or view historical data.

Data Upload: Securely upload .csv or .json files and map the data to the appropriate database tables for seamless integration.

Data Visualization: A simple diagram to show the percentage of machines with active alerts.

Responsive UI: A clean, responsive user interface built with Tailwind CSS.

## Technologies Used
Frontend: React.js

Styling: Tailwind CSS

Backend & Database: Supabase

## Getting Started
To run this project locally, follow these steps:

## Prerequisites
You need to have Node.js and npm (or yarn) installed on your machine.

## Installation
Clone the repository:

git clone https://your-repository-url.git
cd your-repository-folder

Install the required dependencies:

npm install

or

yarn install

## Configuration
This application uses Supabase as its backend. The Supabase URL and Service Role Key or the public anon key are hardcoded directly into the src/components/Dashboard.js file.

** For production use, it is highly recommended to use environment variables to store these keys securely instead of hardcoding them. **

Obtain your Supabase credentials:

Navigate to your Supabase project dashboard.

Go to Settings > API.

Copy your Project URL and the service_role key.

## Securely Storing Credentials
To prevent exposing your sensitive API keys, you should store them in a .env file and access them using process.env.

Create a .env file:
Create a new file named .env in the root directory of your project.

Add your credentials to .env:
Add the following lines to the .env file, replacing the placeholder values with your actual Supabase credentials.

REACT_APP_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
REACT_APP_SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

Note: Create React App requires custom environment variables to be prefixed with REACT_APP_ for them to be exposed to the application.

Update Dashboard.js:
Modify the src/components/Dashboard.js file to read the credentials from the environment variables.

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

Add .env to .gitignore:
Add the .env file to your .gitignore file to ensure it is not committed to your version control. This is the most crucial step for security.

# .gitignore
...  
.env

## Running the Application
Start the development server:

npm start

or

yarn start

Open your web browser and navigate to http://localhost:3000 to view the application.
