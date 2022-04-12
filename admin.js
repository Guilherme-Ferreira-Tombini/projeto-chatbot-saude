const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSSequelize = require('@adminjs/sequelize')
var bcrypt = require('bcryptjs');
AdminJS.registerAdapter(AdminJSSequelize)

const { Usuario, Esf, Paciente, Informacao, Agendamento_consultas  } = require('./app/models/');

const adminJs = new AdminJS({
  databases: [], 
  resources: [Usuario, Esf, Paciente, Informacao, Agendamento_consultas ],
  rootPath: '/admin',
})

module.exports = adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    const usuario = await Usuario.findOne({ email })
    if (usuario) {
      const matched = await bcrypt.compare(password, usuario.password)
      if (matched) {
        return usuario
      }
    }
    return false
  },
  cookieName: 'adminjs',
  cookiePassword: 'some-secret-password-used-to-secure-cookie',
})