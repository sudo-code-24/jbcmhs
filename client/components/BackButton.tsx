"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
const BackButton = () => {
    const router = useRouter();
    return (
        <Button asChild variant="link" className="h-auto w-fit px-0" onClick={() => {
            if (window.history.length > 1) {
                router.back();
            } else {
                router.push('/');
            }
        }}>
            <Link href="/">← Back</Link>
        </Button>
    );
};

export default BackButton;