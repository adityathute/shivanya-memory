# SDK integration plan

Memory V1 consumes the current shivanya-sdk packages directly.

Current usage:
- shivanya-auth: AuthProvider, useAuth, AuthModal, AuthClient
- shivanya-ui: Button, Input, Typography and shared styles
- shivanya-shell: ShellProvider and DashboardShell
- shivanya-core: available for shared client utilities

Local compatibility code is intentionally kept small. When the corresponding reusable capability is finalized in shivanya-sdk, replace the local adapter instead of creating another Memory-specific implementation.

Potential SDK additions discovered while upgrading Memory:
- analytics event client/provider
- reusable authenticated API resource client
- modal-friendly auth guard pattern
- shared CRUD/data-table patterns
- Memory security/PIN helpers if they belong in the shared auth/security layer

Do not copy these into Memory permanently if they become reusable SDK functionality. Move the canonical implementation into shivanya-sdk and then update this repository to consume the published/workspace package.
