import React from "react";

export function AppSidebarContent({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className='z-1 mx-auto flex size-full max-w-20xl flex-1 flex-col px-4 py-6 sm:px-6 min-w-0'>
            {children}
        </div>
    )
}