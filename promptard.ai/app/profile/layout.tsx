import { ProfileAuthGuard } from "@/components/profile/profile-auth-guard";
import { ProfileShell } from "@/components/profile/profile-shell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileAuthGuard>
      <ProfileShell>{children}</ProfileShell>
    </ProfileAuthGuard>
  );
}
