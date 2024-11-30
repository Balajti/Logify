import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
  phone: z.string().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface AddMemberDialogProps {
  onMemberAdded: () => void;
}

export function AddMemberDialog({ onMemberAdded }: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      phone: "",
    },
  });

  async function onSubmit(data: TeamMemberFormData) {
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await fetch('/api/auth/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'active'
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to add team member');
      }
  
      const result = await response.json();
      
      if (result.temporaryPassword) {
        setTempPassword(result.temporaryPassword);
      }
  
      onMemberAdded();
      form.reset();
      if (!result.temporaryPassword) {
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error adding team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        {tempPassword ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Temporary password for {form.getValues('email')}: 
                <span className="font-mono font-bold block mt-2">
                  {tempPassword}
                </span>
                Please save this password and share it securely with the team member.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => {
                setTempPassword(null);
                setIsOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...form.register("email")}
                  placeholder="Enter email"
                  type="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  {...form.register("department")}
                  placeholder="Enter department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}