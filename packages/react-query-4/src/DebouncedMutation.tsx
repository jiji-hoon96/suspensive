import type { DebouncedMutationOptions } from './debouncedMutationOptions'
import { type UseDebouncedMutationResult, useDebouncedMutation } from './useDebouncedMutation'

export type DebouncedMutationProps<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = DebouncedMutationOptions<TData, TError, TVariables, TContext> & {
  children: (mutation: UseDebouncedMutationResult<TData, TError, TVariables, TContext>) => React.ReactNode
}

export function DebouncedMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  props: DebouncedMutationProps<TData, TError, TVariables, TContext>
) {
  const { children, ...options } = props
  const mutation = useDebouncedMutation<TData, TError, TVariables, TContext>(options)

  return <>{children(mutation)}</>
}
