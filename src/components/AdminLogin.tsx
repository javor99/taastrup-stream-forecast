import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, X } from 'lucide-react';

interface AdminLoginProps {
  onClose: () => void;
}

function cleanErrorMessage(msg?: string): string {
  if (!msg) return 'Login failed. Please try again.';
  let s = String(msg);
  // Remove generic Supabase SDK phrase
  s = s.replace(/Edge Function returned a non-2xx status code/gi, '').trim();
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // If the message is only a status code, expand it
  if (/^\d{3}$/.test(s)) return `${s} Authentication failed`;
  // Truncate overly long blobs
  if (s.length > 200) s = s.slice(0, 200) + '…';
  return s || 'Login failed. Please try again.';
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome! You have been logged in successfully.",
          variant: "default",
        });
        onClose();
      } else {
        // Provide more specific error messages using sanitized backend error
        let errorMessage = cleanErrorMessage(result.error);
        if (/Invalid email or password/i.test(errorMessage)) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (/Network/i.test(errorMessage)) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (/Account is deactivated/i.test(errorMessage)) {
          errorMessage = 'Your account has been deactivated. Please contact an administrator.';
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Enter credentials to access station management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345678"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};