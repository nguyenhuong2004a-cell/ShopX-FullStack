import { adminMenu } from "@/data/adminMenu";
import Link from "next/link";

export default function AdminSideBar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 flex flex-col">
      {/* <!-- Logo --> */}
      <div className="px-6 py-5 border-b border-gray-700/50">
        <span className="text-xl font-bold text-white">
          Shop<span className="text-blue-500">X</span>
          <span className="text-gray-400 font-normal text-sm ml-1">Admin</span>
        </span>
      </div>

      {/* <!-- Nav --> */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <ul className="space-y-1">
          {adminMenu.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                {/* Render icon nếu trong file adminMenu có chứa component icon */}
                {item.icon && <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* <!-- Footer --> */}
      <div className="px-6 py-4 border-t border-gray-700/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold">N</div>
        <span className="text-gray-400 text-xs">© 2026 ShopX</span>
      </div>
    </aside>
  );
}