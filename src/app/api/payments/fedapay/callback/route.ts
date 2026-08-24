import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFedaPayTransaction } from '@/lib/payments/fedapay';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get('orderNumber');
  const transactionId = searchParams.get('id');
  const status = searchParams.get('status');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!orderNumber) {
    return NextResponse.redirect(new URL('/boutique', appUrl));
  }

  try {
    if (transactionId) {
      const verification = await verifyFedaPayTransaction(transactionId);
      if (verification.success && verification.status === 'PAID') {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
        });

        if (order && order.status !== 'PAID') {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                paymentRef: String(transactionId),
              },
            });
            await tx.orderStatusEvent.create({
              data: {
                orderId: order.id,
                status: 'PAID',
                note: `Paiement FEDAPAY approuvé (Réf Transaction : ${transactionId})`,
              },
            });
          });
        }
      }
    }

    return NextResponse.redirect(new URL(`/commande/${orderNumber}?payment=success`, appUrl));
  } catch (error) {
    console.error('Erreur callback FedaPay :', error);
    return NextResponse.redirect(new URL(`/commande/${orderNumber}?payment=pending`, appUrl));
  }
}
