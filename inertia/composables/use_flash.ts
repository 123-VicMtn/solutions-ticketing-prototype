import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import type { Data } from '@generated/data'

export function useFlash() {
  const page = usePage<Data.SharedProps>()

  watch(
    () => page.url,
    () => toast.dismiss()
  )

  watch(
    () => page.props.flash.error,
    (error) => {
      if (error) toast.error(error)
    },
    { immediate: true }
  )

  watch(
    () => page.props.flash.success,
    (success) => {
      if (success) toast.success(success)
    },
    { immediate: true }
  )
}
