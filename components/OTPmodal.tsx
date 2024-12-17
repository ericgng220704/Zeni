"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { Button } from "./ui/button";

export default function OtpModal({
  email,
  accountId,
}: {
  email: string;
  accountId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sessionId = await verifySecret({ accountId, password });

      console.log({ sessionId });

      if (sessionId) router.push("/");
    } catch (error) {
      console.log("Failed to verify OTP", error);
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter your OTP</AlertDialogTitle>
          <AlertDialogDescription>
            The one-time password was sent to your email:
            <span className="text-red-300 ml-1">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="!size-12 !text-[30px]" />
            <InputOTPSlot index={1} className="!size-12 !text-[30px]" />
            <InputOTPSlot index={2} className="!size-12 !text-[30px]" />
            <InputOTPSlot index={3} className="!size-12 !text-[30px]" />
            <InputOTPSlot index={4} className="!size-12 !text-[30px]" />
            <InputOTPSlot index={5} className="!size-12 !text-[30px]" />
          </InputOTPGroup>
        </InputOTP>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-8"
          >
            Verify
          </AlertDialogAction>
        </AlertDialogFooter>

        <div className="subtitle-2 mt-2 text-center text-light-100">
          Didn&apos;t get a code?
          <Button
            type="button"
            variant="link"
            className="pl-1 text-red-300"
            onClick={handleResendOtp}
          >
            Click to resend
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
