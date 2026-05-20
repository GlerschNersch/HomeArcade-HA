import { useState, useMemo, Fragment } from 'react'
import { Link, useLocation } from "wouter";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  HomeIcon,
  HeartIcon,
  ClockIcon,
  Squares2X2Icon,
  FolderIcon,
  TrophyIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { SYSTEMS, GAMES } from "@/data/library";
import { filterToPath, filterKey, type Filter } from "@/lib/filter";
import { useQuery } from "@tanstack/react-query";
import type { GameCollectionWithItems, UploadedRom, UserProfile } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Wordmark } from "@/components/Logo";
import { useProfile } from "@/lib/useProfile";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [location] = useLocation();
  const { t } = useTranslation();
  const { currentProfileId, setCurrentProfileId } = useProfile();

  const { data: kiosk } = useQuery<{ enabled: boolean }>({ queryKey: ["/api/kiosk"] });
  const kioskMode = !!kiosk?.enabled;
  const { data: uploadedRoms = [] } = useQuery<UploadedRom[]>({ queryKey: ["/api/roms"] });
  const { data: profiles = [] } = useQuery<UserProfile[]>({ queryKey: ["/api/profiles"] });
  const activeProfile = profiles.find((p) => p.id === currentProfileId);

  const activeKey = useMemo((): string | null => {
    if (location === "/") return "dashboard";
    if (location.startsWith("/settings")) return "settings";
    if (location.startsWith("/history")) return "history";
    if (location.startsWith("/achievements")) return "achievements";
    if (location.startsWith("/library/collection/")) return `collection:${location.split("/").pop()}`;
    if (location.startsWith("/library/status/")) return `status:${location.split("/").pop()}`;
    if (location.startsWith("/library/")) {
      const segment = location.slice("/library/".length);
      // Try parsing it as a system ID first
      const sysId = SYSTEMS.find(s => s.id === segment || s.slug === segment)?.id;
      if (sysId) return `system:${sysId}`;
      return segment;
    }
    return null;
  }, [location]);

  const isActive = (filter: Filter): boolean => filterKey(filter) === activeKey;

  const favCount = GAMES.filter((g) => g.favorite).length + uploadedRoms.filter((r) => r.favorite).length;
  const recentCount = GAMES.filter((g) => g.lastPlayed && g.lastPlayed > 0).length + uploadedRoms.filter((r) => r.lastPlayed && r.lastPlayed > 0).length;
  const allCount = GAMES.length + uploadedRoms.length;

  const navigation = [
    { name: t("nav.dashboard"), href: "/", icon: HomeIcon, current: activeKey === "dashboard" },
    { name: t("home.sections.favorites"), href: filterToPath({ type: "favorites" }), icon: HeartIcon, count: favCount, current: isActive({ type: "favorites" }) },
    { name: t("home.sections.recentlyPlayed"), href: filterToPath({ type: "recent" }), icon: ClockIcon, count: recentCount, current: isActive({ type: "recent" }) },
    { name: t("home.sections.allGames"), href: filterToPath({ type: "all" }), icon: Squares2X2Icon, count: allCount, current: isActive({ type: "all" }) },
  ];

  const systemNavigation = SYSTEMS.map((s) => ({
    id: s.id,
    name: s.shortName,
    href: filterToPath({ type: "system", value: s.id }),
    art: s.art,
    current: isActive({ type: "system", value: s.id }),
    count: GAMES.filter((g) => g.system === s.id).length + uploadedRoms.filter((r) => r.system === s.id).length,
  }));

  const secondaryNavigation = [
    { name: t("history.title"), href: "/history", icon: ClockIcon, current: activeKey === "history" },
    { name: t("achievements.title"), href: "/achievements", icon: TrophyIcon, current: activeKey === "achievements" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <Wordmark />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={classNames(
                                  item.current
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                )}
                              >
                                <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                {item.name}
                                {item.count !== undefined && (
                                  <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-white ring-1 ring-inset ring-gray-700">
                                    {item.count}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      {!kioskMode && (
                        <li>
                          <div className="text-xs/6 font-semibold text-gray-400">{t("dashboard.sections.browseSystems")}</div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {systemNavigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={classNames(
                                    item.current
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                    'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                  )}
                                >
                                  <span
                                    className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                                    style={{ background: `linear-gradient(135deg, hsl(${item.art[0]}), hsl(${item.art[1]}))` }}
                                  >
                                    {item.name.substring(0, 2).toUpperCase()}
                                  </span>
                                  <span className="truncate">{item.name}</span>
                                  <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-white ring-1 ring-inset ring-gray-700">
                                    {item.count}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                      <li className="mt-auto">
                        <ul role="list" className="-mx-2 space-y-1">
                          {secondaryNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={classNames(
                                  item.current
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                )}
                              >
                                <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href="/settings"
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                activeKey === "settings"
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <Cog6ToothIcon aria-hidden="true" className="size-6 shrink-0" />
                              {t("settings.title")}
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Wordmark />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                        )}
                      >
                        <item.icon aria-hidden="true" className="size-6 shrink-0" />
                        {item.name}
                        {item.count !== undefined && (
                          <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-white ring-1 ring-inset ring-gray-700">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {!kioskMode && (
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">{t("dashboard.sections.browseSystems")}</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {systemNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                          )}
                        >
                          <span
                            className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                            style={{ background: `linear-gradient(135deg, hsl(${item.art[0]}), hsl(${item.art[1]}))` }}
                          >
                            {item.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate">{item.name}</span>
                          <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-white ring-1 ring-inset ring-gray-700">
                            {item.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                        )}
                      >
                        <item.icon aria-hidden="true" className="size-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/settings"
                      className={classNames(
                        activeKey === "settings"
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                      )}
                    >
                      <Cog6ToothIcon aria-hidden="true" className="size-6 shrink-0" />
                      {t("settings.title")}
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>

          {/* Separator */}
          <div aria-hidden="true" className="h-6 w-px bg-white/10 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
              />
              <input
                id="search-field"
                name="search"
                type="search"
                placeholder={t("home.searchPlaceholder") || "Search games..."}
                className="block size-full border-0 py-0 pl-8 pr-0 bg-transparent text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300">
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
              </button>

              {/* Separator */}
              <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" />

              {/* Profile dropdown */}
              <Menu className="relative">
                <MenuButton className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <span 
                    className="size-8 rounded-full ring-2 ring-white/10"
                    style={{ background: activeProfile?.color || '#94a3b8' }}
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-white">
                      {activeProfile?.name || 'Guest'}
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400" />
                  </span>
                </MenuButton>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-white/10 focus:outline-none">
                    {profiles.map((p) => (
                      <MenuItem key={p.id}>
                        {({ active }: { active: boolean }) => (
                          <button
                            onClick={() => setCurrentProfileId(p.id)}
                            className={classNames(
                              active ? 'bg-gray-700' : '',
                              'flex w-full items-center gap-x-3 px-3 py-1 text-sm leading-6 text-white'
                            )}
                          >
                            <span className="size-2 rounded-full" style={{ background: p.color }} />
                            {p.name}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                    <div className="my-1 h-px bg-white/5" />
                    <MenuItem>
                      {({ active }: { active: boolean }) => (
                        <Link
                          href="/settings"
                          className={classNames(
                            active ? 'bg-gray-700' : '',
                            'block px-3 py-1 text-sm leading-6 text-white'
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
