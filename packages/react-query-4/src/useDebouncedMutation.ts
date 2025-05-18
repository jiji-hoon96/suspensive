import { type UseMutationResult, useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import type { DebouncedMutationOptions } from './debouncedMutationOptions'
import { debounce } from './utils/debounce'

export type UseDebouncedMutationResult<TData = unknown, TError = unknown, TVariables = void, TContext = unknown> = Omit<
  UseMutationResult<TData, TError, TVariables, TContext>,
  'mutate' | 'mutateAsync'
> & {
  mutate: (variables: TVariables, options?: { cancelPending?: boolean }) => void
  mutateAsync: (variables: TVariables, options?: { cancelPending?: boolean }) => Promise<TData>
}

export function useDebouncedMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: DebouncedMutationOptions<TData, TError, TVariables, TContext>
): UseDebouncedMutationResult<TData, TError, TVariables, TContext> {
  const { debounceOptions, ...mutationOptions } = options

  const wait = debounceOptions?.wait ?? 500

  const mutation = useMutation<TData, TError, TVariables, TContext>(mutationOptions)

  const pendingPromiseResolverRef = useRef<{
    resolve: (value: TData) => void
    reject: (reason: TError) => void
  } | null>(null)

  const debouncedMutateRef = useRef(
    debounce(
      (variables: TVariables, resolve: (value: TData) => void, reject: (reason: TError) => void) => {
        mutation
          .mutateAsync(variables)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            pendingPromiseResolverRef.current = null
          })
      },
      wait,
      debounceOptions
    )
  )

  useEffect(() => {
    return () => {
      debouncedMutateRef.current.cancel()
    }
  }, [])

  const debouncedMutate = useCallback((variables: TVariables, options?: { cancelPending?: boolean }) => {
    if (options?.cancelPending && pendingPromiseResolverRef.current) {
      debouncedMutateRef.current.cancel()
      pendingPromiseResolverRef.current = null
    }

    debouncedMutateRef.current(
      variables,
      () => {},
      () => {}
    )
  }, [])

  const debouncedMutateAsync = useCallback(
    (variables: TVariables, options?: { cancelPending?: boolean }): Promise<TData> => {
      return new Promise<TData>((resolve, reject) => {
        if (options?.cancelPending && pendingPromiseResolverRef.current) {
          debouncedMutateRef.current.cancel()
          pendingPromiseResolverRef.current.reject(new Error('Mutation cancelled') as unknown as TError)
        }

        pendingPromiseResolverRef.current = { resolve, reject }
        debouncedMutateRef.current(variables, resolve, reject)
      })
    },
    []
  )

  return {
    ...mutation,
    mutate: debouncedMutate,
    mutateAsync: debouncedMutateAsync,
  }
}
