import AdminHeader from "@/components/admin/Header";
import AdminSideBar from "@/components/admin/SideBar";
import {Be_Vietnam_Pro} from "next/font/google";
import './admin_style.css';
const beVietNam = Be_Vietnam_Pro({
    subsets:['latin','vietnamese'],
    weight:['400','500','600','700','800','900'],
    display:'swap'

});
export default function AdminLayout({children}) {
  return (
    <div className={`bg-gray-100 text-gray-800 ${beVietNam.className}`}>

<div className="flex h-screen overflow-hidden">

<AdminSideBar/>

  {/* <!-- ===== MAIN ===== --> */}
  <div className="flex-1 flex flex-col overflow-hidden text-gray-800 ">

 <AdminHeader/>  

    {/* <!-- Content --> */}
    <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
    {children}


    </main>
  </div>
</div>

</div>

    
    
  );
}