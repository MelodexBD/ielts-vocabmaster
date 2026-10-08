import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

// Cambridge 10 · Test 1 is free; everything else needs premium (or admin).
// Guests are asked to log in first; logged-in free users see the premium plans.
export default function useBookAccess() {
  const { isLoggedIn, hasFullAccess } = useAuth();
  const { openPricing, openAuthPrompt } = useUI();

  const canOpenBook = bookNumber => hasFullAccess || bookNumber === 10;
  const canOpenTest = (bookNumber, test) => hasFullAccess || (bookNumber === 10 && test === 'T1');
  const showLockedPrompt = () => (isLoggedIn ? openPricing() : openAuthPrompt());

  return { canOpenBook, canOpenTest, showLockedPrompt, hasFullAccess };
}
