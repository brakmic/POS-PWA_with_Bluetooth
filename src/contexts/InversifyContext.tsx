import React, { createContext } from 'react';
import { Container } from 'inversify';
import { appContainer } from '../services/inversify/container';

// Create the context with the container
export const InversifyContext = createContext<Container>(appContainer);

// Create a provider component
interface InversifyProviderProps {
  container?: Container;
  children: React.ReactNode;
}

export const InversifyProvider: React.FC<InversifyProviderProps> = ({
  container = appContainer,
  children,
}) => {
  return <InversifyContext.Provider value={container}>{children}</InversifyContext.Provider>;
};
