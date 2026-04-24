# Version Control Guide

## Overview

Application version information is managed centrally through the `.env` file and displayed in the footer of every page.

## How to Update Version

**Edit your `.env` file:**

```bash
# Application Version Control
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=eMPS Portal
NEXT_PUBLIC_BUILD_DATE=2026-03-29
```

## Version Display

The footer automatically shows:
```
eMPS Portal v1.0.0 • Build: 2026-03-29
```

## When to Update

### Version Number (NEXT_PUBLIC_APP_VERSION)
Update when:
- **Major version (1.0.0 → 2.0.0)** - Breaking changes, major features
- **Minor version (1.0.0 → 1.1.0)** - New features, no breaking changes
- **Patch version (1.0.0 → 1.0.1)** - Bug fixes, minor improvements

### Build Date (NEXT_PUBLIC_BUILD_DATE)
Update when:
- Creating a new production build
- Deploying to server
- After significant changes

### App Name (NEXT_PUBLIC_APP_NAME)
Update when:
- Rebranding
- Different deployment instances (e.g., "eMPS Portal - Test")

## Examples

### Development Environment
```bash
NEXT_PUBLIC_APP_VERSION=1.0.0-dev
NEXT_PUBLIC_APP_NAME=eMPS Portal (Development)
NEXT_PUBLIC_BUILD_DATE=2026-03-29
```

### Staging Environment
```bash
NEXT_PUBLIC_APP_VERSION=1.1.0-beta
NEXT_PUBLIC_APP_NAME=eMPS Portal (Staging)
NEXT_PUBLIC_BUILD_DATE=2026-03-29
```

### Production Environment
```bash
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=eMPS Portal
NEXT_PUBLIC_BUILD_DATE=2026-03-29
```

## After Updating

1. **Restart the application:**
   ```bash
   # For PM2
   pm2 restart eMPS-Portal
   
   # For IIS
   # Restart application pool in IIS Manager
   
   # For development
   npm run dev
   ```

2. **Verify the footer** - Check that the new version appears at the bottom of any page

## Best Practices

✅ Update version before each production deployment
✅ Use semantic versioning (MAJOR.MINOR.PATCH)
✅ Keep build date current
✅ Document version changes in release notes
✅ Use different versions for dev/staging/production

## Location

- **Footer component:** `/src/components/layout/shared-layout.tsx`
- **Configuration:** `.env` file in project root
- **Template:** `env.example`

## No Code Changes Needed

All version information is managed through environment variables - no code modifications required!
