import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const FREE_BOOK = 10;

// Cambridge 10 is the free book: guests can open Test 1, and anyone with a free account gets all
// four of its tests. Every other book needs premium (or admin).
// Guests are asked to create an account first; logged-in free users see the premium plans.
export default function useBookAccess() {
  const { isLoggedIn, hasFullAccess } = useAuth();
  const { openPricing, openAuthPrompt } = useUI();

  const canOpenBook = bookNumber => hasFullAccess || bookNumber === FREE_BOOK;
  const canOpenTest = (bookNumber, test) => hasFullAccess || (bookNumber === FREE_BOOK && (isLoggedIn || test === 'T1'));
  const showLockedPrompt = () => (isLoggedIn ? openPricing() : openAuthPrompt());

  return { canOpenBook, canOpenTest, showLockedPrompt, hasFullAccess };
}
