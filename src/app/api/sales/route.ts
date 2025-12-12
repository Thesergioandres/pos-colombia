import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customerId,
      paymentMethod,
      subtotal,
      iva,
      total,
      discount,
      cashReceived,
      change,
      paymentDetails,
      notes
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos en la venta' },
        { status: 400 }
      );
    }

    // Get organization and store from auth token or session (simplified for now)
    const organizationId = 'cmj25u4fa0000kze1x5zm0e8t';
    const storeId = 'cmj25u4ij0006kze1ivih8bsk';
    const userId = 'cmj25u4ig0002kze1ruqzs1dm';

    // Generate invoice number
    const invoiceNumber = `POS-${Date.now()}`;

    // Create sale
    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        customerType: customerId ? 'NATURAL' : 'GENERAL',
        customerId: customerId || null,
        storeId,
        userId,
        subtotal,
        iva,
        total,
        discount,
        paymentMethod,
        paymentStatus: 'PAID',
        status: 'COMPLETED',
        notes: notes || '',
        isElectronic: false,
        organizationId,
      },
    });

    // Create sale items
    for (const item of items) {
      await db.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          discount: item.discount || 0,
        },
      });

      // Update product stock
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create payment record
    await db.payment.create({
      data: {
        saleId: sale.id,
        amount: total,
        method: paymentMethod,
        reference: paymentDetails?.referenceNumber || null,
        status: 'PAID',
      },
    });

    return NextResponse.json(sale);

  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}