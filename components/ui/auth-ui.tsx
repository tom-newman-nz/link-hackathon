import * as React from "react";
import { useState, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// UTILITY: cn function for merging Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- BUILT-IN UI COMPONENTS (No changes here) ---

// COMPONENT: Label
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// COMPONENT: Button
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

// COMPONENT: Input
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// COMPONENT: PasswordInput
export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// --- FORMS & AUTH LOGIC ---

// FORM: SignInForm
function SignInForm({ onSignIn, loading }: { onSignIn?: (data: { email: string; password: string }) => Promise<void>; loading?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSignIn) {
      await onSignIn({ email, password });
    }
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to Link</h1>
        <p className="text-balance text-sm text-muted-foreground">Access all your university tools in one place.</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
      </div>
    </form>
  );
}

// FORM: SignUpForm
function SignUpForm({ onSignUp, loading }: { onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void>; loading?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSignUp) {
      await onSignUp({ name, email, password });
    }
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your Link account</h1>
        <p className="text-balance text-sm text-muted-foreground">Sign up to access all your university utilities in one platform.</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</Button>
      </div>
    </form>
  );
}

// CONTAINER for the forms to handle state switching
function AuthFormContainer({ onSignIn, onSignUp, loading, error }: { onSignIn?: (data: { email: string; password: string }) => Promise<void>; onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void>; loading?: boolean; error?: string | null }) {
    const [isSignIn, setIsSignIn] = useState(true);
    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {/* Logo at the top */}
            <div className="flex justify-center mb-4">
                <img src="/logo.jpeg" alt="Link Logo" className="w-20 h-20 rounded-lg object-cover" />
            </div>
            {isSignIn ? <SignInForm onSignIn={onSignIn} loading={loading} /> : <SignUpForm onSignUp={onSignUp} loading={loading} />}
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={() => setIsSignIn(!isSignIn)}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button variant="outline" type="button" onClick={() => console.log("UI: Google button clicked")}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
        </div>
    )
}

// --- MAIN EXPORTED COMPONENT ---

interface AuthUIProps {
    image?: {
        src: string;
        alt: string;
    };
    onSignIn?: (data: { email: string; password: string }) => Promise<void>;
    onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void>;
    loading?: boolean;
    error?: string | null;
}

const defaultImage = {
    src: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1376&q=80", // Students walking on campus
    alt: "A group of university students walking on campus"
};

const defaultQuote = null; // Remove the quote

export function AuthUI({ image = defaultImage, onSignIn, onSignUp, loading, error }: AuthUIProps) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Only the Form, no right column */}
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 w-full">
        <AuthFormContainer onSignIn={onSignIn} onSignUp={onSignUp} loading={loading} error={error} />
      </div>
    </div>
  );
}