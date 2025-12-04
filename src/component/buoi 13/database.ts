//file myDatabase.db nằm ở /data/data/com.libraryappsqlite/databases/myDatabase.db
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({
    name: 'myDatabase.db',
    location: 'default',
  });

  // Enable foreign key constraints immediately
  try {
    await db.executeSql('PRAGMA foreign_keys = ON;');
    console.log('✅ Foreign keys enabled');
  } catch (err) {
    console.warn('⚠️ Could not enable foreign_keys pragma:', err);
  }

  return db;
};

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type ProductStat = {
  id: number;
  name: string;
  sold: number;
  revenue: number;
};

export type CategoryPerformance = {
  name: string;
  orders: number;
  revenue: number;
};

export type RevenueSummary = {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  yearRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalUsers: number;
  totalItemsSold: number;
  avgOrderValue: number;
  conversionRate: number;
  averageItemsPerOrder: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
};

export type UserWithStats = User & {
  orderCount: number;
  totalRevenue: number;
  lastOrderAt: string | null;
};

export type OrderWithUser = {
  id: number;
  orderId: string;
  userId: number;
  username: string | null;
  totalPrice: number;
  itemCount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  img: string;
};

const initialCategories: Category[] = [
  { id: 1, name: 'Astray' },
  { id: 2, name: 'Unicorn' },
];
const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Unicorn 2.0',
    price: 250000,
    img: 'Unicorn_gundam_0.2.jpg',
    categoryId: 2,
  },
  {
    id: 2,
    name: 'Astray Gold Frame',
    price: 1100000,
    img: 'Astray_gold.jpg',
    categoryId: 1,
  },
  {
    id: 3,
    name: 'Astray Hirm',
    price: 490000,
    img: 'Astray_hirm.webp',
    categoryId: 1,
  },
  {
    id: 4,
    name: 'Astray noname',
    price: 120000,
    img: 'astray_noname.webp',
    categoryId: 1,
  },
  {
    id: 5,
    name: 'Unicorn Gundam',
    price: 980000,
    img: 'Unicorn_gundam.jpg',
    categoryId: 2,
  },
];
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    database.transaction(
      tx => {
        // Drop and recreate tables to ensure ON DELETE CASCADE is applied
        tx.executeSql('DROP TABLE IF EXISTS products');
        tx.executeSql('DROP TABLE IF EXISTS categories');

        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)',
        );
        initialCategories.forEach(category => {
          tx.executeSql(
            'INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)',
            [category.id, category.name],
          );
        });

        tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          price REAL,
          img TEXT,
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
        )`);

        initialProducts.forEach(product => {
          tx.executeSql(
            'INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
            [
              product.id,
              product.name,
              product.price,
              product.img,
              product.categoryId,
            ],
          );
        });

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              username TEXT UNIQUE, 
              password TEXT, 
              role TEXT
            )`,
          [],
          () => console.log('✅ Users table created'),
          (_, error) => console.error('❌ Error creating users table:', error),
        );

        tx.executeSql(
          `INSERT INTO users (username, password, role) 
            SELECT 'admin', '123456', 'admin' 
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`,
          [],
          () => console.log('✅ Admin user added'),
          (_, error) => console.error('❌ Error inserting admin:', error),
        );

        // Create cart items table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS cart_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER,
              productId INTEGER,
              quantity INTEGER,
              addedAt TEXT,
              FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            )`,
          [],
          () => console.log('✅ Cart table created'),
          (_, error) => console.error('❌ Error creating cart table:', error),
        );

        // Create orders table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS orders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER,
              orderId TEXT UNIQUE,
              totalPrice REAL,
              itemCount INTEGER,
              status TEXT DEFAULT 'pending',
              createdAt TEXT,
              FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )`,
          [],
          () => console.log('✅ Orders table created'),
          (_, error) => console.error('❌ Error creating orders table:', error),
        );

        // Create order items table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS order_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              orderId INTEGER,
              productId INTEGER,
              productName TEXT,
              productImg TEXT,
              quantity INTEGER,
              price REAL,
              FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
              FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
            )`,
          [],
          () => console.log('✅ Order items table created'),
          (_, error) =>
            console.error('❌ Error creating order items table:', error),
        );

        // Create analytics table to track daily revenue
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS analytics (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT UNIQUE,
              totalRevenue REAL DEFAULT 0,
              totalOrders INTEGER DEFAULT 0,
              totalCustomers INTEGER DEFAULT 0,
              updatedAt TEXT
            )`,
          [],
          () => console.log('✅ Analytics table created'),
          (_, error) =>
            console.error('❌ Error creating analytics table:', error),
        );

        // Create product_stats table to track product sales
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS product_stats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              productId INTEGER UNIQUE,
              soldCount INTEGER DEFAULT 0,
              totalRevenue REAL DEFAULT 0,
              updatedAt TEXT,
              FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            )`,
          [],
          () => console.log('✅ Product stats table created'),
          (_, error) =>
            console.error('❌ Error creating product_stats table:', error),
        );
      },
      error => console.error('❌ Transaction error:', error),
      () => {
        // Hàm khi thành công
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess(); // onSuccess là tên biến đại diện cho hàm callback (có thể đặt tên bất kỳ). Nếu biến onSuccess tồn tại (tức là không phải undefined hoặc null), thì hãy gọi hàm đó =>Gọi loadData() ở useEffect() của Sanpham3Sqlite
      },
    );
  } catch (error) {
    console.error('❌ initDatabase outer error:', error);
  }
};

// ➕ Thêm loại sản phẩm
export const addCategory = async (name: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('INSERT INTO categories (name) VALUES (?)', [name]);
    console.log('✅ Category added');
    return true; // Thêm thành công
  } catch (error) {
    console.error('❌ Error adding category:', error);
    return false; // Thêm thất bại
  }
};

// 🔄 Cập nhật loại sản phẩm
export const updateCategory = async (category: Category) => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE categories SET name = ? WHERE id = ?', [
      category.name,
      category.id,
    ]);
    console.log('✅ Category updated');
  } catch (error) {
    console.error('❌ Error updating category:', error);
  }
};

// ❌ Xóa loại sản phẩm theo id
export const deleteCategory = async (
  id: number,
): Promise<{ ok: boolean; error?: string }> => {
  return new Promise(resolve => {
    getDb()
      .then(db => {
        db.transaction(
          tx => {
            // Delete category - products will be deleted automatically via ON DELETE CASCADE
            tx.executeSql(
              'DELETE FROM categories WHERE id = ?',
              [id],
              () => {
                console.log(
                  '✅ Category deleted successfully (products auto-deleted via CASCADE)',
                );
                resolve({ ok: true });
              },
              (_, error) => {
                const msg = `Failed to delete category: ${
                  error?.message || String(error)
                }`;
                console.error('❌ ' + msg);
                resolve({ ok: false, error: msg });
                return false;
              },
            );
          },
          error => {
            const msg = `Transaction failed: ${
              error?.message || String(error)
            }`;
            console.error('❌ ' + msg);
            resolve({ ok: false, error: msg });
          },
          () => {
            console.log('✅ Transaction completed');
          },
        );
      })
      .catch(error => {
        const msg = `Database connection error: ${
          error?.message || String(error)
        }`;
        console.error('❌ ' + msg);
        resolve({ ok: false, error: msg });
      });
  });
};

// 🔍 Lấy danh sách tất cả loại sản phẩm
export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM categories');
    const categories: Category[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      categories.push(rows.item(i));
    }
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

// 🔍 Lấy loại sản phẩm theo id
export const getCategoryById = async (id: number): Promise<Category | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting category by id:', error);
    return null;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const items: Product[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId],
    );
    console.log('✅ Product added');
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
};

export const updateProduct = async (product: Product) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?',
      [
        product.name,
        product.price,
        product.categoryId,
        product.img,
        product.id,
      ],
    );
    console.log('✅ Product updated with image');
  } catch (error) {
    console.error('❌ Error updating product:', error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const database = await getDb();
    await database.executeSql('DELETE FROM products WHERE id = ?', [id]);
    console.log('✅ Product deleted');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
  }
};
//---------------lọc sản phẩm theo loại------
export const fetchProductsByCategory = async (
  categoryId: number,
): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM products WHERE categoryId = ?',
      [categoryId],
    );

    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      products.push(rows.item(i));
    }

    return products;
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    return [];
  }
};

//tìm kiếm sản phẩm theo tên sản phẩm hoặc theo tên loại
export const searchProductsByNameOrCategory = async (
  keyword: string,
): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `
      SELECT products.* FROM products
      JOIN categories ON products.categoryId = categories.id
      WHERE products.name LIKE ? OR categories.name LIKE ?
      `,
      [`%${keyword}%`, `%${keyword}%`],
    );

    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      products.push(rows.item(i));
    }

    return products;
  } catch (error) {
    console.error('❌ Error searching by name or category:', error);
    return [];
  }
};
//------------------crud user-----------------
// ➕ Thêm người dùng
export const addUser = async (
  username: string,
  password: string,
  role: string,
): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role],
    );
    console.log('✅ User added');
    return true; // Thêm thành công
  } catch (error) {
    console.error('❌ Error adding user:', error);
    return false; // Thêm thất bại
  }
};

// 🔄 Cập nhật người dùng
export const updateUser = async (user: User) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
      [user.username, user.password, user.role, user.id],
    );
    console.log('✅ User updated');
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
};

// ❌ Xóa người dùng theo id
export const deleteUser = async (id: number) => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [id]);
    console.log('✅ User deleted');
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
};

// 🔍 Lấy danh sách tất cả người dùng
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users');
    const users: User[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      users.push(rows.item(i));
    }
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

// 🔑 Lấy người dùng theo username & password (dùng cho đăng nhập)
export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
    );
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by credentials:', error);
    return null;
  }
};

// 🔍 Lấy người dùng theo id
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE id = ?', [
      id,
    ]);
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by id:', error);
    return null;
  }
};

// ==================== CART FUNCTIONS ====================
export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number,
) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.executeSql(
      'INSERT INTO cart_items (userId, productId, quantity, addedAt) VALUES (?, ?, ?, ?)',
      [userId, productId, quantity, now],
    );
    console.log('✅ Item added to cart');
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
  }
};

export const getCartItems = async (userId: number) => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT ci.*, p.name, p.price, p.img FROM cart_items ci
       JOIN products p ON ci.productId = p.id
       WHERE ci.userId = ?
       ORDER BY ci.addedAt DESC`,
      [userId],
    );
    const items = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    return [];
  }
};

export const updateCartItem = async (cartItemId: number, quantity: number) => {
  try {
    const db = await getDb();
    if (quantity <= 0) {
      await db.executeSql('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
      console.log('✅ Cart item removed');
    } else {
      await db.executeSql('UPDATE cart_items SET quantity = ? WHERE id = ?', [
        quantity,
        cartItemId,
      ]);
      console.log('✅ Cart item updated');
    }
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
  }
};

export const clearCart = async (userId: number) => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart_items WHERE userId = ?', [userId]);
    console.log('✅ Cart cleared');
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
  }
};

export const clearUserOrders = async (userId: number) => {
  try {
    const db = await getDb();
    // Delete order items first, then orders (due to foreign key)
    await db.executeSql(
      `DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE userId = ?)`,
      [userId],
    );
    await db.executeSql('DELETE FROM orders WHERE userId = ?', [userId]);
    console.log('✅ User orders cleared');
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
  }
};

// ==================== ORDER FUNCTIONS ====================
export const createOrder = async (
  userId: number,
  items: any[],
  totalPrice: number,
  itemCount?: number,
) => {
  try {
    const db = await getDb();
    const externalOrderId = `ORD-${Date.now()}`;
    const now = new Date().toISOString();
    const totalItems =
      itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

    const [previousOrdersResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM orders WHERE userId = ?',
      [userId],
    );
    const previousOrdersCount = Number(
      previousOrdersResult.rows.item(0)?.count ?? 0,
    );
    const isFirstOrder = previousOrdersCount === 0;

    return new Promise(resolve => {
      db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO orders (userId, orderId, totalPrice, itemCount, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, externalOrderId, totalPrice, totalItems, 'pending', now],
            (_, result) => {
              const insertedOrderId = result.insertId;
              const dateKey = now.slice(0, 10);
              const updatedAt = now;

              items.forEach(item => {
                const productId = item.productId ?? item.id;
                if (!productId) return;

                tx.executeSql(
                  `INSERT INTO order_items (orderId, productId, quantity, price)
                   VALUES (?, ?, ?, ?)`,
                  [insertedOrderId, productId, item.quantity, item.price],
                );

                tx.executeSql(
                  `INSERT OR IGNORE INTO product_stats (productId, soldCount, totalRevenue, updatedAt)
                 VALUES (?, 0, 0, ?)`,
                  [productId, updatedAt],
                );
                tx.executeSql(
                  `UPDATE product_stats SET
                   soldCount = soldCount + ?,
                   totalRevenue = totalRevenue + ?,
                   updatedAt = ?
                 WHERE productId = ?`,
                  [
                    item.quantity,
                    item.price * item.quantity,
                    updatedAt,
                    productId,
                  ],
                );
              });

              tx.executeSql(
                `INSERT OR IGNORE INTO analytics (date, totalRevenue, totalOrders, totalCustomers, updatedAt)
                 VALUES (?, 0, 0, 0, ?)`,
                [dateKey, updatedAt],
              );
              tx.executeSql(
                `UPDATE analytics SET
                 totalRevenue = totalRevenue + ?,
                 totalOrders = totalOrders + ?,
                 totalCustomers = totalCustomers + ?,
                 updatedAt = ?
               WHERE date = ?`,
                [totalPrice, 1, isFirstOrder ? 1 : 0, updatedAt, dateKey],
              );
            },
          );
        },
        error => {
          console.error('❌ Order creation failed:', error);
          resolve(null);
        },
        () => {
          console.log('✅ Order created successfully');
          clearCart(userId);
          resolve(externalOrderId);
        },
      );
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return null;
  }
};

export const getOrders = async (userId: number) => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
      [userId],
    );
    const orders = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      orders.push(rows.item(i));
    }
    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};


export const updateOrderStatus = async (
  orderId: number,
  status: 'pending' | 'completed' | 'cancelled',
) => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE orders SET status = ? WHERE id = ?', [
      status,
      orderId,
    ]);
    console.log('✅ Order status updated');
  } catch (error) {
    console.error('❌ Error updating order status:', error);
  }
};

export const getOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const db = await getDb();

    // Query join order_items với products để lấy thông tin sản phẩm
    const [results] = await db.executeSql(
      `SELECT 
         oi.id AS id,
         oi.orderId AS orderId,
         oi.productId AS productId,
         oi.quantity AS quantity,
         oi.price AS price,
         p.name AS name,
         p.img AS img
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [orderId]
    );

    const items: OrderItem[] = [];
    const rows = results.rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      items.push({
        id: row.id,
        orderId: row.orderId,
        productId: row.productId,
        quantity: row.quantity,
        price: row.price,
        name: row.name,
        img: row.img,
      });
    }

    return items;
  } catch (error) {
    console.error('❌ Error fetching order items:', error);
    return [];
  }
};

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const getRevenueSummary = async (): Promise<RevenueSummary> => {
  try {
    const db = await getDb();
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const monthKey = now.toISOString().slice(0, 7);
    const yearKey = now.getFullYear().toString();

    const [todayResult] = await db.executeSql(
      `SELECT COUNT(*) as count, IFNULL(SUM(totalPrice), 0) as sum
       FROM orders
       WHERE strftime('%Y-%m-%d', createdAt) = ?`,
      [todayKey],
    );
    const [monthResult] = await db.executeSql(
      `SELECT COUNT(*) as count, IFNULL(SUM(totalPrice), 0) as sum
       FROM orders
       WHERE strftime('%Y-%m', createdAt) = ?`,
      [monthKey],
    );
    const [yearResult] = await db.executeSql(
      `SELECT COUNT(*) as count, IFNULL(SUM(totalPrice), 0) as sum
       FROM orders
       WHERE strftime('%Y', createdAt) = ?`,
      [yearKey],
    );
    const [totalResult] = await db.executeSql(
      `SELECT COUNT(*) as count, IFNULL(SUM(totalPrice), 0) as sum FROM orders`,
    );
    const [totalCustomersResult] = await db.executeSql(
      `SELECT COUNT(DISTINCT userId) as count FROM orders`,
    );
    const [totalUsersResult] = await db.executeSql(
      `SELECT COUNT(*) as count FROM users`,
    );
    const [totalItemsResult] = await db.executeSql(
      `SELECT IFNULL(SUM(quantity), 0) as totalItems FROM order_items`,
    );
    const [newCustomersResult] = await db.executeSql(
      `
      SELECT COUNT(*) as count FROM (
        SELECT userId, MIN(createdAt) as firstOrder
        FROM orders
        GROUP BY userId
      )
      WHERE strftime('%Y-%m', firstOrder) = ?
      `,
      [monthKey],
    );

    const todayRow = todayResult.rows.item(0);
    const monthRow = monthResult.rows.item(0);
    const yearRow = yearResult.rows.item(0);
    const totalRow = totalResult.rows.item(0);
    const totalCustomersRow = totalCustomersResult.rows.item(0);
    const totalUsersRow = totalUsersResult.rows.item(0);
    const totalItemsRow = totalItemsResult.rows.item(0);
    const newCustomersRow = newCustomersResult.rows.item(0);

    const totalOrders = toNumber(totalRow.count);
    const totalRevenue = toNumber(totalRow.sum);
    const totalCustomers = toNumber(totalCustomersRow.count);
    const totalUsers = toNumber(totalUsersRow.count);
    const totalItemsSold = toNumber(totalItemsRow.totalItems);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageItemsPerOrder =
      totalOrders > 0 ? totalItemsSold / totalOrders : 0;
    const conversionRate =
      totalUsers > 0 ? (totalCustomers / totalUsers) * 100 : 0;

    return {
      todayRevenue: toNumber(todayRow.sum),
      todayOrders: toNumber(todayRow.count),
      monthRevenue: toNumber(monthRow.sum),
      monthOrders: toNumber(monthRow.count),
      yearRevenue: toNumber(yearRow.sum),
      totalOrders,
      totalCustomers,
      totalUsers,
      totalItemsSold,
      avgOrderValue,
      conversionRate,
      averageItemsPerOrder,
      newCustomersThisMonth: toNumber(newCustomersRow.count),
      totalRevenue,
    };
  } catch (error) {
    console.error('❌ Error fetching revenue summary:', error);
    return {
      todayRevenue: 0,
      todayOrders: 0,
      monthRevenue: 0,
      monthOrders: 0,
      yearRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalUsers: 0,
      totalItemsSold: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      averageItemsPerOrder: 0,
      newCustomersThisMonth: 0,
      totalRevenue: 0,
    };
  }
};

export const fetchTopProducts = async (limit = 3): Promise<ProductStat[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT p.id, p.name, IFNULL(SUM(oi.quantity), 0) as sold,
              IFNULL(SUM(oi.price * oi.quantity), 0) as revenue
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       GROUP BY p.id
       ORDER BY sold DESC
       LIMIT ?`,
      [limit],
    );

    const rows = results.rows;
    const topProducts: ProductStat[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      topProducts.push({
        id: Number(row.id),
        name: row.name,
        sold: toNumber(row.sold),
        revenue: toNumber(row.revenue),
      });
    }
    return topProducts;
  } catch (error) {
    console.error('❌ Error fetching top products:', error);
    return [];
  }
};

export const fetchCategoryPerformance = async (): Promise<
  CategoryPerformance[]
> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT c.name, COUNT(DISTINCT oi.orderId) as orders,
              IFNULL(SUM(oi.price * oi.quantity), 0) as revenue
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       JOIN categories c ON p.categoryId = c.id
       GROUP BY c.id
       ORDER BY revenue DESC`,
    );

    const rows = results.rows;
    const stats: CategoryPerformance[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      stats.push({
        name: row.name,
        orders: toNumber(row.orders),
        revenue: toNumber(row.revenue),
      });
    }
    return stats;
  } catch (error) {
    console.error('❌ Error fetching category performance:', error);
    return [];
  }
};

export const fetchUsersWithStats = async (): Promise<UserWithStats[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT u.*, COUNT(o.id) as orderCount,
              IFNULL(SUM(o.totalPrice), 0) as totalRevenue,
              MAX(o.createdAt) as lastOrderAt
       FROM users u
       LEFT JOIN orders o ON o.userId = u.id
       GROUP BY u.id
       ORDER BY lastOrderAt DESC, u.id DESC`,
    );

    const rows = results.rows;
    const users: UserWithStats[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      users.push({
        id: row.id,
        username: row.username,
        password: row.password,
        role: row.role,
        orderCount: toNumber(row.orderCount),
        totalRevenue: toNumber(row.totalRevenue),
        lastOrderAt: row.lastOrderAt ?? null,
      });
    }

    return users;
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return [];
  }
};

export const fetchOrdersWithUsers = async (
  userId?: number,
): Promise<OrderWithUser[]> => {
  try {
    const db = await getDb();
    const params: (number | string)[] = [];
    const whereClause = userId ? 'WHERE o.userId = ?' : '';
    if (userId) {
      params.push(userId);
    }

    const [results] = await db.executeSql(
      `SELECT o.id, o.orderId, o.userId, o.totalPrice, o.itemCount, o.status, o.createdAt,
              u.username
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ${whereClause}
       ORDER BY o.createdAt DESC`,
      params,
    );

    const rows = results.rows;
    const orders: OrderWithUser[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      orders.push({
        id: row.id,
        orderId: row.orderId,
        userId: row.userId,
        username: row.username ?? null,
        totalPrice: toNumber(row.totalPrice),
        itemCount: toNumber(row.itemCount),
        status: row.status,
        createdAt: row.createdAt,
      });
    }

    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders with users:', error);
    return [];
  }
};

// ==================== ANALYTICS FUNCTIONS ====================
export const updateAnalytics = async (
  orderId: number,
  totalPrice: number,
  userId: number,
) => {
  try {
    const db = await getDb();
    const dateKey = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    // Update analytics for the day
    await db.executeSql(
      `INSERT INTO analytics (date, totalRevenue, totalOrders, updatedAt)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(date) DO UPDATE SET
       totalRevenue = totalRevenue + ?,
       totalOrders = totalOrders + 1,
       updatedAt = ?`,
      [dateKey, totalPrice, now, totalPrice, now],
    );

    console.log('✅ Analytics updated');
  } catch (error) {
    console.error('❌ Error updating analytics:', error);
  }
};

export const updateProductStats = async (
  productId: number,
  quantity: number,
  price: number,
) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const totalRevenue = quantity * price;

    await db.executeSql(
      `INSERT INTO product_stats (productId, soldCount, totalRevenue, updatedAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(productId) DO UPDATE SET
       soldCount = soldCount + ?,
       totalRevenue = totalRevenue + ?,
       updatedAt = ?`,
      [productId, quantity, totalRevenue, now, quantity, totalRevenue, now],
    );

    console.log('✅ Product stats updated');
  } catch (error) {
    console.error('❌ Error updating product stats:', error);
  }
};

export const getAnalyticsData = async () => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    // Get today's analytics
    const [todayResult] = await db.executeSql(
      `SELECT totalRevenue, totalOrders FROM analytics WHERE date = ?`,
      [today],
    );
    const todayData =
      todayResult.rows.length > 0
        ? todayResult.rows.item(0)
        : { totalRevenue: 0, totalOrders: 0 };

    // Get this month's analytics
    const monthStart = today.slice(0, 7) + '-01';
    const [monthResult] = await db.executeSql(
      `SELECT SUM(totalRevenue) as totalRevenue, SUM(totalOrders) as totalOrders FROM analytics WHERE date >= ?`,
      [monthStart],
    );
    const monthData = monthResult.rows.item(0);

    // Get all time analytics
    const [allTimeResult] = await db.executeSql(
      `SELECT SUM(totalRevenue) as totalRevenue, SUM(totalOrders) as totalOrders FROM analytics`,
    );
    const allTimeData = allTimeResult.rows.item(0);

    // Get total customers
    const [customersResult] = await db.executeSql(
      `SELECT COUNT(DISTINCT userId) as totalCustomers FROM orders`,
    );
    const totalCustomers = customersResult.rows.item(0)?.totalCustomers ?? 0;

    return {
      today: {
        revenue: parseFloat(todayData.totalRevenue) || 0,
        orders: todayData.totalOrders || 0,
      },
      month: {
        revenue: parseFloat(monthData.totalRevenue) || 0,
        orders: parseFloat(monthData.totalOrders) || 0,
      },
      allTime: {
        revenue: parseFloat(allTimeData.totalRevenue) || 0,
        orders: parseFloat(allTimeData.totalOrders) || 0,
      },
      totalCustomers: parseInt(totalCustomers),
    };
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return {
      today: { revenue: 0, orders: 0 },
      month: { revenue: 0, orders: 0 },
      allTime: { revenue: 0, orders: 0 },
      totalCustomers: 0,
    };
  }
};

export const getProductStats = async () => {
  try {
    const db = await getDb();

    const [result] = await db.executeSql(
      `SELECT p.id, p.name, ps.soldCount, ps.totalRevenue
       FROM product_stats ps
       LEFT JOIN products p ON ps.productId = p.id
       ORDER BY ps.soldCount DESC
       LIMIT 10`,
    );

    const stats = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      stats.push({
        id: row.id,
        name: row.name,
        sold: row.soldCount || 0,
        revenue: row.totalRevenue || 0,
      });
    }

    return stats;
  } catch (error) {
    console.error('❌ Error fetching product stats:', error);
    return [];
  }
};

export const getCategoryStats = async () => {
  try {
    const db = await getDb();

    const [result] = await db.executeSql(
      `SELECT c.id, c.name, COUNT(oi.id) as orders, SUM(oi.quantity * oi.price) as revenue
       FROM categories c
       LEFT JOIN products p ON c.id = p.categoryId
       LEFT JOIN order_items oi ON p.id = oi.productId
       GROUP BY c.id, c.name
       ORDER BY orders DESC`,
    );

    const stats = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      stats.push({
        id: row.id,
        name: row.name,
        orders: row.orders || 0,
        revenue: row.revenue || 0,
      });
    }

    return stats;
  } catch (error) {
    console.error('❌ Error fetching category stats:', error);
    return [];
  }
};
