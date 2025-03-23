import { Button } from "@/components/ui/button";



export default function Home() {
  return (
    <div>
      <section className="bg-black text-white w-full h-screen flex justify-center items-center">
        <div className="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg text-center">
          <p className="text-sm text-gray-400">Last Update 1 month ago</p>

          <div className="flex items-center justify-center gap-2 my-3">
            <span className="text-lg">🔒</span>
            <button className="bg-gray-800 px-4 py-1 rounded-lg text-sm flex items-center">
              ⭐ Star Project on GitHub 2,037
            </button>
          </div>

          <h1 className="text-2xl font-bold">Build Forms Faster</h1>
          <p className="text-gray-300 mt-2">
            Create forms with Shadcn, react-hook-form, and Zod within minutes.
          </p>

          <div className="mt-4">
            <Button className="bg-white text-black px-6 py-2 font-medium">
              Go to Playground
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
