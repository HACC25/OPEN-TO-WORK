import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}