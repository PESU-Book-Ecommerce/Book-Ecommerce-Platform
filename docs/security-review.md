# Book E-Commerce Platform — Security Review

## Security Requirements
1. Authentication: users must log in before using protected features.
2. Password protection: passwords must not be stored in plaintext.
3. Authorization: customers, sellers and admins have separate permissions.
4. Seller restrictions: a seller cannot edit or delete another seller's books.
5. Input validation: all inputs must be validated on the backend.
6. Payment security: payment data must not be stored in browser storage.
7. Session security: protected actions need a valid session.
8. Admin protection: only authorized admins can use admin features.
9. Error handling: errors must not reveal passwords or secrets.
10. Secrets: API keys and database credentials must not be committed to GitHub.

## Findings
(to be filled after reviewing the code)