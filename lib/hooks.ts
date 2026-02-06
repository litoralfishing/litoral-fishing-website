import useSWR from "swr"
import type { Product, SiteSettings } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching data.")
    throw error
  }
  return res.json()
}

export function useProducts(showHidden = false) {
  const url = showHidden ? "/api/products?showHidden=true" : "/api/products"
  const { data, error, isLoading, mutate } = useSWR<Product[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  })

  return {
    products: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<SiteSettings>(
    "/api/settings",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 2,
    }
  )

  return {
    settings: data ?? { logoUrl: "", whatsappNumber: "" },
    isLoading,
    isError: !!error,
    mutate,
  }
}
