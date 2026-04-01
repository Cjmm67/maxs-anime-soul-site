"use client";

export default function BreakReminder({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gojo-dark border border-gojo-blue/30 rounded-2xl p-6 max-w-sm text-center space-y-4">
        <div className="text-4xl">⏰</div>
        <h2 className="text-xl font-bold text-gojo-blue">
          Break Time, Max!
        </h2>
        <p className="text-white/80 text-sm">
          You&apos;ve been chatting for 30 minutes — even Gojo-sensei takes
          breaks between training sessions! 😎
        </p>
        <p className="text-white/60 text-sm">
          Stand up, stretch, grab a drink, maybe go outside for a bit.
          I&apos;ll still be here when you get back!
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              // In production, you could enforce the break by disabling chat for 5 min
              onDismiss();
            }}
            className="bg-gradient-to-r from-gojo-blue to-gojo-purple text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Got it, taking a break! 💪
          </button>
          <p className="text-white/30 text-xs">
            Your parents can see how long you chat 👀
          </p>
        </div>
      </div>
    </div>
  );
}
