import { Link } from "react-router-dom";
import { useCategories } from '../context/CategoryContext';

const Footer = () => {
  const { categories, loading } = useCategories();

  return (
    <footer className="bg-black text-white py-12 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sobre Nós</h3>
            <p className="text-gray-400 mb-4">
              VICHY Laboratories é uma marca de dermocosméticos dedicada a oferecer produtos de alta qualidade para cuidados com a pele, desenvolvidos com água termal e ingredientes ativos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondaryBrown">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-secondaryBrown">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-secondaryBrown">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondaryBrown">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Categories</h3>
            <ul className="space-y-2">
              {loading ? (
                <li className="text-gray-400">Carregando...</li>
              ) : (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/shop/${category.slug}`}
                      className="text-gray-400 hover:text-secondaryBrown"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Follow us on:</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-secondaryBrown"
                >
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} VICHY Laboratories. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
