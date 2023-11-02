const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products with associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category },{ model: Tag, through: ProductTag, as: 'tags' }]
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one product by its `id` with associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category },{ model: Tag, through: ProductTag, as: 'tags' }]
    });
    if (!productData) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body, {
      include: [Tag], // Include associated Tags
   });


    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
      const productWithTags = await Product.findByPk(newProduct.id, {
        include: [
          {
            model: Category,
          },
          {
            model: Tag,
            through: ProductTag,
          },
        ],
      });
      res.status(201).json(productWithTags);
    } else {
      res.status(201).json(newProduct);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update a product by its `id` value
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagsToRemove = await ProductTag.findAll({
        where: {
          product_id: productId,
          tag_id: { [Op.notIn]: req.body.tagIds },
        },
      });
      await ProductTag.destroy({ where: { id: productTagsToRemove.map((item) => item.id) } });
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: productId,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    const updatedProductWithTags = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });
    res.status(200).json(updatedProductWithTags);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.destroy({
      where: {
        id: productId,
      },
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
