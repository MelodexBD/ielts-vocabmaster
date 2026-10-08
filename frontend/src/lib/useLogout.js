import { useNavigate } from 'react-router-dom';
import { logOut } from './firebase';

// Asks for confirmation, signs out and returns to the home page.
export default function useLogout() {
  const navigate = useNavigate();
  return async () => {
    const confirmed = await window.notify.confirm('Are you sure you want to log out?', { title: 'Log out', confirmText: 'Log out' });
    if (!confirmed) return;
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed.', error);
      window.notify('Could not log out. Check your internet connection and try again.');
    }
  };
}
