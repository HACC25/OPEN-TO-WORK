import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { Footer } from "@/components/landing/footer";
import { PublicReports } from "@/components/landing/public-reports";

export default function Home() {
    return (
        <>
            <Header />
            <Hero />
            <Features />
            <Workflow />
            <PublicReports />
            <Footer />
        </>
    );
}
