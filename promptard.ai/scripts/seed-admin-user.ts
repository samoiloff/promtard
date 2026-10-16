import { config } from "dotenv";

config({ path: ".env.local" });

import { ensureSystemAdminUser } from "../lib/admin/ensure-system-user";

async function main() {
  const id = await ensureSystemAdminUser();
  console.log(`System admin user ready: ${id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
