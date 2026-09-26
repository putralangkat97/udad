import * as React from 'react';
import { cn } from '@/lib/utils';

function InputGroup({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="input-group"
            role="group"
            className={cn(
                'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 flex h-9 w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',
                className,
            )}
            {...props}
        />
    );
}

function InputGroupInput({
    className,
    ...props
}: React.ComponentProps<'input'>) {
    return (
        <input
            data-slot="input-group-control"
            className={cn(
                'placeholder:text-muted-foreground flex h-full min-w-0 flex-1 rounded-md bg-transparent px-3 py-1 text-sm outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

function InputGroupAddon({
    className,
    align = 'inline-start',
    ...props
}: React.ComponentProps<'div'> & {
    align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
}) {
    return (
        <div
            data-slot="input-group-addon"
            data-align={align}
            className={cn(
                'text-muted-foreground flex shrink-0 items-center justify-center gap-2 text-sm [&>svg]:size-4',
                align === 'inline-start' && 'pl-3',
                align === 'inline-end' && 'pr-3',
                className,
            )}
            {...props}
        />
    );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
