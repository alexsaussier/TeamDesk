// Floating Background Component
export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      
      {/* Large background circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-300/5 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-300/5 rounded-full blur-lg animate-float-medium" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/8 to-blue-300/4 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Medium geometric shapes */}
      <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/15 to-blue-300/8 rounded-lg rotate-45 animate-float-medium blur-sm"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-br from-violet-400/12 to-purple-300/6 rounded-full animate-drift-horizontal blur-sm" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-teal-300/5 animate-rotate-slow blur-md" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '3s' }}></div>
      
      {/* Small accent shapes */}
      <div className="absolute top-1/3 right-1/5 w-8 h-8 bg-gradient-to-br from-rose-400/20 to-pink-300/10 rounded-full animate-float-fast blur-sm"></div>
      <div className="absolute top-3/4 left-1/5 w-6 h-6 bg-gradient-to-br from-amber-400/15 to-yellow-300/8 animate-pulse-geometric blur-sm" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
      <div className="absolute top-1/2 left-1/6 w-10 h-10 bg-gradient-to-br from-sky-400/12 to-cyan-300/6 rounded-full animate-morph blur-sm" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Floating rectangles */}
      <div className="absolute top-16 right-1/3 w-14 h-8 bg-gradient-to-r from-blue-400/8 to-indigo-300/4 rounded-md animate-drift-horizontal blur-sm" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/2 w-12 h-16 bg-gradient-to-b from-purple-400/10 to-violet-300/5 rounded-lg animate-float-medium blur-sm" style={{ animationDelay: '3.5s' }}></div>
      
      {/* Additional floating elements */}
      <div className="absolute top-2/3 right-1/6 w-18 h-18 bg-gradient-to-tr from-teal-400/12 to-emerald-300/6 animate-float-slow blur-md" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', animationDelay: '5s' }}></div>
      <div className="absolute bottom-16 right-1/5 w-8 h-20 bg-gradient-to-b from-indigo-400/10 to-blue-300/5 rounded-full animate-float-fast blur-sm" style={{ animationDelay: '2s' }}></div>
      
      {/* Morphing blob */}
      <div className="absolute top-1/4 right-1/2 w-28 h-28 bg-gradient-to-br from-cyan-400/8 to-blue-400/4 animate-morph blur-lg" style={{ animationDelay: '1s' }}></div>
      
      {/* Large background gradient overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-blue-400/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-400/5 via-transparent to-transparent blur-3xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
    </div>
  )
} 