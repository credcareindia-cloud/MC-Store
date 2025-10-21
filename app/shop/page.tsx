import { redirect } from 'next/navigation'

export default function ShopRedirect() {
  // Server-side immediate redirect
  redirect('/')
}



// "use client"

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// export default function ShopRedirect() {
//   const router = useRouter()

//   useEffect(() => {
//     // Immediate redirect to homepage
//     router.replace('/')
//   }, [router])

//   // Show minimal loading while redirecting
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
//         <p className="mt-4 text-gray-600">Redirecting...</p>
//       </div>
//     </div>
//   )
// }