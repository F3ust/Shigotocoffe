# Sprint 2 — UI spec ↔ DOM ids (Shigoto Coffee)

Quick map for manual / UAT checks against `md/screen_design_document.md`. Stable `id` attributes only (where present).

| Spec area | DOM id / note |
|-----------|----------------|
| Home — filter apply | `filter-apply` |
| Home — filter clear / cancel | `filter-clear` |
| Home — filter hashtag toggles | `filter-tag-wifi`, `filter-tag-outlets`, `filter-tag-quiet`, `filter-tag-japanese`, `filter-tag-noTimeLimit` |
| Global nav — home | `nav-home` |
| Header — account menu trigger | `account-icon` |
| Header — logged-in display name | `menu-account-name` |
| Header — logout | `menu-logout` |
| Header — login (guest) | `menu-login` |
| Header — register (guest) | `menu-register` |
| Login — back | `login-back` |
| Login — forgot password (placeholder `#`) | `login-forgot-password` |
| Login — terms / privacy links | `login-terms`, `login-privacy` |
| Login — email / password | `login-email`, `login-password` |
| Signup — back | `signup-back` |
| Signup — role | `signup-role` |
| Signup — fields | `signup-name`, `signup-email`, `signup-password`, `signup-confirm-password` |
| Signup — terms / privacy | `signup-terms`, `signup-privacy` |

Backend API verification for register `role` and auth responses lives on branch **`feat/sprint-2-be`**.
