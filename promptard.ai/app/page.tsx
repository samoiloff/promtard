import { PromptComposer } from "@/components/home/prompt-composer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 sm:py-16">
      <PromptComposer />
    </div>
  );
}
