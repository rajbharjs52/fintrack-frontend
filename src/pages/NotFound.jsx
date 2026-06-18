// NotFound.jsx
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
    <p className="text-6xl mb-4">404</p>
    <p className="text-lg">Page not found</p>
    <a href="/dashboard" className="mt-4 text-indigo-600 hover:underline text-sm">Go to Dashboard</a>
  </div>
);
export default NotFound;