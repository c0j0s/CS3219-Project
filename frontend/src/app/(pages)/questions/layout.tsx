import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Questions",
    description: "coding questions",
};

export default function QuestionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto p-[30px] pt-[15px]" suppressHydrationWarning={true}>
            {children}
        </div>
    );
}
