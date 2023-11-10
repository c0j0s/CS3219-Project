import Container from "@/components/common/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <Container>
                {children}
            </Container>
    );
}
