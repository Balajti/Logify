'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication';

  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.';
      break;
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource.';
      break;
    case 'Verification':
      errorMessage = 'The verification token has expired or has already been used.';
      break;
    default:
      if (error) {
        errorMessage = error;
      }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold mb-2">Authentication Error</h1>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <Link href="/login">
              <Button>Return to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}