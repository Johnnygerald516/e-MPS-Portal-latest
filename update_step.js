const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'app', '(public)', 'application', 'basic-info', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the onSubmit function and update it
const onSubmitPattern = /const onSubmit = async \(formValues: BasicInfoFormValues\) => {[\s\S]*?const formDataUpdate: Partial<ApplicationFormData> = {[\s\S]*?gender: payload\.gender, \/\/ This is now properly typed as Gender\s*};/;

const updatedContent = content.replace(onSubmitPattern, (match) => {
  return match.replace(
    /gender: payload\.gender, \/\/ This is now properly typed as Gender\s*};/,
    `gender: payload.gender, // This is now properly typed as Gender
        currentStep: 30, // Update to residence-info step
      };`
  );
});

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Successfully updated the file with currentStep: 30');
