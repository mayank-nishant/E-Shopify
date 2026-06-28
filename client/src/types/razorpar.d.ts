export {};

declare global {
  interface RazorpaySuccessResponse {
    readonly razorpay_payment_id: string;
    readonly razorpay_order_id: string;
    readonly razorpay_signature: string;
  }

  interface RazorpayFailureResponse {
    readonly code: string;
    readonly description: string;
    readonly source: string;
    readonly step: string;
    readonly reason: string;
    readonly metadata: {
      readonly order_id: string;
      readonly payment_id: string;
    };
  }

  interface RazorpayModalOptions {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  }

  interface RazorpayPrefill {
    name?: string;
    email?: string;
    contact?: string;
  }

  interface RazorpayTheme {
    color?: string;
    backdrop_color?: string;
  }

  type RazorpayPaymentMethod =
    | "card"
    | "netbanking"
    | "wallet"
    | "emi"
    | "upi"
    | "paylater"
    | "cardless_emi";

  interface RazorpayOptions {
    readonly key: string;
    readonly amount: number;
    readonly currency: string;
    readonly name: string;
    description?: string;
    image?: string;
    readonly order_id: string;
    handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
    modal?: RazorpayModalOptions;
    prefill?: RazorpayPrefill;
    notes?: Record<string, string>;
    theme?: RazorpayTheme;
    method?: Partial<Record<RazorpayPaymentMethod, boolean>>;
  }

  interface RazorpayInstance {
    open(): void;
    close(): void;
    on(
      event: "payment.failed",
      callback: (response: { error: RazorpayFailureResponse }) => void,
    ): void;
  }

  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}