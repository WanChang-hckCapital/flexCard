/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useDict } from "@/app/context/dictionary-context";
import SignInWithEmail from "@/components/forms/sign-in";
import MaxWContainer from "@/components/max-w-container";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignIn() {
  const router = useRouter();
  const dict = useDict();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleAgree = async () => {
    setHasAgreed(true);
    setIsModalOpen(false);

    if (selectedProvider) {
      await signIn(selectedProvider, {
        callbackUrl: `${window.location.origin}`,
      });
    }
  };

  const handleSignIn = async (provider: string) => {
    setSelectedProvider(provider);

    if (!hasAgreed) {
      setIsModalOpen(true);
    } else {
      await signIn(provider, {
        callbackUrl: `${window.location.origin}`,
      });
    }
  };

  if (!dict || !dict.auth || !dict.auth.signUp) {
    return <p className="dark:text-white text-black text-center">Loading...</p>;
  }

  return (
    <MaxWContainer>
      <h1 className="dark:text-white text-black head-text font-bold text-center pt-8">
        {dict.auth.signIn.title}
      </h1>

      <div className="flex flex-col items-center w-full gap-4 py-8">
        <Button
          onClick={() => handleSignIn("google")}
          className="text-white w-80"
          variant="destructive"
        >
          <Image
            width={24}
            height={24}
            className="mr-5"
            src="/assets/google-logo.svg"
            alt="google logo"
          />
          {dict.auth.signIn.google}
        </Button>

        <Button
          onClick={() => handleSignIn("facebook")}
          className="text-white w-80"
          variant="sky"
        >
          <Image
            width={24}
            height={24}
            className="mr-2"
            src="/assets/facebook-logo.svg"
            alt="facebook logo"
          />
          {dict.auth.signIn.facebook}
        </Button>

        <Button
          onClick={() => handleSignIn("line")}
          className="text-white w-80"
          variant="green"
        >
          <Image
            width={24}
            height={24}
            className="mr-10"
            src="/line-logo.png"
            alt="line logo"
          />
          {dict.auth.signIn.line}
        </Button>

        <Button
          onClick={() => handleSignIn("apple")}
          className="bg-dark-1 text-white w-80"
          variant="outline"
        >
          <Image
            width={24}
            height={24}
            className="mr-3"
            src="/assets/apple-logo-dark.svg"
            alt="apple logo"
          />
          {dict.auth.signIn.apple}
        </Button>

        <p className="dark:text-white text-slate-700">{dict.auth.signUp.or}</p>

        <section className="w-80">
          <SignInWithEmail btnTitle={dict.auth.signIn.btnSignIn} />
        </section>

        <div className="text-center">
          <p className="dark:text-white text-slate-700">
            {dict.auth.signIn.noAccount}
            <Button
              onClick={() => router.push("sign-up")}
              className="dark:text-white text-slate-700 font-bold"
              variant="link"
            >
              {dict.auth.signIn.createAccount}
            </Button>
          </p>
          <Button
            onClick={() => router.push("forgot-password")}
            className="dark:text-white text-slate-700 font-bold"
            variant="link"
          >
            {dict.auth.signIn.forgotPassword}
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <h2>Terms and Conditions</h2>
          </DialogHeader>
          <div className="overflow-y-scroll h-64 p-4 border border-gray-200 dark:border-gray-700">
            <p>
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
              Terms and conditions.Terms and conditions.Terms and conditions...
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <Checkbox
              id="agree-checkbox"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked === true)}
            />
            <label htmlFor="agree-checkbox" className="ml-2 text-sm">
              I have read and agree to the terms and conditions
            </label>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAgree}
              disabled={!isChecked}
              className="w-full"
            >
              {isChecked ? "Proceed" : "Agree to proceed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MaxWContainer>
  );
}
