# Security Specification: StreetSense India

## Data Invariants
1. A Report must always have a valid `userId`, `imageUrl`, and `location`.
2. `city` must be either "Bangalore" or "Mysore".
3. Only users with the `role == 'official'` or `role == 'admin'` can transition a report's `status` beyond 'reported'.
4. `overallScore` must be between 0 and 100.
5. `createdAt` (timestamp) must be set by the server.

## The Dirty Dozen (Potential Attacks)
1. **Identity Spoof**: User A tries to create a report with `userId` of User B.
2. **Status Hijack**: Citizen user tries to mark their own report as 'resolved'.
3. **Ghost Field Injection**: User tries to add `isVerified: true` to a new report.
4. **Invalid City**: User tries to submit a report for "Delhi".
5. **Score Injection**: User tries to set an `overallScore` of 500.
6. **Admin Spoof**: User tries to set their own profile role to 'admin'.
7. **Negative Scoring**: User tries to set a category score to -10.
8. **Orphaned Report**: User tries to submit a report without a location.
9. **Large ID Poisoning**: User tries to use a 2MB string as a report ID.
10. **Timestamp Fraud**: User tries to set a backdated `timestamp`.
11. **PII Leak**: Citizen tries to read full private profiles of other users.
12. **Mass Delete**: Unauthorized user tries to delete all reports in a ward.

## Test Strategy (Draft)
- Verify `create` fails if `request.auth.uid !== incoming().userId`.
- Verify `update` fails if a citizen tries to change `status`.
- Verify `update` fails if `affectedKeys()` includes `userId`.
