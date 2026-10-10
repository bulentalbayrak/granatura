"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/components/navigation';

const ProfileInfo = () => {
  const router = useRouter();
  const session = { user: { name: "Admin", email: "admin@granatura.com", image: "/images/avatar/avatar-1.jpg" } };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="flex items-center gap-3 text-default-800">
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="text-sm font-medium capitalize lg:block hidden">
              {session.user.name}
            </div>
            <span className="text-base me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down" />
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-default-800 capitalize">
                {session.user.name}
              </div>
              <div className="text-xs text-default-600">
                {session.user.email}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >
            <Icon icon="heroicons:power" className="w-4 h-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;