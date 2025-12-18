import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Solo se permite la cancelación de ventas por este medio' },
        { status: 400 }
      );
    }

    // 1. Obtener la venta con sus items
    const sale = await db.sale.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }

    if (sale.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'La venta ya está cancelada' },
        { status: 400 }
      );
    }

    // 2. Iniciar transacción para asegurar integridad
    await db.$transaction(async (tx) => {
      // a. Actualizar estado de la venta
      await tx.sale.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED', // Asumimos reembolso si se cancela
        },
      });

      // b. Devolver stock de los productos
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
      
      // c. Actualizar estado de los pagos asociados (opcional pero recomendado)
      await tx.payment.updateMany({
        where: { saleId: id },
        data: {
          status: 'REFUNDED',
        },
      });
    });

    return NextResponse.json({ message: 'Venta cancelada y stock restaurado exitosamente' });

  } catch (error) {
    console.error('Error cancelando venta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cancelar la venta' },
      { status: 500 }
    );
  }
}
