import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFedaPayTransaction } from '@/lib/payments/fedapay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.name || body.event;
    const entity = body.entity || body['v1/transaction'] || body.transaction;

    if (entity && (event === 'transaction.approved' || entity.status === 'approved')) {
      const transactionId = String(entity.id);

      // Vérification côté API FedaPay
      const verifyResult = await verifyFedaPayTransaction(transactionId);
      if (verifyResult.success && verifyResult.status === 'PAID') {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentRef: transactionId },
              { paymentRef: { startsWith: 'FEDAPAY' } },
            ],
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (order) {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                paymentRef: transactionId,
              },
            });
            await tx.orderStatusEvent.create({
              data: {
                orderId: order.id,
                status: 'PAID',
                note: `Paiement FEDAPAY validé via Webhook (Réf : ${transactionId})`,
              },
            });
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur webhook FedaPay :', error);
    return NextResponse.json({ error: 'Erreur webhook FedaPay' }, { status: 500 });
  }
}
