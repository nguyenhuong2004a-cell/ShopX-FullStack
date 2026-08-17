import Menu from "@/components/shop/Menu";
import Header from "../../components/shop/Header"
import Footer from "../../components/shop/Footer"
export default function ShopLayout({children}){
    return(
        <div>
            <Header/>
            <Menu />
            <main>{children}</main>
            <Footer/>
        </div>
    );
}