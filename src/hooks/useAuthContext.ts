import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Something Went Wrong');
  return context;
};

export default useAuthContext;
