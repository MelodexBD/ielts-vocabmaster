import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const FREE_BOOK = 10;

// Book 10 is the free book: all four of its tests are open to everyone, logged in or not, on every
// screen size. Every other book needs premium (or admin).
// Guests are asked to create an account first; logged-in free users see the premium plans.
export default function useBookAccess() {
  const { isLoggedIn, hasFullAccess } = useAuth();
  const { openPricing, openAuthPrompt } = useUI();

  const canOpenBook = bookNumber => hasFullAccess || bookNumber === FREE_BOOK;
  const canOpenTest = bookNumber => canOpenBook(bookNumber);
  const showLockedPrompt = () => (isLoggedIn ? openPricing() : openAuthPrompt());

  return { canOpenBook, canOpenTest, showLockedPrompt, hasFullAccess };
}
