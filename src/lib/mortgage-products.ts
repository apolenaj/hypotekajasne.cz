/**
 * Client fetch published mortgage products (stale-safe).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rowToProduct } from "@/lib/mortgage-pipeline/hash";
import type { MortgageProduct } from "@/lib/mortgage-pipeline/types";

export async function fetchMortgageProducts(): Promise<MortgageProduct[]> {
  try {
    const { data, error } = await supabase
      .from("mortgage_products")
      .select("*")
      .order("lender", { ascending: true });

    if (error || !data) {
      console.error("mortgage_products fetch:", error?.message);
      return [];
    }
    return data.map((row) => rowToProduct(row));
  } catch (err) {
    console.error("mortgage_products fetch error:", err);
    return [];
  }
}

export function useMortgageProducts() {
  const [products, setProducts] = useState<MortgageProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMortgageProducts().then((rows) => {
      if (!cancelled) {
        setProducts(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}
