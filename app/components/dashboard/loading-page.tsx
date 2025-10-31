import { Button } from "@/components/ui/button"
import Link from "next/link"

const LoadingPage = () => {
    return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-12 px-8 py-8 sm:py-16 lg:py-24'>

            <div className='text-center'>
                <h3 className='mb-6 text-5xl font-semibold'>Loading</h3>
                <h4 className='mb-1.5 text-3xl font-semibold'>Preparing your page...</h4>
                <p className='mb-6'>Please wait while we prepare your page.</p>
                <Button size='lg' className='rounded-lg text-base shadow-sm' asChild>
                    <Link href='/'>Back to home page</Link>
                </Button>
            </div>
        </div>  
    )
}

export default LoadingPage
