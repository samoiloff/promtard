import Link from "next/link";

import { LinkedInIcon } from "@/components/icons/linkedin-icon";

const LINKEDIN_URL = "https://www.linkedin.com/in/damir-ismailov-2746115/";

export function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-lg font-semibold tracking-tight">
          About promtard.com
        </h1>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              promtard.com
            </strong>{" "}
            is a prompt board for discovering, saving, and running reusable
            prompt templates. Instead of copying the same long prompt every
            time, you keep the structure once and fill in only what changes.
          </p>
          <p>
            Templates support parameters such as{" "}
            <code className="text-xs text-zinc-700 dark:text-zinc-300">
              ${"{"}topic{"}"}
            </code>{" "}
            in the body. Use <strong className="font-medium">Run</strong> on a
            template card to open the home composer with fields for each
            parameter, then send the filled prompt to chat. Browse recent and
            popular public templates, search by tags, save your own, and like
            templates you want to find again.
          </p>
          <p>
            Signed-in users can keep prompt history, manage personal templates,
            and fork public prompts into editable copies.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Models
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Chat runs on fast models served through{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            Groq
          </strong>
          , tuned for low latency so you can iterate quickly. Pick a model in
          the composer: a larger default for everyday quality, or a lighter
          option when you want the fastest drafts and short replies.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Contact
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Questions or feedback? Reach out on LinkedIn.
        </p>
        <Link
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <LinkedInIcon />
          Damir Ismailov
        </Link>
      </section>
    </div>
  );
}
