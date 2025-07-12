import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotebookView from './components/NotebookView';
import NotebookList from './components/NotebookList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <NotebookList />
        <NotebookView />
      </div>
    </QueryClientProvider>
  );
}
export default App;
