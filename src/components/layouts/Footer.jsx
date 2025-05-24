import React from 'react';
import { Link } from 'react-router-dom';
// import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
       
    <footer class="bg-gray-900 text-white pt-12 pb-6">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">EcoShop</h3>
                    <p class="text-gray-400 mb-4">Your one-stop shop for all your needs.</p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-pinterest"></i></a>
                    </div>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Shop</h4>
                    <ul class="space-y-2">
                        <li><a href="category.html" class="text-gray-400 hover:text-white">Electronics</a></li>
                        <li><a href="category.html" class="text-gray-400 hover:text-white">Fashion</a></li>
                        <li><a href="category.html" class="text-gray-400 hover:text-white">Home & Garden</a></li>
                        <li><a href="category.html" class="text-gray-400 hover:text-white">Sports</a></li>
                        <li><a href="category.html" class="text-gray-400 hover:text-white">Beauty</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Customer Service</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white">Contact Us</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">FAQs</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">Shipping & Returns</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">Track Order</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Contact</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><i class="fas fa-map-marker-alt mr-2"></i> 123 Main St, City, Country</li>
                        <li><i class="fas fa-phone mr-2"></i> +1 234 567 890</li>
                        <li><i class="fas fa-envelope mr-2"></i> info@ecoshop.com</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-400 text-sm">&copy; 2023 EcoShop. All rights reserved.</p>
                <div class="mt-4 md:mt-0">
                    <img src="https://via.placeholder.com/200x30" alt="Payment Methods" class="h-6" />
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
