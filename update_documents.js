const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'documents', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function
const onSubmitPosition = content.indexOf('const onSubmit = async');
if (onSubmitPosition === -1) {
  console.error('Could not find onSubmit function');
  process.exit(1);
}

// Find the updateFormData call in the onSubmit function
const updateFormDataPosition = content.indexOf('updateFormData(', onSubmitPosition);
if (updateFormDataPosition === -1) {
  console.error('Could not find updateFormData call');
  process.exit(1);
}

// Check if there's an object being passed to updateFormData
const openBracePosition = content.indexOf('{', updateFormDataPosition);
const closeBracePosition = content.indexOf('})', updateFormDataPosition);

if (openBracePosition > 0 && closeBracePosition > openBracePosition) {
  // There's an object being passed to updateFormData
  const updateFormDataObject = content.substring(openBracePosition, closeBracePosition + 1);
  
  // Check if currentStep already exists
  if (updateFormDataObject.includes('currentStep:')) {
    console.log('currentStep already exists in updateFormData call');
  } else {
    // Add currentStep to the object
    const newUpdateFormDataObject = updateFormDataObject.replace(
      '{',
      '{\n        currentStep: 70, // Update to declaration step'
    );
    
    // Replace the old object with the new one
    content = content.substring(0, openBracePosition) + 
              newUpdateFormDataObject + 
              content.substring(closeBracePosition + 1);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated the documents page with currentStep: 70');
  }
} else {
  // Simple updateFormData call, replace it with one that includes currentStep
  const endOfUpdateFormDataCall = content.indexOf(')', updateFormDataPosition);
  if (endOfUpdateFormDataCall === -1) {
    console.error('Could not find end of updateFormData call');
    process.exit(1);
  }
  
  const updateFormDataCall = content.substring(updateFormDataPosition, endOfUpdateFormDataCall + 1);
  const newUpdateFormDataCall = updateFormDataCall.replace(
    'updateFormData(',
    'updateFormData({...formData, currentStep: 70}, // Update to declaration step'
  ).replace(')', '})');
  
  // Replace the old updateFormData call with the new one
  content = content.substring(0, updateFormDataPosition) + 
            newUpdateFormDataCall + 
            content.substring(endOfUpdateFormDataCall + 1);
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated the documents page with currentStep: 70');
}
