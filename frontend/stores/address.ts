import { create } from 'zustand';

interface AddressStore {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  address: null,
  setAddress: (address) => set({ address }),
}));