import { redirect } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Talk
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Practice languages in real-time with native speakers and AI
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Practice Room</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Join conversation rooms with other learners to practice speaking in real-time.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Teacher Rooms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Teachers can create dedicated rooms for their students with progress tracking.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">AI Practice</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Practice with AI that provides real-time feedback on your language skills.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Professional Sessions</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized guidance from verified language professionals in 1-on-1 sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
