'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Poster } from "@/components/poster/Poster";
import { usePosterStore } from '@/store/usePosterStore';

function RenderContent() {
    const searchParams = useSearchParams();
    const state = usePosterStore();

    useEffect(() => {
        // Attempt to load state from search params if provided
        const stateParam = searchParams.get('state');
        if (stateParam) {
            try {
                const decodedState = JSON.parse(decodeURIComponent(stateParam));
                state.updateState(decodedState);
            } catch (e) {
                console.error("Failed to parse state param", e);
            }
        }
    }, [searchParams]);

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-white">
            <Poster />
        </div>
    );
}

export default function RenderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RenderContent />
        </Suspense>
    );
}
