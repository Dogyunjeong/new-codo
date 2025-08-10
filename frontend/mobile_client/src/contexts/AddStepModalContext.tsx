import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AddStepModalContextType {
  isModalVisible: boolean
  showModal: () => void
  hideModal: () => void
}

const AddStepModalContext = createContext<AddStepModalContextType | undefined>(undefined)

export const useAddStepModal = () => {
  const context = useContext(AddStepModalContext)
  if (!context) {
    throw new Error('useAddStepModal must be used within AddStepModalProvider')
  }
  return context
}

interface AddStepModalProviderProps {
  children: ReactNode
}

export const AddStepModalProvider: React.FC<AddStepModalProviderProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)
  const hideModal = () => setIsModalVisible(false)

  return (
    <AddStepModalContext.Provider value={{ isModalVisible, showModal, hideModal }}>
      {children}
    </AddStepModalContext.Provider>
  )
}