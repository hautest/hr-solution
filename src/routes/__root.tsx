import { HeadContent, Scripts, createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { Building, User, LogOut } from "lucide-react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "라프텔 근태 관리 시스템",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <>
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="font-bold text-xl text-blue-600">
                라프텔 근태관리
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  activeProps={{ className: "text-blue-600 font-medium" }}
                >
                  <Building className="h-4 w-4" />
                  <span>회사 현황</span>
                </Link>
                <Link 
                  to="/employee/$id" params={{ id: "1" }} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  activeProps={{ className: "text-blue-600 font-medium" }}
                >
                  <User className="h-4 w-4" />
                  <span>내 개인 페이지</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                김개발님 (개발팀)
              </div>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50">
        {children}
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
