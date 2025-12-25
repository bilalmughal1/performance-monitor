import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
});

export async function createCheckoutSession(
    priceId: string,
    userId: string,
    userEmail: string,
    returnUrl: string
) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: userEmail,
        metadata: {
            userId,
        },
        success_url: `${returnUrl}?success=true`,
        cancel_url: `${returnUrl}?canceled=true`,
    });

    return session.url;
}

export async function getSubscriptionStatus(stripeCustomerId: string) {
    // Implement logic to check subscription status from Stripe or your DB
    // For MVP, we rely on webhooks updating the DB.
    // This function is a placeholder for direct checks if needed.
    return null;
}
