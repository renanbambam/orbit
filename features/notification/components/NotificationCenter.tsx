"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import type { NotificationEntry } from "@/features/notification/queries/get-notifications";
import { markNotificationRead } from "@/features/notification/actions/mark-read.action";
import { markAllNotificationsRead } from "@/features/notification/actions/mark-all-read.action";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function taskHref(notification: NotificationEntry) {
  if (!notification.task) return null;
  const { project, number } = notification.task;
  return `/${project.workspace.slug}/${project.identifier}/${number}`;
}

export function NotificationCenter({
  notifications,
  unreadCount,
}: {
  notifications: NotificationEntry[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleOpen(notification: NotificationEntry) {
    const href = taskHref(notification);
    startTransition(async () => {
      if (!notification.readAt) {
        await markNotificationRead({ notificationId: notification.id });
      }
      if (href) {
        router.push(href);
      } else {
        router.refresh();
      }
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:bg-gray-800 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleMarkAll}
              disabled={isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const href = taskHref(notification);
              const content = (
                <div
                  className={cn(
                    "flex gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted",
                    !notification.readAt && "bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      notification.readAt ? "bg-transparent" : "bg-indigo-500",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{notification.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={notification.id}>
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => {
                        if (!notification.readAt) {
                          startTransition(async () => {
                            await markNotificationRead({ notificationId: notification.id });
                          });
                        }
                      }}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpen(notification)}
                      disabled={isPending}
                      className="block w-full"
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
