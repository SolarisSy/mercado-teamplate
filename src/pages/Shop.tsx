import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;

  return category;
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  
  return (
    <div className="max-w-screen-2xl mx-auto pt-10">
      <ShopBanner category={category} />
      <ShopPageContent category={category} page={page} />
    </div>
  );
};

export default Shop;
