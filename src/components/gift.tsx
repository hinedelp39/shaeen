import { Check } from "lucide-react"

export default function WinningScreen() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/winning-bg.jpg')",
        }}
      />

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-sky-100/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Green Checkmark Circle */}
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
          <Check className="h-16 w-16 text-white" strokeWidth={3} />
        </div>

        {/* Congratulation Text */}
        <h1 className="mb-16 font-serif text-[2.5rem] font-medium italic leading-tight tracking-tight text-[#3d4f5f]">
          Congratulation
          <br />
          You Won
        </h1>

        {/* Amount */}
        <p className="mb-6 text-[3.5rem] font-bold tracking-tight text-[#4a8fd9]">
          1500 AED
        </p>

        {/* Credit Info */}
        <p className="text-[1.3rem] font-normal leading-relaxed text-[#5a6f80]">
          Credited to your account
          <br />
          in 4 to 48 hours
        </p>
      </div>
    </main>
  )
}
