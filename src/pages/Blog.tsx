
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Book, Dumbbell } from "lucide-react";

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Safety Resources & Articles</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <Shield className="w-6 h-6 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Self Defense Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Learn essential self-defense techniques and strategies for staying safe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Book className="w-6 h-6 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Educational Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access comprehensive guides and educational materials about personal safety.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Dumbbell className="w-6 h-6 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Training Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Discover training programs and workshops for self-defense and safety.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Articles */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Featured Articles</h2>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">
                Essential Self-Defense Moves Every Woman Should Know
              </h3>
              <p className="text-gray-600 mb-4">
                Learn the fundamental self-defense techniques that can help you stay safe in various situations...
              </p>
              <div className="text-sm text-gray-500">
                Published on March 8, 2024
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">
                Building Confidence Through Self-Defense Training
              </h3>
              <p className="text-gray-600 mb-4">
                Discover how regular self-defense training can boost your confidence and preparedness...
              </p>
              <div className="text-sm text-gray-500">
                Published on March 6, 2024
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SOSButton />
    </div>
  );
};

export default Blog;
