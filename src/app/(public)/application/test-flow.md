# Passport Renewal Application Flow Test

## Test Scenario 1: Renewal for Expired Passport

### Steps:
1. Navigate to `/application`
2. Select "Kuhuisha" (renewal) as application type
3. Select "Imekwisha Muda" (Expired) as renewal reason
4. Enter phone number: "0712345678"
5. Select office location: "Dar es Salaam"
6. Submit the form
7. Verify redirection to `/application/renewal-verification?reason=expired`
8. Enter passport number: "AB123456"
9. Click "Tafuta" (Search)
10. Verify passport details are displayed
11. Answer verification question 1: "2018"
12. Verify next question appears
13. Answer verification question 2: "John Doe"
14. Verify next question appears
15. Answer verification question 3: "Dar es Salaam"
16. Verify success message and reference ID card are displayed
17. Click "Endelea na Ombi" (Continue with Application)
18. Verify redirection to `/application/declaration`

## Test Scenario 2: Renewal for Lost Passport

### Steps:
1. Navigate to `/application`
2. Select "Kuhuisha" (renewal) as application type
3. Select "Imepotea" (Lost) as renewal reason
4. Enter phone number: "0712345678"
5. Select office location: "Dar es Salaam"
6. Submit the form
7. Verify redirection to `/application/renewal-verification?reason=lost`
8. Enter passport number: "AB123456"
9. Click "Tafuta" (Search)
10. Verify passport details are displayed
11. Answer verification question 1: "AB123456"
12. Verify next question appears
13. Answer verification question 2: "2023"
14. Verify next question appears
15. Answer verification question 3: "Ndio"
16. Verify success message and reference ID card are displayed
17. Click "Endelea na Ombi" (Continue with Application)
18. Verify redirection to `/application/declaration`

## Test Scenario 3: Renewal for Damaged Passport

### Steps:
1. Navigate to `/application`
2. Select "Kuhuisha" (renewal) as application type
3. Select "Imeharibika" (Damaged) as renewal reason
4. Enter phone number: "0712345678"
5. Select office location: "Dar es Salaam"
6. Submit the form
7. Verify redirection to `/application/renewal-verification?reason=damaged`
8. Enter passport number: "CD789012"
9. Click "Tafuta" (Search)
10. Verify passport details are displayed
11. Answer verification question 1: "CD789012"
12. Verify next question appears
13. Answer verification question 2: "Maji"
14. Verify next question appears
15. Answer verification question 3: "2026"
16. Verify success message and reference ID card are displayed
17. Click "Endelea na Ombi" (Continue with Application)
18. Verify redirection to `/application/declaration`

## Test Scenario 4: New Application Flow

### Steps:
1. Navigate to `/application`
2. Select "Mpya" (new) as application type
3. Enter phone number: "0712345678"
4. Select office location: "Dar es Salaam"
5. Submit the form
6. Verify redirection to `/application/basic-info`
