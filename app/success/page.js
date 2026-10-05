import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9f7ef] p-5">
      <div className="w-full max-w-[700px] rounded-[20px] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:p-12">
        
        <div className="text-center">
          <div className="mb-3 text-[60px] text-[#198754]">
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <h1 className="text-3xl font-bold">
            Thank You!
          </h1>

          <p className="mt-2 text-gray-500">
            Your feedback has been submitted successfully.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-[#198754] px-4 py-2 text-white no-underline transition hover:bg-[#157347]"
          >
            <i className="bi bi-arrow-left mr-2"></i>
            Submit Another Feedback
          </Link>
        </div>

      </div>
    </main>
  );
}