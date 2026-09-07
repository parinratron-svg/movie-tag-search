import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AvatarUploader from "./AvatarUploader";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#0F1115] px-6 py-12 text-[#F5F1E8] sm:px-10">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-2xl">โปรไฟล์ของฉัน</h1>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <AvatarUploader name={user.name} currentAvatarUrl={user.avatarUrl} />

          <div className="mt-6 space-y-3 text-sm">
            <div>
              <p className="text-white/50">ชื่อ</p>
              <p className="mt-0.5">{user.name}</p>
            </div>
            <div>
              <p className="text-white/50">อีเมล</p>
              <p className="mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}