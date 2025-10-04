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
const updateFormDataPosition = content.indexOf('updateFormData({', onSubmitPosition);
if (updateFormDataPosition === -1) {
  console.error('Could not find updateFormData call');
  process.exit(1);
}

// Find the end of the updateFormData call
const updateFormDataEndPosition = content.indexOf('});', updateFormDataPosition);
if (updateFormDataEndPosition === -1) {
  console.error('Could not find end of updateFormData call');
  process.exit(1);
}

// Extract the updateFormData call
const updateFormDataCall = content.substring(updateFormDataPosition, updateFormDataEndPosition + 2);

// Check if currentStep already exists
if (updateFormDataCall.includes('currentStep:')) {
  console.log('currentStep already exists in updateFormData call');
} else {
  // Create the new updateFormData call with currentStep
  const newUpdateFormDataCall = updateFormDataCall.replace(
    'updateFormData({',
    'updateFormData({\n        currentStep: 60, // Update to documents step'
  );

  // Replace the old updateFormData call with the new one
  content = content.substring(0, updateFormDataPosition) + 
            newUpdateFormDataCall + 
            content.substring(updateFormDataEndPosition + 2);

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated the dependants-info page with currentStep: 60');
}
