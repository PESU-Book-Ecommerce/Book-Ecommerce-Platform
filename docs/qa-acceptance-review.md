
# QA Acceptance Criteria Review

**Project:** Book E-Commerce Platform  
**Sprint:** Sprint 1  
**QA Owner:** Prajwal M Angadi  
**Status:** In Progress

## Purpose

Review the acceptance criteria of the main Sprint 1
requirements and record their verification status.

## Acceptance Criteria Review

| Requirement | Acceptance Criteria | Test Result | Remarks |
|---|---|---|---|
| REQ-01 | Customer and seller registration works | Pending | Verify registration using the actual application. |
| REQ-02 | Invalid registration data is rejected | Pending | Test invalid and missing registration fields. |
| REQ-03 | Login and logout work | Pending | Verify login, logout and session behavior. |
| REQ-04 | Search by title, author and category | Pending | Test title, author, category, case-insensitive search and no-result behavior. |
| REQ-05 | Book details display correctly | Pending | Verify book information and details page behavior. |
| REQ-06 | Seller can add, edit and delete listings | Pending | Test listing creation, editing, deletion, price validation and stock validation. |

## Test Evidence

### REQ-04 — Book Search

| Test Case | Expected Result | Status |
|---|---|---|
| Search by book title | Matching books are displayed | Pass |
| Search by author | Matching books are displayed | Pass |
| Search by category | Matching books are displayed | Pass |
| Search with no matching book | No matching books are displayed with a clear message | Pass |

### REQ-06 — Seller Book Listing Management

| Test Case | Expected Result | Status |
|---|---|---|
| Add a book listing | Listing is created with all required details | Pass |
| Update an existing listing | Changes are saved correctly | Pass |
| Remove a listing | Listing is removed from the seller's listings | Pass |
| Modify another seller's listing | Unauthorized modification is prevented | Pending |
| Enter an invalid price | Invalid price is rejected | Pass |
| Enter invalid stock | Negative or fractional stock is rejected | Pass |
| Refresh the page | Saved listings remain available | Pass |

## Issues and Limitations

- Browser localStorage is used for the current prototype.
- Database persistence has not yet been verified.
- Seller authentication and server-side authorization have not yet been verified.
- Requirements outside the implemented features need separate testing.

## Review Notes

Update this document after reviewing the actual GitHub
acceptance criteria and executing each test.

Do not mark any test Pass unless it has been performed
and the result has been verified.
