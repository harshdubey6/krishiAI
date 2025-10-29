import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex flex-col">
      <header className="w-full px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image src="/leaf-logo.svg" alt="AI Plant Doctor" fill className="object-contain" priority />
          </div>
          <span className="text-lg sm:text-xl font-semibold text-green-700">AI Plant Doctor</span>
        </div>
        <Link href="/login" className="rounded-full border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors text-sm sm:text-base px-4 py-2">
          Login
        </Link>
      </header>

      <main className="flex-1 px-6 sm:px-8">
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center py-10 sm:py-16">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Your smart companion for healthy, thriving plants
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              Diagnose plant issues from a photo, get tailored care tips, and keep your garden flourishing with AI-powered insights.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-6 py-3 text-sm sm:text-base font-medium hover:bg-green-700 transition-colors">
                Get Started
              </Link>
              <Link href="/dashboard/diagnose" className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-700 px-6 py-3 text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors">
                Try Diagnosis
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg ring-1 ring-green-100">
        <Image
                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop"
                alt="AI-assisted plant diagnosis"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                className="object-cover"
          priority
        />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/10 via-transparent to-emerald-600/10" />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-6 sm:py-10">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-xl border border-gray-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Snap & Diagnose</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Upload a plant photo and get instant AI analysis.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actionable Tips</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Clear recommendations to treat issues effectively.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">For Every Grower</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Simple, minimal, and mobile-first experience.</p>
            </div>
        </div>
        </section>
      </main>

      <footer className="px-6 sm:px-8 py-8 border-t border-green-100 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} AI Plant Doctor</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-700">Login</Link>
            <Link href="/register" className="hover:text-gray-700">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
