import { useState } from "react";
import { X, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/spinner";

interface KashyPaymentModalProps {
  open: boolean;
  rewardTitle: string;
  planLabel: string;
  paymentLink: string;
  isPending: boolean;
  isGuest?: boolean;
  onClose: () => void;
  onConfirm: (guestEmail?: string) => Promise<void>;
}

export function KashyPaymentModal({
  open,
  rewardTitle,
  planLabel,
  paymentLink,
  isPending,
  isGuest,
  onClose,
  onConfirm
}: KashyPaymentModalProps) {
  const [step, setStep] = useState<"email" | "initial" | "payment">(isGuest ? "email" : "initial");
  const [emailInput, setEmailInput] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [emailError, setEmailError] = useState("");
  const [hasSavedCode, setHasSavedCode] = useState(false);

  if (!open) return null;

  const handleEmailSubmit = () => {
    setEmailError("");
    if (!emailInput || !emailInput.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (emailInput !== emailConfirm) {
      setEmailError("Emails do not match");
      return;
    }
    if (!hasSavedCode) {
      setEmailError("You must acknowledge that you will take a screenshot of the payment tab.");
      return;
    }
    setStep("initial");
  };

  const handleProceed = () => {
    // Open Kashy link in a centered popup window to simulate an iframe
    const width = 500;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(paymentLink, "KashyPayment", `width=${width},height=${height},left=${left},top=${top}`);
    
    // Move to the verification step
    setStep("payment");
  };

  const handleConfirm = async () => {
    await onConfirm(isGuest ? emailInput : undefined);
    setStep(isGuest ? "email" : "initial");
    setEmailInput("");
    setEmailConfirm("");
  };

  const handleCancel = () => {
    setStep(isGuest ? "email" : "initial");
    setEmailInput("");
    setEmailConfirm("");
    setHasSavedCode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={handleCancel}
      />
      <div className="relative z-[91] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-background shadow-[0_32px_120px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,120,40,0.18),transparent_34%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%)]" />
        
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                Secure Checkout
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                {step === "email" ? "Guest Checkout" : step === "initial" ? "Ready to Pay?" : "Payment Verification"}
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 shrink-0 rounded-full p-0"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-sm shadow-inner">
            <p className="font-medium text-foreground">{rewardTitle}</p>
            <p className="mt-1 text-muted-foreground">Plan: {planLabel}</p>
          </div>

          {step === "email" ? (
            <div className="mt-6">
              <div className="mb-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-border/70 bg-background/50 px-4 py-2.5 outline-none focus:border-primary"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">We need your email to process your guest order.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm email address</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-border/70 bg-background/50 px-4 py-2.5 outline-none focus:border-primary"
                    placeholder="name@example.com"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="save-code"
                    checked={hasSavedCode}
                    onChange={(e) => setHasSavedCode(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background/50"
                  />
                  <label htmlFor="save-code" className="text-sm font-medium leading-tight">
                    I understand that I am checking out as a guest, and I must take a screenshot of the successful payment tab before closing it.
                  </label>
                </div>

                {emailError && (
                  <p className="text-sm text-red-400">{emailError}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  className="h-12 bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={handleEmailSubmit}
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : step === "initial" ? (
            <div className="mt-6">
              <div className="mb-6 rounded-2xl bg-[hsl(var(--arcetis-ember))]/10 p-4 border border-[hsl(var(--arcetis-ember))]/20">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="save-code-initial"
                    checked={hasSavedCode}
                    onChange={(e) => setHasSavedCode(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[hsl(var(--arcetis-ember))] focus:ring-[hsl(var(--arcetis-ember))] bg-background/50 accent-[hsl(var(--arcetis-ember))]"
                  />
                  <label htmlFor="save-code-initial" className="text-sm font-medium text-[hsl(var(--arcetis-ember))]">
                    Important: Please take a screenshot of your payment confirmation screen before closing the payment window.
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  className="h-12 bg-[hsl(var(--arcetis-ember))] text-black hover:bg-[rgba(255,122,24,0.92)]" 
                  onClick={handleProceed}
                  disabled={!hasSavedCode}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </Button>
                <Button variant="outline" className="h-12" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-6 space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  A payment window has been opened. Once you've completed the payment and taken your screenshot, confirm below to generate your unique request code.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  className="h-12 bg-emerald-500 text-black hover:bg-emerald-400"
                  onClick={handleConfirm}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Yes, I completed the payment
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12" 
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  No, I cancelled
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
