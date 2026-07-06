'use client';

import Link from 'next/link';

export function Section({
    title,
    description,
    children,
    action,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
                </div>
                {action ? <div>{action}</div> : null}
            </div>
            {children}
        </section>
    );
}

export function EmptyState({
    title,
    description,
    href,
    label,
}: {
    title: string;
    description: string;
    href?: string;
    label?: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <p className="font-medium text-slate-900">{title}</p>
            <p className="mt-1">{description}</p>
            {href && label ? (
                <Link href={href} className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-white">
                    {label}
                </Link>
            ) : null}
        </div>
    );
}
