const { sequelize, Pizza, User } = require('./sequelize');

async function initializeDatabase() {
  try {
    // Синхронизация моделей с базой данных
    await sequelize.sync({ force: true });

    // Создание пользователя
    const user = await User.create({
      username: 'admin',
      password: 'password',
      role: 'admin'
    });
    // console.log('Пользователь создан:', user.toJSON());
    const pizzasData = [
      { name: 'Пепперони', description: 'Пицца с пикантной пепперони и сыром' },
      { name: 'Гавайская', description: 'Пицца с ветчиной, ананасами и сыром' },
      { name: 'Маргарита', description: 'Классическая пицца с помидорами и базиликом' },
      { name: 'Четыре сыра', description: 'Пицца с сочетанием четырех различных сыров' },
      { name: 'Вегетарианская', description: 'Пицца с ассорти свежих овощей и сыра' },
      { name: 'Барбекю', description: 'Пицца с маринованным куриным мясом и соусом барбекю' },
      { name: 'Мексиканская', description: 'Пицца с фасолью, маринованными перцами и острым соусом' }
    ];

    // Создание пицц
    const pizzas = await Pizza.bulkCreate(pizzasData);
    // console.log('Пиццы созданы:', pizzas.map(pizza => pizza.toJSON()));
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
  } finally {
    // Закрытие соединения с базой данных
    // await sequelize.close();
  }
}


module.exports = { initializeDatabase };
