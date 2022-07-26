const TelegramBot = require('node-telegram-bot-api');
const Secrets = require('../../config/secrets.js')
const schedule = require('node-schedule');
const { Agendamento, Paciente, Esf, Avaliacao } = require('../../app/models');
const moment = require('moment');
const { Op } = require('sequelize');
const client = require('twilio')(Secrets.whatsapp.accountSid, Secrets.whatsapp.authToken);
const bot = new TelegramBot(Secrets.telegran.token, {polling: false});
moment.locale('pt-br');

schedule.scheduleJob('0 8/8 * * *', async () => {
  const data_final = moment(new Date()).add(2, 'd').format('YYYY/MM/DD');
  const data_inicial = moment(new Date()).format('YYYY/MM/DD');

  var agendamentos = await Agendamento.findAll({
    include: [
        { model: Paciente, as: 'paciente', 
            include: {
                model: Esf, as: 'esf'  
            } 
        }
    ],
    where: {
      data_agendamento: {
        [Op.between] : [data_inicial, data_final]
      },
    },
  });

  agendamentos.forEach(agenda => {
    let paciente = agenda.paciente
    const msg = `Olá, ${paciente.name}, seu exame está chegando perto, ele está agendado para ${moment(agenda.data_agendamento).format('LLL')} na ${paciente.esf.name}. \n\n Aguardamos sua presença 😘`; 

    if (paciente.telegran_id){
      bot.sendMessage(paciente.telegran_id, msg);
    }
    
    if (paciente.whatsapp_id){
      client.messages.create({from: Secrets.whatsapp.from, body: msg, to: `whatsapp:${paciente.whatsapp_id}`})
    }
  });

});

schedule.scheduleJob('0 8/8 * * *', async () => {
  
  var pacientes = await Paciente.findAll({});

  pacientes.forEach(inatividade => {
    let time;
    let paciente = inatividade.paciente;
    
    function setMensagem(){
     const msg = `Como faz um tempinho que não se falamos, esse atendimento será finalizado! \n\n Obrigado pelo seu contato ${paciente.name} 😃👍🏻 {topic=random}`;
     if (paciente.telegran_id){
        bot.sendMessage(paciente.telegran_id, msg);
     } 
     if (paciente.whatsapp_id){
         client.messages.create({from: Secrets.whatsapp.from, body: msg, to: `whatsapp:${paciente.whatsapp_id}`})
     }
    }
 
    function resetTimer() {
     clearTimeout(time);
     time = setTimeout(setMensagem, 5000)
    }
 
    return resetTimer();
 
   })

})

