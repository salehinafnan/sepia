import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

import {
  errorMessage,
  useGoogleSignInMutation,
  useSignInMutation,
  useSignUpMutation,
} from "../../api";
import { GOOGLE_CLIENT_ID } from "../../config";
import { useDarkTheme } from "../../lib/theme";
import { selectUser } from "../../store/auth";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import Input from "./Input";

// Google renders its button at a fixed pixel width, so match the form's width.
const GoogleButton = ({ isSignup, onCredential, onError }) => {
  const dark = useDarkTheme();
  const container = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    setWidth(Math.min(400, container.current.offsetWidth));
  }, []);

  return (
    <div ref={container} className="flex h-10 justify-center">
      {width > 0 && (
        <GoogleLogin
          onSuccess={({ credential }) => onCredential(credential)}
          onError={onError}
          context={isSignup ? "signup" : "signin"}
          text={isSignup ? "signup_with" : "signin_with"}
          theme={dark ? "filled_black" : "outline"}
          shape="pill"
          width={width}
        />
      )}
    </div>
  );
};

const Auth = () => {
  const user = useSelector(selectUser);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [signIn, { isLoading: signingIn }] = useSignInMutation();
  const [signUp, { isLoading: signingUp }] = useSignUpMutation();
  const [googleSignIn] = useGoogleSignInMutation();

  // Signing in stores the session, which lands here.
  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const { confirmPassword, ...form } = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    if (isSignup && form.password !== confirmPassword)
      return setError("Passwords don't match");

    setError(null);
    const request = isSignup ? signUp(form) : signIn(form);
    await request.unwrap().catch((err) => setError(errorMessage(err)));
  };

  const signInWithGoogle = (credential) =>
    googleSignIn(credential)
      .unwrap()
      .catch((err) => setError(errorMessage(err)));

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError(null);
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-4 sm:pt-10">
      <Logo className="size-12" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        {isSignup
          ? "Join Sepia to share your moments."
          : "Sign in to share and like moments."}
      </p>

      <div className="mt-8 w-full rounded-2xl bg-white p-6 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
        {GOOGLE_CLIENT_ID && (
          <>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleButton
                isSignup={isSignup}
                onCredential={signInWithGoogle}
                onError={() => setError("Google sign-in didn't complete")}
              />
            </GoogleOAuthProvider>
            <div className="my-6 flex items-center gap-3 text-xs text-stone-400 uppercase">
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
              or
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            </div>
          </>
        )}

        <form key={isSignup} onSubmit={submit} className="space-y-4">
          {isSignup && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                name="firstName"
                autoComplete="given-name"
                maxLength={50}
              />
              <Input
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                maxLength={50}
              />
            </div>
          )}
          <Input label="Email" name="email" type="email" autoComplete="email" />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
          />
          {isSignup && (
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={signingIn || signingUp}
            className="w-full"
          >
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
        {isSignup ? "Already have an account?" : "New to Sepia?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
};

export default Auth;
