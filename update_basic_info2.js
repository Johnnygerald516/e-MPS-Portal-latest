const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'basic-info', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the position of the onSubmit function
const onSubmitPosition = content.indexOf('const onSubmit = async (formValues: BasicInfoFormValues)');
if (onSubmitPosition === -1) {
  console.error('Could not find onSubmit function');
  process.exit(1);
}

// Find the position of the formDataUpdate object within the onSubmit function
const formDataUpdatePosition = content.indexOf('const formDataUpdate: Partial<ApplicationFormData> =', onSubmitPosition);
if (formDataUpdatePosition === -1) {
  console.error('Could not find formDataUpdate object');
  process.exit(1);
}

// Find the end of the formDataUpdate object
const endBracePosition = content.indexOf('};', formDataUpdatePosition);
if (endBracePosition === -1) {
  console.error('Could not find end of formDataUpdate object');
  process.exit(1);
}

// Extract the formDataUpdate object
const formDataUpdateObject = content.substring(formDataUpdatePosition, endBracePosition + 2);

// Check if currentStep already exists
if (formDataUpdateObject.includes('currentStep:')) {
  console.log('currentStep already exists in formDataUpdate');
  process.exit(0);
}

// Create the new formDataUpdate object with currentStep
const newFormDataUpdateObject = formDataUpdateObject.replace(
  '      };',
  '        currentStep: 30, // Update to residence-info step\n      };'
);

// Replace the old formDataUpdate object with the new one
const updatedContent = content.substring(0, formDataUpdatePosition) + 
                       newFormDataUpdateObject + 
                       content.substring(endBracePosition + 2);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Successfully updated the basic-info page with currentStep: 30');
