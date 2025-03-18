import React from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcAmex,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaClock
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Informações do Supermercado */}
          <div>
            <img 
              src="/img/marca_apoio_entrega@2x.png" 
              alt="Apoio Entrega" 
              className="h-12 mb-4 bg-white p-1 rounded"
            />
            <p className="text-gray-300 mb-4">
              Oferecendo qualidade, economia e praticidade para o seu dia a dia. Seu supermercado sempre ao seu alcance!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-green-400">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
          
          {/* Categorias */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">Departamentos</h3>
            <ul className="space-y-2">
              <li><Link to="/shop/hortifruti" className="text-gray-300 hover:text-white">Hortifruti</Link></li>
              <li><Link to="/shop/acougue" className="text-gray-300 hover:text-white">Açougue</Link></li>
              <li><Link to="/shop/padaria" className="text-gray-300 hover:text-white">Padaria</Link></li>
              <li><Link to="/shop/mercearia" className="text-gray-300 hover:text-white">Mercearia</Link></li>
              <li><Link to="/shop/bebidas" className="text-gray-300 hover:text-white">Bebidas</Link></li>
              <li><Link to="/shop/limpeza" className="text-gray-300 hover:text-white">Limpeza</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-white">Ver Todos</Link></li>
            </ul>
          </div>
          
          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">Links Úteis</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">Sobre Nós</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contato</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-white">Perguntas Frequentes</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white">Termos e Condições</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Política de Privacidade</Link></li>
            </ul>
          </div>
          
          {/* Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-green-400 mt-1 mr-2" />
                <span>Av. Brasil, 1500, Centro, Belo Horizonte - MG</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-green-400 mr-2" />
                <span>(31) 3333-4444</span>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-green-400 mr-2" />
                <span>(31) 99999-8888</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-green-400 mr-2" />
                <span>contato@apoioentrega.com.br</span>
              </li>
              <li className="flex items-center">
                <FaClock className="text-green-400 mr-2" />
                <span>Seg - Sáb: 8h às 22h | Dom: 8h às 20h</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-8 border-gray-700" />
        
        {/* Formas de Pagamento */}
        <div className="mb-6">
          <h3 className="text-center text-lg font-bold mb-4 text-green-400">Formas de Pagamento</h3>
          <div className="flex justify-center space-x-4">
            <FaCcVisa size={32} className="text-gray-300" />
            <FaCcMastercard size={32} className="text-gray-300" />
            <FaCcAmex size={32} className="text-gray-300" />
            <img src="/img/pix-icon.png" alt="PIX" className="h-8" />
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>© {currentYear} Apoio Entrega Supermercados. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
