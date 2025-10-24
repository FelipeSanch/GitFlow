export default function Login() {
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">GitFlow AI Analytics</h1>
        <p className="text-slate-400 mb-8 text-center">
          Sign in with GitHub to analyze your repositories and predict merge conflicts
        </p>
        <button
          onClick={handleGitHubLogin}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
