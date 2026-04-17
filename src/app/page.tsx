export const dynamic = "force-dynamic";
export const revalidate = 0;

import EntranceHero from "@/components/sections/entrance-hero";
import EnvironmentPage from "@/components/sections/environment-page";
import LayoutGroupWrapper from "@/components/layout-group-wrapper";
import { getInitialImages } from "@/lib/data";

export default async function Home() {
  const images = await getInitialImages();
  const imagesTyped = images as Record<string, { url: string, type: 'image' | 'video' }>;

  // Entrance images are stored in Firestore site_images (managed via admin panel)
  const fitnessImg       = imagesTyped["entrance_fitness"]?.url  || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop";
  const spaImg           = imagesTyped["entrance_spa"]?.url      || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1400&auto=format&fit=crop";
  const fitnessMediaType = imagesTyped["entrance_fitness"]?.type || 'image';
  const spaMediaType     = imagesTyped["entrance_spa"]?.type     || 'image';

  return (
    <LayoutGroupWrapper>
      <div className="flex min-h-screen flex-col bg-background">
        <EntranceHero fitnessImg={fitnessImg} spaImg={spaImg} fitnessMediaType={fitnessMediaType} spaMediaType={spaMediaType} />
        <main className="flex-1">
            <EnvironmentPage initialImages={imagesTyped} />
        </main>
      </div>
    </LayoutGroupWrapper>
  );
}
