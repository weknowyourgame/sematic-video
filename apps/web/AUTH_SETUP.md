# Authentication Setup with NextAuth.js

This project uses [NextAuth.js](https://next-auth.js.org/) for authentication with Google OAuth.

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm add next-auth @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-avatar
```

### 2. Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```env
# Better Auth Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (for NextAuth.js)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add `http://localhost:3000/api/auth/callback/google` to the authorized redirect URIs
6. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Components Created

The following components have been created for authentication:

- `src/lib/auth-client.ts` - NextAuth client configuration
- `src/components/sign-in-modal.tsx` - Sign-in modal with Google OAuth
- `src/components/user-menu.tsx` - User menu with profile and sign-out
- `src/components/auth-header.tsx` - Header component that shows auth state
- `src/components/ui/dialog.tsx` - Dialog component for the sign-in modal
- `src/components/ui/dropdown-menu.tsx` - Dropdown menu for user actions
- `src/components/ui/avatar.tsx` - Avatar component for user profile
- `src/providers/auth-provider.tsx` - Auth provider wrapper
- `src/app/api/auth/[...nextauth]/route.ts` - API route for auth handling

### 5. Usage

The authentication is automatically integrated into the header. Users will see:
- A "Sign In" button when not authenticated
- A user avatar with dropdown menu when authenticated

### 6. Features

- Google OAuth authentication
- Session management
- User profile display
- Sign out functionality
- Loading states
- Responsive design

### 7. Customization

You can customize the authentication flow by:
- Adding more OAuth providers in the auth configuration
- Modifying the user menu to include additional actions
- Customizing the sign-in modal design
- Adding protected routes that require authentication

## Notes

- The current setup uses NextAuth.js's JWT session strategy
- For production, consider using a database adapter for better session management
- Make sure to handle authentication errors appropriately
- Test the OAuth flow in both development and production environments 