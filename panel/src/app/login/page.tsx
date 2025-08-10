export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">Login</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <button type="submit" className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Sign in</button>
        </form>
      </div>
    </main>
  );
}
