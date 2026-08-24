import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyKkiapayTransaction } from '@/lib/payments/kkiapay';
import { verifyKkiapayWebhookSignature } from '@/lib/payments/webhook-verifier';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-kkiapay-signature') || request.headers.get('x-kkiapay-secret');

    // Vérification de la signature si le secret est configuré
    if (process.env.KKIAPAY_SECRET) {
      const isValid = verifyKkiapayWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('⚠️ Webhook Kkiapay rejeté : Signature invalide');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const transactionId = body.transactionId || body.id;

    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId manquant' }, { status: 400 });
    }

    // Vérification de la transaction auprès de Kkiapay
    const verifyResult = await verifyKkiapayTransaction(transactionId);
    if (verifyResult.success && verifyResult.status === 'PAID') {
      // Trouver la commande associée (via data/custom fields ou par paymentRef / transaction)
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentRef: transactionId },
            { paymentRef: { startsWith: 'KKIAPAY' } },
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
              note: `Paiement KKIAPAY validé via Webhook (Réf : ${transactionId})`,
            },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur webhook Kkiapay :', error);
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 });
  }
}
