const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'dependant-info', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function
const onSubmitPosition = content.indexOf('const onSubmit = async (data: DependantInfoFormValues)');
if (onSubmitPosition === -1) {
  console.error('Could not find onSubmit function');
  process.exit(1);
}

// Find the updateFormData call in the onSubmit function
const updateFormDataPosition = content.indexOf('updateFormData(data);', onSubmitPosition);
if (updateFormDataPosition === -1) {
  console.error('Could not find updateFormData call');
  process.exit(1);
}

// Replace the simple updateFormData call with one that includes currentStep
const newUpdateFormDataCall = 'updateFormData({...data, currentStep: 60}); // Update to documents step';

// Replace the old updateFormData call with the new one
content = content.replace('updateFormData(data);', newUpdateFormDataCall);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated the dependants-info page with currentStep: 60');
