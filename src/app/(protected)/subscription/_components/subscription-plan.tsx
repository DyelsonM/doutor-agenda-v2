"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface SubscriptionPlanProps {
  active?: boolean;
  className?: string;
}

export function SubscriptionPlan({ active = false }: SubscriptionPlanProps) {
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key not found");
      }
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      );
      if (!stripe) {
        throw new Error("Stripe not found");
      }
      if (!data?.sessionId) {
        throw new Error("Session ID not found");
      }
      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
    },
  });
  const features = [
    "Cadastro de até 50 médicos",
    "Agendamentos ilimitados",
    "Métricas básicas",
    "Cadastro de pacientes",
    "Confirmação manual",
    "Suporte via e-mail",
  ];

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  return (
    <Card className={"w-full max-w-sm"}>
      <CardHeader className="pb-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Essential</h3>
          {active && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-100"
            >
              Atual
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Para profissionais autônomos ou pequenas clínicas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-6">
          <span className="text-3xl font-semibold">R$59</span>
          <span className="text-muted-foreground ml-1">/ mês</span>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          onClick={active ? () => {} : handleSubscribeClick}
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : active ? (
            "Gerenciar assinatura"
          ) : (
            "Fazer assinatura"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
