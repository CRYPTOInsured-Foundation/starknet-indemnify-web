// stores/use-insurance-product-slice.ts
import { StateCreator } from "zustand";
import { getCookie, InsuranceProduct } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

export interface InsuranceProductSlice {
  // State
  insuranceProducts: InsuranceProduct[];
  featuredProducts: InsuranceProduct[];
  selectedProduct: InsuranceProduct | null;
  isLoadingProduct: boolean;
  productError: string | null;
  hasLoaded: boolean;

  // Actions
  setProducts: (products: InsuranceProduct[]) => void;
  setSelectedProduct: (product: InsuranceProduct | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchProducts: () => Promise<any>;
  fetchProductById: (id: string) => Promise<any>;
  fetchProductByCode: (code: string) => Promise<any>;
  initializeProducts: () => Promise<any>;

  // Utility Actions
  clearError: () => void;
  clearSelectedProduct: () => void;

  // Selectors
  getActiveProducts: () => InsuranceProduct[];
  getProductsByCategory: (category: string) => InsuranceProduct[];
  getProductByCode: (code: string) => InsuranceProduct | undefined;
}

export const createInsuranceProductSlice: StateCreator<InsuranceProductSlice> = (set, get) => ({
  // Initial State
  insuranceProducts: [],
  featuredProducts: [],
  selectedProduct: null,
  isLoadingProduct: false,
  productError: null,
  hasLoaded: false,

  // Mutators
  setProducts: (products) =>
    set({
      insuranceProducts: products,
      featuredProducts: products.filter(p => p.isActive).slice(0, 3),
      hasLoaded: true,
    }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (loading) => set({ isLoadingProduct: loading }),
  setError: (error) => set({ productError: error }),

  // --- API Actions ---
  
  fetchProducts: async () => {
    try {
      console.log("Starting fetch...");
      const csrfToken = await getCookie();
      const res = await fetch(`${API_CONFIG.baseUrl}/insurance-products`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });
  
      console.log("Response status:", res.status);
      const products = await res.json();
      console.log("Fetched products:", products);
  
      set({ insuranceProducts: products.data.data });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  },
  

  fetchProductById: async (id: string): Promise<{ success: boolean; product?: InsuranceProduct }> => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProduct: true, productError: null });
  
      const res = await fetch(`${API_CONFIG.baseUrl}/insurance-products/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });
  
      if (!res.ok) throw new Error(`Failed to fetch product: ${res.statusText}`);

      const result = await res.json()
  
      const product: InsuranceProduct = result?.data.data;
  
      set({
        selectedProduct: product,
        isLoadingProduct: false,
        productError: null,
      });
  
      return { success: true, product };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch product";
  
      set({
        productError: message,
        isLoadingProduct: false,
      });
  
      return { success: false };
    }
  },
  
  fetchProductByCode: async (code: string): Promise<{ success: boolean; product?: InsuranceProduct }> => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProduct: true, productError: null });
  
      const res = await fetch(`${API_CONFIG.baseUrl}/insurance-products/code/${code}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });
  
      // ✅ Handle failed response gracefully
      if (!res.ok) {
        // Fallback to local cache if available
        const localProduct = get().insuranceProducts.find(
          (p) => p.productCode === code
        );
        if (localProduct) {
          set({
            selectedProduct: localProduct,
            isLoadingProduct: false,
            productError: null,
          });
          return { success: true, product: localProduct };
        }
  
        throw new Error(`Product with code ${code} not found`);
      }
  
      const product: InsuranceProduct = await res.json();
  
      set({
        selectedProduct: product,
        isLoadingProduct: false,
        productError: null,
      });
  
      return { success: true, product };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch product";
  
      set({
        productError: message,
        isLoadingProduct: false,
      });
  
      return { success: false };
    }
  },
  

  // Initialize products on app load (auto-run once)
  initializeProducts: async () => {
    const { hasLoaded, isLoadingProduct, fetchProducts } = get();
    if (!hasLoaded && !isLoadingProduct) {
      await fetchProducts();
    }
  },

  // Utility Actions
  clearError: () => set({ productError: null }),
  clearSelectedProduct: () => set({ selectedProduct: null }),

  // Selectors
  getActiveProducts: () => get().insuranceProducts.filter((p) => p.isActive),
  getProductsByCategory: (category) =>
    get().insuranceProducts.filter(
      (p) => p.isActive && p.subjectMatter.toLowerCase().includes(category.toLowerCase())
    ),
  getProductByCode: (code) => get().insuranceProducts.find((p) => p.productCode === code),
});

