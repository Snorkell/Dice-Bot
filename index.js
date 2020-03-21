const {Client, MessageEmbed} = require('discord.js');
const { config } = require('dotenv');

const client = new Client({
  disableEveryone:true
})

config({
    path: __dirname + '/.env'
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    status: "online",
    game:{
      name:"Roll your dice",
      type:"WATCHING"
    }
  })
});

client.on('message',async message => {
  const prefix = "/";
  if(message.author.bot) return;
  if(!message.guild) return;
  if(!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if(cmd === "roll"){
    if(args.length){
      let modifier = {
        sign:"add",
        value:0
      };
      const mod = args.filter(e=> e.startsWith("+") || e.startsWith("-"))[0]
      if(mod){
        const modSign = mod.split('')[0] === "+" ? "add": "minus";
        modifier = {
          sign : modSign,
          value: mod.substring(1)
        }
      }
      const dices = args.filter(e => e.toLowerCase().indexOf("d") !=-1).map(arg => {
        const dice = arg.toLowerCase().split('d').map(d=> parseInt(d));
        return dice;
      })
      let values= [];
      let fields = dices.map(d=>{
        let diceValue = getDicesValues(d[0], d[1]);
        values.push(diceValue);
        return {name: `${d[0]}D${d[1]}`, value : `Résultat: (${diceValue.string}) \n Total: ${getTotal(diceValue.number, modifier)}`, inline: true};
      })
      let embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle(`🎲 ${message.author.username} à lancé  ${dices.length} dés 🎲`)
        .setDescription("Dés: "+args.filter(e => e.toLowerCase().indexOf("d") !=-1).map(e=> e.toUpperCase()).join(', '))
        .setThumbnail('https://cdn.pixabay.com/photo/2017/08/31/04/01/d20-2699387_960_720.png')
        .addFields(
          fields
        )
        .addField('Mod', mod || 0)
        .addField('Total', getTotal(values.map(v=>v.total),modifier))
        .setTimestamp()
        .setFooter('Made by Sam');

      message.channel.send(embed);
    }else{
      message.channel.send(`🎲 Rolling 1D6  : ${Math.floor(Math.random()*6)+1}`);
    }
  }

  if(cmd === "help"){
    let embed = new MessageEmbed()
        .setColor('#0000bb')
        .setTitle(`Help commande`)
        .setDescription("Liste des commandes")
        .setThumbnail('https://cdn.pixabay.com/photo/2017/08/31/04/01/d20-2699387_960_720.png')
        .addField('/roll', "/roll [n]d[n] ... <modifier> \n Exemples:\n /roll \n /roll 1d6 \n /roll 3d8 2d4 \n /roll 2d30 1d4 +5 \n /roll 1d12 2d4 -2")
        .setTimestamp()
        .setFooter('Made by Sam');
    message.channel.send(embed);
  }
  message.delete()
});

client.login(process.env.Token);


const getDicesValues = (nbr, dice) =>{
  let dices = [];
  let total = 0;
  for (let index = 0; index < nbr; index++) {
    let number = Math.floor(Math.random()*dice)+1;
    total += number;
    dices.push(number);
  }
  return {
    string: dices.join(' + '),
    number: dices,
    total
  }

}

const getTotal = (array, modifier) => {
  let total = 0;
  array.forEach(number => {
    total += number;
  });
  if(modifier.sign === "add") return parseInt(total)+parseInt(modifier.value);
  else if(parseInt(total) - parseInt(modifier.value) < 0) return 0;
  else return parseInt(total) - parseInt(modifier.value);
}
