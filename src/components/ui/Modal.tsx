'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

function Modal({
    isOpen,
    onClose,
    title,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>{title ? <h2 className="text-lg font-semibold">{title}</h2> : null}</div>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                        ×
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
}

export { Modal };