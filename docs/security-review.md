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
Review date: 23 October 2026
Scope: files in the repository at the time of review (frontend/src).

| # | Area | Finding | Status |
|---|------|---------|--------|
| 1 | Secrets in code | No hardcoded passwords, API keys or tokens found in the repository. | Pass |
| 2 | Secret files | .gitignore excludes .env and .env.* files (only .env.example is kept). | Pass |
| 3 | Dependencies | npm install reported 0 known vulnerabilities. | Pass |
| 4 | Authentication | No login or registration code exists in frontend/src yet. Requirements 1, 2 and 7 cannot be verified. | Not verifiable |
| 5 | Authorization | No customer, seller or admin access control exists yet. Requirements 3, 4 and 8 cannot be verified. | Not verifiable |
| 6 | Input validation | No forms or input handling exist yet. Requirement 5 cannot be verified. | Not verifiable |
| 7 | Browser storage | No use of localStorage or sessionStorage found. Requirement 6 is currently met by default. | Pass |

## Recommendations
- Implement password hashing, sessions and role-based access on the backend before launch.
- Validate all inputs on the backend, not only in the frontend.
- Re-run this review after the login, seller and cart features are merged.
- The Sprint 2 cart prototype will store cart data in localStorage. This is acceptable for a demo, but cart totals and stock must be validated on the server.