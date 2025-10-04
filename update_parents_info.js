const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'parents-info', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function
const onSubmitPosition = content.indexOf('const onSubmit = async (formValues: ParentsInfoFormValues)');
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

// Create the data object with currentStep
const dataObjectPosition = content.lastIndexOf('const data = {', updateFormDataPosition);
if (dataObjectPosition === -1) {
  console.error('Could not find data object');
  process.exit(1);
}

// Find the end of the data object
const dataObjectEndPosition = content.indexOf('};', dataObjectPosition);
if (dataObjectEndPosition === -1) {
  console.error('Could not find end of data object');
  process.exit(1);
}

// Extract the data object
const dataObject = content.substring(dataObjectPosition, dataObjectEndPosition + 2);

// Check if currentStep already exists
if (dataObject.includes('currentStep:')) {
  console.log('currentStep already exists in data object');
} else {
  // Create the new data object with currentStep
  const newDataObject = dataObject.replace(
    '      };',
    '        currentStep: 50, // Update to dependants-info step\n      };'
  );

  // Replace the old data object with the new one
  content = content.substring(0, dataObjectPosition) + 
            newDataObject + 
            content.substring(dataObjectEndPosition + 2);

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated the parents-info page with currentStep: 50');
}
