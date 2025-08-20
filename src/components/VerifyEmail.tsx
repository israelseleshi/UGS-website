import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { AlertCircle, CheckCircle, Mail, Shield } from "lucide-react";
import { useAuth } from "../lib/auth";

interface VerifyEmailProps {
  onPageChange: (page: string) => void;
}

export function VerifyEmail({ onPageChange }: VerifyEmailProps) {
  const { requestOtp, verifyOtp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>(
    "We've sent a verification link to your Gmail. Click the link, then return here and continue."
  );

  // Auto-send OTP when page mounts
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await requestOtp();
        if (!mounted) return;
        setInfo("We've sent a verification code to your Gmail.");
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Could not send verification code. Use Resend.");
      }
    })();
    return () => { mounted = false; };
  }, [requestOtp]);

  const handleResend = async () => {
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      await requestOtp();
      setInfo("We sent a new verification email to your Gmail.");
    } catch (e: any) {
      setError(e?.message || "Could not resend email. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await verifyOtp("");
      setInfo("Verified successfully. Redirecting...");
      setTimeout(() => onPageChange("home"), 600);
    } catch (e: any) {
      setError(e?.message || "Email is not verified yet. Please click the link in your email and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Verify your email</CardTitle>
              <CardDescription>
                Gmail-only access. Enter the OTP sent to your Gmail address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              {info && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{info}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Check your Gmail inbox (and spam) for a verification email.
                </div>
                <Button onClick={handleContinue} className="w-full" disabled={isSubmitting || loading}>
                  I've verified, continue
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure verification
                </span>
                <Button variant="outline" size="sm" onClick={handleResend} disabled={isSubmitting || loading}>
                  Resend email
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
