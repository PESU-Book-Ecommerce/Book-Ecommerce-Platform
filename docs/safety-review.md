# Safety Requirements Review

**Project:** Book E-Commerce Platform  
**Sprint:** Sprint 1  
**Requirement:** NFR-02 — Safety Requirements  
**Status:** In Progress

## 1. Purpose

This document reviews safety-related requirements for the Book E-Commerce Platform and identifies checks needed to protect users and prevent invalid or unintended operations.

## 2. Safety Checks

| ID | Safety Requirement | Expected Behavior | Status |
|---|---|---|---|
| SAFE-01 | Required input validation | Missing or invalid required fields are rejected with a clear message. | Pass |
| SAFE-02 | Valid book price | Zero, negative, or non-numeric prices are rejected. | Pass |
| SAFE-03 | Valid stock quantity | Negative and fractional stock quantities are rejected. | Pass |
| SAFE-04 | Destructive actions | The user is asked to confirm before deleting a listing. | Pass |
| SAFE-05 | Failed operations | An unsuccessful operation does not silently corrupt or remove existing data. | Pass |
| SAFE-06 | Seller authorization | A seller cannot modify or delete another seller's listing. | Pending backend verification |
| SAFE-07 | Payment safety | Payment status and order confirmation must be handled securely when payment functionality is implemented. | Pending implementation verification |

## 3. Verification Notes

- Test invalid inputs and confirm that useful validation messages are displayed.
- Attempt to delete a listing and verify the confirmation behavior.
- Check that existing listings remain intact after an invalid submission.
- Verify seller ownership on the backend before claiming authorization is enforced.
- Verify payment processing separately if payment functionality is part of the current sprint.

## 4. Current Prototype Limitations

The current demonstration uses browser localStorage for seller listings. Client-side validation and localStorage do not provide secure multi-user authorization. Server-side validation, authenticated seller identity, and ownership checks must be verified in the backend.

## 5. Review Conclusion

The safety requirements review is documented. Mark each item as Pass only after testing the corresponding behavior. Items that depend on backend authorization or payment functionality remain pending until verified.
