const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'basic-info', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function and update it
const pattern = `      const formDataUpdate: Partial<ApplicationFormData> = {
        ...data,
        applicationId: payload.applicationId,
        gender: payload.gender, // This is now properly typed as Gender
      };`;

const replacement = `      const formDataUpdate: Partial<ApplicationFormData> = {
        ...data,
        applicationId: payload.applicationId,
        gender: payload.gender, // This is now properly typed as Gender
        currentStep: 30, // Update to residence-info step
      };`;

// Replace the pattern
content = content.replace(pattern, replacement);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Successfully updated the basic-info page with currentStep: 30');
