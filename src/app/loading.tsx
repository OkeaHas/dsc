import { Container, Skeleton } from "@/components/ui";

/**
 * Tampilan saat data sedang dimuat.
 *
 * Kerangkanya meniru susunan kartu yang sebenarnya, sehingga tata letak tidak
 * "melompat" ketika data asli masuk — terutama terasa di HP.
 */
export default function Loading() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-56 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="grid gap-2 p-4 sm:p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
