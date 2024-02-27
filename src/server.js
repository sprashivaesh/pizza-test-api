const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Pizza, User } = require('./sequelize');
const jwt = require('jsonwebtoken');
const {initializeDatabase} = require('./dbInitialize');

const app = express();
const port = 5000;

// Middleware для разбора JSON тела запроса
app.use(bodyParser.json());

// Middleware для проверки авторизации
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Роут для получения списка доступных пицц
app.get('/api/pizzas', authenticateToken, async (req, res) => {
  try {
    const pizzas = await Pizza.findAll();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения списка пицц из базы данных' });
  }
});

// Роут для получения отдельной пиццы по ID
app.get('/api/pizzas/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const pizza = await Pizza.findByPk(id);
    if (pizza) {
      res.json(pizza);
    } else {
      res.status(404).json({ message: 'Пицца не найдена' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения информации о пицце из базы данных' });
  }
});

//Обновление пиццы по ID
app.put('/api/pizzas/:id', async (req, res) => {
  const pizzaId = req.params.id;
  const { name, description } = req.body;
  try {
    const updatedPizza = await Pizza.findByPk(pizzaId);
    if (!updatedPizza) {
      res.status(404).json({ message: 'Пицца с указанным ID не найдена' });
    } else {
      updatedPizza.name = name;
      updatedPizza.description = description;
      await updatedPizza.save();
      res.json({ message: 'Пицца успешно обновлена', pizza: updatedPizza });
    }
  } catch (error) {
    console.error('Ошибка при обновлении информации о пицце в базе данных:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Удаление пиццы по ID
app.delete('/api/pizzas/:id', async (req, res) => {
  const pizzaId = req.params.id;
  try {
    const deletedCount = await Pizza.destroy({ where: { id: pizzaId } });
    if (deletedCount === 0) {
      res.status(404).json({ message: 'Пицца с указанным ID не найдена' });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error('Ошибка при удалении пиццы из базы данных:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Роут для добавления новой пиццы (требуется авторизация)
app.post('/api/pizzas', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const pizza = await Pizza.create({ name, description });
    res.json({ message: 'Пицца успешно добавлена', pizza });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка добавления пиццы в базу данных' });
  }
});


// Роут для аутентификации пользователя и выдачи токена
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (user) {
      const accessToken = jwt.sign({ username: user.username, role: user.role }, 'secret_key');
      res.json({ accessToken });
    } else {
      res.status(401).json({ message: 'Ошибка аутентификации: неверные учетные данные' });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Ошибка аутентификации' });
  }
});

// Вызов функции инициализации базы данных
initializeDatabase().then(() => {
  // Запуск сервера
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
});
