import { RefObject, createRef } from 'react'
import { Toaster, Intent } from '@blueprintjs/core'

export const toastRef: RefObject<Toaster> = createRef<Toaster>();

export function addErrorToast(message: string) {
  toastRef.current?.show({
    icon: "error",
    intent: Intent.WARNING,
    message,
    timeout: 5000
  })
}
export function addSuccessToast(message: string) {
  toastRef.current?.show({
    icon: "tick",
    intent: Intent.SUCCESS,
    message,
    timeout: 5000
  })
}
