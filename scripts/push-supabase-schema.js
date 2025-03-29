// Script to push the schema to Supabase
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Get the Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_KEY not found in environment variables');
  process.exit(1);
}

// Parse the URL to get the hostname and project ID
const url = new URL(supabaseUrl);
const hostname = url.hostname;
const projectId = hostname.split('.')[0];

// Path to the schema file
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');

// Check if schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Schema file not found at ${schemaPath}`);
  process.exit(1);
}

console.log('Pushing schema to Supabase...');

// Read the schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create a temporary file with the schema
const tempPath = path.join(__dirname, 'temp-schema.sql');
fs.writeFileSync(tempPath, schema);

// Command to run
const command = `curl -X POST ${supabaseUrl}/rest/v1/sql -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" -d @${tempPath}`;

// Execute the command using a Promise
const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// Run the command
try {
  const { stdout, stderr } = await execPromise(command);
  
  // Clean up temporary file
  fs.unlinkSync(tempPath);
  
  if (stderr) {
    console.error(`Error output: ${stderr}`);
  }
  
  console.log(`Schema pushed successfully to Supabase project: ${projectId}`);
  console.log(stdout);
} catch (err) {
  // Clean up temporary file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
  
  console.error(`Error pushing schema: ${err.error ? err.error.message : 'Unknown error'}`);
  if (err.stderr) {
    console.error(`Error output: ${err.stderr}`);
  }
  
  process.exit(1);
}