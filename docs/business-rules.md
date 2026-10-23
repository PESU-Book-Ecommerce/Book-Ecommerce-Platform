# Business Rules Review

**Project:** Book E-Commerce Platform  
**Sprint:** Sprint 1  
**Requirement:** NFR-05 — Business Rules  
**Status:** In Progress

## 1. Purpose

This document records the business rules relevant to book listings, inventory, seller permissions, and future order processing.

## 2. Business Rules

| ID | Business Rule | Expected Behavior | Status |
|---|---|---|---|
| BR-01 | Required book details | A listing must include the required title, author, category, price, and stock details. | Pass |
| BR-02 | Positive price | A book's selling price must be greater than zero. | Pass |
| BR-03 | Non-negative stock | Stock must be an integer greater than or equal to zero. | Pass |
| BR-04 | Listing ownership | Only an authorized seller may update or remove their own listings. | Pending backend verification |
| BR-05 | Inventory limits | An order must not exceed the available stock. | Pending implementation verification |
| BR-06 | Order and payment consistency | Order confirmation must follow the application's verified payment rules. | Pending implementation verification |
| BR-07 | Listing changes | Updating a listing must preserve the correctness of its other fields. | Pass |

## 3. Verification Plan

- Add a listing with all required fields.
- Try submitting a listing with missing required fields.
- Enter zero, negative, and non-numeric prices.
- Enter negative, fractional, and valid stock quantities.
- Edit a listing and verify that the updated values are correct.
- Verify that one seller cannot change another seller's listing.
- If ordering is implemented, verify stock limits and order/payment status consistency.

## 4. Current Prototype Limitations

The current prototype stores seller listings in browser localStorage. It can demonstrate basic listing management, but it does not independently enforce secure seller ownership or provide shared, server-side inventory management.

Order, inventory, and payment rules must be verified against the actual implemented backend before being marked as passed.

## 5. Review Conclusion

The business rules have been documented for review. Each rule must be verified against the actual requirements and implementation. Rules that are not implemented or tested must remain pending.
