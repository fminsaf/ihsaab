import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { useState, type SubmitEvent } from "react";
import { toast } from "../../components/ui/toast";
import supabase from "../../lib/supabase";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.add({
        description: "Please fill in both email and password fields.",
        type: "error",
      });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.add({
        description: error.message,
        type: "error",
      });
      return;
    }

    return navigate("/");
  };
  return (
    <>
      <h2 className="text-5xl font-extrabold">Sign in to your account</h2>

      <form className="w-full max-w-sm" onSubmit={handleSignIn}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <FieldDescription>Enter your email</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <FieldDescription>Enter your password</FieldDescription>
            </Field>
          </FieldGroup>
          <Field orientation="responsive">
            <Button type="submit">Submit</Button>
          </Field>

          <Link
            to="/auth/sign-up"
            className="text-center text-sm underline hover:no-underline"
          >
            Don't have an account? Sign up
          </Link>
        </FieldSet>
      </form>
    </>
  );
};

export default SignInPage;
