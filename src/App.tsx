import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  return (
    <>
      {isLoggedIn ? (
        <DashboardPage userEmail={userEmail} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={(email) => {
          setUserEmail(email);
          setIsLoggedIn(true);
        }} />
      )}
    </>
  );
}
