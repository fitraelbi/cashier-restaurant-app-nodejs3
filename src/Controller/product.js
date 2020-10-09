const Sequelize = require('sequelize')

const { Product, Category } = require('../Config/module/model')
const respon = require('../Helper/respon')
const { productSchema } = require('../Helper/validation_schema')
const createError = require('http-errors')
const { client } = require('../Helper/redis')

const controller = {}

controller.getAll = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['id', 'name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: [['name', 'nama']]
      }
    }).catch(e => console.log('Error: ', e.message))
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAll', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data)).status("ok")
    }
  } catch (error) {
    res.send(error.message)
    
  }
}

controller.add = async (req, res, next) => {
  try {
    const body = req.body
    
    const data = {
      name: body.name,
      price: body.price,
      category: body.category,
      image: body.image
    }

    const result = await productSchema.validateAsync(body)
    const doesExist = await Product.findOne({ where: { name: result.name } })
    if (doesExist) throw await createError.Conflict(`${result.name} is already been there`)

    const name = result.name
    const price = result.price
    const category = result.category
    const image = result.image

    let categoryId = 0

    category === 'food' ? categoryId = 3 : category === 'cake' ? categoryId = 2 : category === 'drink' ? categoryId = 1 : null

    const update = await Product.create({ name: name, price: price, image: image, categoryId: categoryId }).catch(function (err) {
      console.log(err)
    });

    const findCategory = await Category.findOne({ where: { name: category } })

    const updateInCategory = await update.setCategory(findCategory)

    client.flushdb()

    return res.send(updateInCategory)
  } catch (error) {
    error.isJoi === true ? error.status = 422 : null
    next(error)
  }
}

controller.update = async (req, res, next) => {
  try {
    const result = req.body
    console.log(result)
    //const result = await productSchema.validateAsync(body)
    const doesExist = await Product.findOne({ where: { name: result.name } })
    if (doesExist) throw await createError.Conflict('Not Found')

    const id = result.id
    const name = result.name
    const price = result.price
    const category = result.category
    const image = result.image

    let categoryId = 0
    category === 'food' ? categoryId = 3 : category === 'cake' ? categoryId = 2 : category === 'drink' ? categoryId = 1 : null
    const saved = await Product.update({
      name: name,
      price: price,
      image: image,
      categoryId: categoryId
    }, { where: { id: id } }).success(result =>
      console.log(result)
    )
    .error(err =>
      console.log(err)
    )

    client.flushdb()
    return res.send(saved)
  } catch (error) {
    res.send(error)
  }
}

controller.delete = async function (req, res) {
  try {
    const name = req
    //const doesExist = await Product.findOne({ where: { name: name } })
    //if (!doesExist) throw await createError.Conflict(`${result.name} isn't there`)
    console.log(name)
    const data = await Product.destroy({ where: { name: name } })
    client.flushdb()
    res.send(respon(res, 200, data))
  } catch (error) {
    res.send(error)
  }
}

controller.search = async function (req, res) {
  try {
    const name = req.body.name
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      where: {
        name:
        { [Sequelize.Op.iLike]: `%${name}%` }
      }
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else res.send(respon(res, 200, data))
  } catch (error) {
    res.send(error.message)
  }
}

controller.orderbyname = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      order: [['name', 'ASC']]
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAllName', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data))
    }
  } catch (error) {
    res.send(error.message)
  }
}

controller.orderbycategory = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      order: [['categoryId', 'ASC']]
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAllcategory', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data))
    }
  } catch (error) {
    res.send(error.message)
  }
}

controller.orderbynew = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      order: [['id', 'DESC']]
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAllnew', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data))
    }
  } catch (error) {
    res.send(error.message)
  }
}

controller.orderbypricelow = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      order: [['price', 'ASC']]
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAllpricelow', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data))
    }
  } catch (error) {
    res.send(error.message)
  }
}

controller.orderbypricehigh = async function (req, res) {
  try {
    const data = await Product.findAll({
      raw: true,
      attributes: ['name', 'price', 'image'],
      include: {
        model: Category,
        as: 'category',
        required: true,
        attributes: ['name']
      },
      order: [['price', 'DESC']]
    })
    if (data.length === 0) { res.send(respon(res, 203, data)) } else {
      client.setex('getAllpricehigh', 3600, JSON.stringify(data))
      res.send(respon(res, 200, data))
    }
  } catch (error) {
    res.send(error.message)
  }
}

module.exports = controller
