import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error('[STRIPE_WEBHOOK_ERROR]', err)
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
      // Handle successful payments
      const metadata = session.metadata!
      const paymentType = metadata.type // PROPERTY, SERVICE, LEISURE, VALUATION
      const itemId = metadata.itemId
      const userId = metadata.userId

      if (paymentType === 'PROPERTY') {
        // Handle property booking payment
        await prisma.propertyBooking.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentDetails: {
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              currency: session.currency,
              paymentMethod: session.payment_method_types[0],
            },
            activities: {
              create: {
                type: 'PAYMENT_COMPLETED',
                userId,
                description: 'Property booking payment completed',
                metadata: {
                  amount: session.amount_total! / 100,
                  currency: session.currency,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })

        // Create commission records for agent and referrer
        const commissionPromises = []
        
        // 5% commission for executing agent
        if (metadata.agentId) {
          commissionPromises.push(
            prisma.commission.create({
              data: {
                userId: metadata.agentId,
                type: 'PROPERTY_BOOKING',
                status: 'PENDING',
                amount: (session.amount_total! / 100) * 0.05, // 5% commission
                currency: session.currency,
                metadata: {
                  bookingId: itemId,
                  propertyId: metadata.propertyId,
                  dublinRegion: metadata.dublinRegion,
                },
              },
            })
          )
        }

        // 20% referral commission if applicable
        if (metadata.referrerId) {
          commissionPromises.push(
            prisma.commission.create({
              data: {
                userId: metadata.referrerId,
                type: 'PROPERTY_REFERRAL',
                status: 'PENDING',
                amount: (session.amount_total! / 100) * 0.01, // 1% referral commission (20% of 5%)
                currency: session.currency,
                metadata: {
                  bookingId: itemId,
                  propertyId: metadata.propertyId,
                  agentId: metadata.agentId,
                  dublinRegion: metadata.dublinRegion,
                },
              },
            })
          )
        }

        if (commissionPromises.length > 0) {
          await Promise.all(commissionPromises)
        }

      } else if (paymentType === 'SERVICE') {
        // Handle service booking payment
        await prisma.serviceBooking.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentDetails: {
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              currency: session.currency,
              paymentMethod: session.payment_method_types[0],
            },
            activities: {
              create: {
                type: 'PAYMENT_COMPLETED',
                userId,
                description: 'Service booking payment completed',
                metadata: {
                  amount: session.amount_total! / 100,
                  currency: session.currency,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })

        // Create commission record for service provider
        await prisma.commission.create({
          data: {
            userId: metadata.providerId,
            type: 'SERVICE_BOOKING',
            status: 'PENDING',
            amount: (session.amount_total! / 100) * 0.10, // 10% commission
            currency: session.currency,
            metadata: {
              bookingId: itemId,
              serviceId: metadata.serviceId,
              dublinRegion: metadata.dublinRegion,
            },
          },
        })

      } else if (paymentType === 'LEISURE') {
        // Handle leisure booking payment
        await prisma.leisureBooking.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentDetails: {
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              currency: session.currency,
              paymentMethod: session.payment_method_types[0],
            },
            activities: {
              create: {
                type: 'PAYMENT_COMPLETED',
                userId,
                description: 'Leisure booking payment completed',
                metadata: {
                  amount: session.amount_total! / 100,
                  currency: session.currency,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })

        // Create commission record for leisure provider
        await prisma.commission.create({
          data: {
            userId: metadata.providerId,
            type: 'LEISURE_BOOKING',
            status: 'PENDING',
            amount: (session.amount_total! / 100) * 0.15, // 15% commission
            currency: session.currency,
            metadata: {
              bookingId: itemId,
              leisureId: metadata.leisureId,
              dublinRegion: metadata.dublinRegion,
            },
          },
        })

      } else if (paymentType === 'VALUATION') {
        // Handle valuation payment
        await prisma.valuationRequest.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'PAID',
            paymentDetails: {
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              currency: session.currency,
              paymentMethod: session.payment_method_types[0],
            },
            activities: {
              create: {
                type: 'PAYMENT_COMPLETED',
                userId,
                description: 'Valuation payment completed',
                metadata: {
                  amount: session.amount_total! / 100,
                  currency: session.currency,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })

        // Create commission record for valuation agent
        await prisma.commission.create({
          data: {
            userId: metadata.agentId,
            type: 'VALUATION',
            status: 'PENDING',
            amount: (session.amount_total! / 100) * 0.80, // 80% to agent
            currency: session.currency,
            metadata: {
              valuationId: itemId,
              propertyId: metadata.propertyId,
              dublinRegion: metadata.dublinRegion,
            },
          },
        })
      }

      // Send real-time notification
      await Promise.all([
        pusher.trigger(
          `private-user-${userId}`,
          'payment-completed',
          {
            type: paymentType,
            itemId,
            amount: session.amount_total! / 100,
            currency: session.currency,
            timestamp: new Date().toISOString(),
          }
        ),
        prisma.notification.create({
          data: {
            userId,
            type: 'PAYMENT_COMPLETED',
            title: 'Payment Successful',
            content: `Your payment of ${session.currency.toUpperCase()} ${session.amount_total! / 100} has been processed successfully`,
            metadata: {
              type: paymentType,
              itemId,
              amount: session.amount_total! / 100,
              currency: session.currency,
              dublinRegion: metadata.dublinRegion,
            },
          },
        }),
      ])

    } else if (event.type === 'checkout.session.expired') {
      // Handle expired sessions
      const metadata = session.metadata!
      const paymentType = metadata.type
      const itemId = metadata.itemId
      const userId = metadata.userId

      // Update status based on payment type
      if (paymentType === 'VALUATION') {
        await prisma.valuationRequest.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'CANCELLED',
            activities: {
              create: {
                type: 'PAYMENT_EXPIRED',
                userId,
                description: 'Valuation payment session expired',
                metadata: {
                  sessionId: session.id,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })
      } else {
        // Handle booking expirations
        const bookingModel = 
          paymentType === 'PROPERTY' ? prisma.propertyBooking :
          paymentType === 'SERVICE' ? prisma.serviceBooking :
          prisma.leisureBooking

        await bookingModel.update({
          where: {
            id: itemId,
            userId,
          },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'EXPIRED',
            activities: {
              create: {
                type: 'PAYMENT_EXPIRED',
                userId,
                description: 'Payment session expired',
                metadata: {
                  sessionId: session.id,
                  dublinRegion: metadata.dublinRegion,
                },
              }
            },
          },
        })
      }

      // Send notification
      await Promise.all([
        pusher.trigger(
          `private-user-${userId}`,
          'payment-expired',
          {
            type: paymentType,
            itemId,
            timestamp: new Date().toISOString(),
          }
        ),
        prisma.notification.create({
          data: {
            userId,
            type: 'PAYMENT_EXPIRED',
            title: 'Payment Session Expired',
            content: 'Your payment session has expired. Please try again.',
            metadata: {
              type: paymentType,
              itemId,
              dublinRegion: metadata.dublinRegion,
            },
          },
        }),
      ])
    }

    return new NextResponse(null, { status: 200 })

  } catch (error) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}