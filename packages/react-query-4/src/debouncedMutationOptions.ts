import type { UseMutationOptions } from '@tanstack/react-query'
import type { DebounceOptions } from './utils/debounce'

export type DebouncedMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  debounceOptions?: DebounceOptions
}

export function debouncedMutationOptions<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: DebouncedMutationOptions<TData, TError, TVariables, TContext>
) {
  return options
}
