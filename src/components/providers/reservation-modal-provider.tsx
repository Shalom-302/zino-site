"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ReservationModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ReservationModalContext = createContext<ReservationModalContextType | undefined>(
  undefined
);

export const ReservationModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ReservationModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ReservationModalContext.Provider>
  );
};

export const useReservationModal = () => {
  const context = useContext(ReservationModalContext);
  if (context === undefined) {
    throw new Error("useReservationModal must be used within a ReservationModalProvider");
  }
  return context;
};
