const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT;

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
