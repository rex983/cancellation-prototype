# BBD Cancellation Prototype

A working prototype of the order cancellation workflow for Big Buildings Direct.

## Two cancellation flows

| Flow | Owner | Order state | Refund treatment |
|------|-------|-------------|------------------|
| **Pre-STM** | Sales reps | Order has not yet been sent to manufacturer (deposit pending/paid, engineering) | Full deposit refund |
| **Post-STM** | BST team | Order is with the manufacturer (sent to manufacturer, in production, shipped) | Full deposit refund |

STM = "Sent To Manufacturer".

## Pages

- `/` — overview and counts
- `/sales` — pre-STM order queue (sales reps)
- `/bst` — post-STM order queue (BST)
- `/orders/[id]` — order detail + cancellation form
- `/cancellations` — review queue: approve / deny / mark complete

## Notes

- No login system. This is a prototype.
- Seed orders mimic real BBD building orders (manufacturer, region, dimensions, deposit, sales rep).
- In-memory store on the server — state resets when the server restarts or redeploys.
- Built with Next.js 16, Tailwind v4, shadcn/ui, TypeScript.

## Run

```
npm install
npm run dev
```
