const db = require('../config/db');

// GET /api/products
// Optional query params: search, category, mine
async function getProducts(req, res) {
  try {
    const { search, category, mine } = req.query;
    const currentUserId = req.user.id;

    let query = `
      SELECT 
        p.id, 
        p.user_id, 
        p.name, 
        p.description, 
        p.price, 
        p.category, 
        p.stock, 
        p.created_at, 
        p.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM products p
      INNER JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (mine === 'true') {
      query += ' AND p.user_id = ?';
      params.push(currentUserId);
    }

    if (category && category !== 'All') {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await db.query(query, params);

    // Add is_owner flag
    const formatted = products.map((item) => ({
      ...item,
      price: parseFloat(item.price),
      is_owner: item.user_id === currentUserId
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const [rows] = await db.query(
      `SELECT 
        p.id, 
        p.user_id, 
        p.name, 
        p.description, 
        p.price, 
        p.category, 
        p.stock, 
        p.created_at, 
        p.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM products p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];
    return res.json({
      success: true,
      data: {
        ...product,
        price: parseFloat(product.price),
        is_owner: product.user_id === currentUserId
      }
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product' });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { name, description, price, category, stock } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative price is required' });
    }

    const cleanName = name.trim();
    const cleanDesc = description ? description.trim() : '';
    const cleanPrice = parseFloat(price);
    const cleanCategory = category && category.trim() ? category.trim() : 'General';
    const cleanStock = stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, parseInt(stock, 10)) : 0;

    const [result] = await db.query(
      `INSERT INTO products (user_id, name, description, price, category, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, cleanName, cleanDesc, cleanPrice, cleanCategory, cleanStock]
    );

    const newProduct = {
      id: result.insertId,
      user_id: userId,
      name: cleanName,
      description: cleanDesc,
      price: cleanPrice,
      category: cleanCategory,
      stock: cleanStock,
      user_name: req.user.name,
      is_owner: true
    };

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const { name, description, price, category, stock } = req.body;

    // Check if product exists
    const [existing] = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = existing[0];

    // Authorization: only the creator can update
    if (product.user_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only update products you created.'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative price is required' });
    }

    const cleanName = name.trim();
    const cleanDesc = description !== undefined ? description.trim() : product.description;
    const cleanPrice = parseFloat(price);
    const cleanCategory = category && category.trim() ? category.trim() : product.category;
    const cleanStock = stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, parseInt(stock, 10)) : product.stock;

    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, stock = ?
       WHERE id = ?`,
      [cleanName, cleanDesc, cleanPrice, cleanCategory, cleanStock, id]
    );

    const [updated] = await db.query(
      `SELECT p.*, u.name AS user_name 
       FROM products p 
       INNER JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...updated[0],
        price: parseFloat(updated[0].price),
        is_owner: true
      }
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Check if product exists
    const [existing] = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = existing[0];

    // Authorization: only the creator can delete
    if (product.user_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete products you created.'
      });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Product deleted successfully',
      deletedId: Number(id)
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
