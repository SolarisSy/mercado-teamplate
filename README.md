<h1>Fashion eCommerce Shop in React.js, TypeScript and JSON server</h1>

<p>Fashion eCommerce template is a custom <b>fashion theme</b> completely designed and created from the ground up. The theme is designed in Figma by following foundational web design practices. <b>The fashion website template</b> was created using React.js best practices and techniques. The fashion website template is mainly a luxury fashion template for women, but it can also be used for men and kids. The fashion website template can also be used for any React eCommerce template or clothing eCommerce website. You can download it for free and test it yourself.</p>
<p>The following technologies were used in design and development:</p>
<ul>
  <li><p>Figma - The leading collaborative design tool for building meaningful products.</p></li>
  <li><p>React.js - Free and open-source front-end JavaScript library for building user interfaces based on components by Facebook Inc.</p></li>
  <li><p>TypeScript - Free and open-source high-level programming language developed by Microsoft that adds static typing with optional type annotations to JavaScript.</p></li>
  <li><p>JSON server - A lightweight and easy-to-use Node.js tool that simulates a RESTful API using a JSON file as the data source</p></li>
  <li><p>Redux Toolkit - The official, opinionated, batteries-included toolset for efficient Redux development</p></li>
  <li><p>Axios - Promise-based HTTP client for the browser and Node.js.</p></li>
  <li><p>React Router - A popular library for routing in React applications</p></li>
  <li><p>TailwindCSS - Utility-first CSS framework for rapidly building modern websites without ever leaving your HTML</p></li>
  <li><p>React hot toast - Beautiful notifications for React applications</p></li>
  <li><p>Concurrently - Package that allows you to run multiple scripts at the same time</p></li>
</ul>

<h2>Video instructions YouTube tutorial for running the application:</h2>
<a href="https://www.youtube.com/watch?v=M9DHiusoPOI">https://www.youtube.com/watch?v=M9DHiusoPOI</a>

<h2>Instructions - The Fashion Website Template</h2>
<ol>
  <li><p>To run the app you first need to download and install Node.js and npm on your computer. Here is a link to the tutorial that explains how to install them: <a href="https://www.youtube.com/watch?v=4FAtFwKVhn0" target="_blank">https://www.youtube.com/watch?v=4FAtFwKVhn0</a>. Also here is the link where you can download them: <a href="https://nodejs.org/en" target="_blank">https://nodejs.org/en</a></p></li>
  <li><p>When you install all the programs you need on your computer you need to download the project. When you download the project, you need to extract it.</p></li>
  <li><p>After you extract the project, you need to open the project folder in the command prompt or any terminal of choice. After it write the following command:</p></li>
</ol>

```
npm install
```

<p>4. After everything is installed you need to write the following command:</p>

```
npm start
```

<p>5. To run the JSON server separately (if needed), you can use:</p>

```
npm run server
```

<h2>New Features - Admin Panel</h2>

<p>The application now includes a comprehensive admin panel with the following features:</p>

<ul>
  <li><p><b>Secure Authentication</b> - Admin login with protected routes</p></li>
  <li><p><b>Dashboard Overview</b> - View key metrics including total products, orders, and revenue</p></li>
  <li><p><b>Product Management</b> - Add, edit, view, and delete products with advanced features:</p>
    <ul>
      <li>Multiple image upload with primary image selection</li>
      <li>Image compression for optimized storage</li>
      <li>Size and color management</li>
      <li>Detailed product information</li>
    </ul>
  </li>
  <li><p><b>Category Management</b> - Organize products by categories</p></li>
  <li><p><b>User Management</b> - View and manage user accounts</p></li>
  <li><p><b>Responsive Design</b> - Fully responsive admin interface</p></li>
</ul>

<p>To access the admin panel, navigate to <code>/admin/login</code> and use the following credentials:</p>

```
Username: admin
Password: admin123
```

<h2>Project screenshots: </h2>

<h3>Landing page</h3>


![landing page](https://github.com/user-attachments/assets/9e1ef65f-ca21-4615-9820-f8f00204ad85)


<h3>Shop page</h3>


![shop page](https://github.com/user-attachments/assets/e2935c47-9b53-4d26-9221-05451102260c)


<h3>Single product page</h3>


![single product page](https://github.com/user-attachments/assets/815eaa98-150d-4847-9339-5140745c66ba)


<h3>Cart page</h3>

![cart page](https://github.com/user-attachments/assets/164bcf3d-7984-4cc4-8f30-978069737ef6)

<h3>Login page</h3>

![login page](https://github.com/user-attachments/assets/4903e803-9253-4212-be4d-cfa14e010fb3)


<h3>Register page</h3>

![register page](https://github.com/user-attachments/assets/a2c5f5cb-d03f-46c8-b43a-edd3876e3001)

<h3>User profile page</h3>

![user profile page](https://github.com/user-attachments/assets/5786d46b-29a8-44c2-ad52-3a794ce954c9)


<h3>Order history page</h3>

![order history page](https://github.com/user-attachments/assets/57259617-6c4e-4efd-84ad-961ee0a9b9e4)


<h3>Single order history page</h3>

![single order history page](https://github.com/user-attachments/assets/f2abffa8-9af3-478f-a888-ed3fbd007315)

<h3>Checkout page</h3>

![checkout page](https://github.com/user-attachments/assets/0dc47027-1bf7-4b96-bff2-73867d6892a9)


<h3>Search page</h3>

![search page](https://github.com/user-attachments/assets/a62c71be-5424-4bf5-a660-352d507764a5)

<h3>Admin Dashboard</h3>

![admin dashboard](https://github.com/user-attachments/assets/admin-dashboard.jpg)

<h3>Product Management</h3>

![product management](https://github.com/user-attachments/assets/product-management.jpg)

<h3>Product Form</h3>

![product form](https://github.com/user-attachments/assets/product-form.jpg)

<h2>Technical Implementation Details</h2>

<h3>Image Handling</h3>

<p>The application implements a sophisticated image handling system:</p>

<ul>
  <li><p><b>Client-side Compression</b> - Images are compressed before upload to reduce storage requirements and improve performance</p></li>
  <li><p><b>Multiple Image Support</b> - Products can have multiple images with one designated as primary</p></li>
  <li><p><b>Fallback Mechanism</b> - Placeholder images are displayed when product images fail to load</p></li>
</ul>

<h3>Data Management</h3>

<p>The application uses JSON Server as a backend with the following data structure:</p>

<ul>
  <li><p><b>Products</b> - Complete product information including images, sizes, colors, and inventory</p></li>
  <li><p><b>Categories</b> - Product categorization</p></li>
  <li><p><b>Orders</b> - Customer order information</p></li>
  <li><p><b>Users</b> - User account data</p></li>
</ul>

<h3>Authentication</h3>

<p>The application implements two separate authentication systems:</p>

<ul>
  <li><p><b>Customer Authentication</b> - For regular users to access their accounts and place orders</p></li>
  <li><p><b>Admin Authentication</b> - Secure access to the admin panel with protected routes</p></li>
</ul>

<h2>Future Enhancements</h2>

<ul>
  <li><p>Order management in admin panel</p></li>
  <li><p>Advanced analytics and reporting</p></li>
  <li><p>Integration with payment gateways</p></li>
  <li><p>Enhanced product filtering and search</p></li>
</ul>
