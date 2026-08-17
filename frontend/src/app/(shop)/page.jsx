import HotProducts from '@/components/shop/home/HotProducts';
import NewProducts from '@/components/shop/home/NewProducts';
import SaleProducts from '@/components/shop/home/SaleProducts';
import CategoryHome from '@/components/shop/home/CategoryHome';
export default function HomePage() {
  return (
    <>
    
    <CategoryHome />
    <HotProducts limit={4} />
    <NewProducts limit={4} />
    <SaleProducts limit={4} />

    

    </>
  );
}