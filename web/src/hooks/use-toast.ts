type ToastOptions = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  function toast(options: ToastOptions) {
    // mock: แสดง alert ธรรมดา
    alert(`${options.title}\n${options.description ?? ""}`)
  }
  return { toast }
} 