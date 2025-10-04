const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'declaration', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function
const onSubmitPosition = content.indexOf('const onSubmit = async (data: DeclarationFormValues)');
if (onSubmitPosition === -1) {
  console.error('Could not find onSubmit function');
  process.exit(1);
}

// Find the updateFormData call that sets submissionStatus to 'success'
const updateFormDataPosition = content.indexOf('updateFormData({\n            submissionStatus: \'success\'', onSubmitPosition);
if (updateFormDataPosition === -1) {
  console.error('Could not find updateFormData call for success');
  process.exit(1);
}

// Find the end of the updateFormData call
const closeBracePosition = content.indexOf('});', updateFormDataPosition);
if (closeBracePosition === -1) {
  console.error('Could not find end of updateFormData call');
  process.exit(1);
}

// Extract the updateFormData object
const updateFormDataObject = content.substring(updateFormDataPosition, closeBracePosition + 2);

// Check if currentStep already exists
if (updateFormDataObject.includes('currentStep:')) {
  console.log('currentStep already exists in updateFormData call');
} else {
  // Add currentStep to the object
  const newUpdateFormDataObject = updateFormDataObject.replace(
    'updateFormData({\n            submissionStatus: \'success\',\n            submissionMessage:',
    'updateFormData({\n            submissionStatus: \'success\',\n            currentStep: 80, // Update to complete step\n            submissionMessage:'
  );
  
  // Replace the old object with the new one
  content = content.substring(0, updateFormDataPosition) + 
            newUpdateFormDataObject + 
            content.substring(closeBracePosition + 2);
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated the declaration page with currentStep: 80');
}
