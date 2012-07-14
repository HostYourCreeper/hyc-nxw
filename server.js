var spawn = require('child_process').spawn,
    fs = require('fs'),
    amqp = require('amqp');

function date() {
  var _date = new Date();
  return _date.getDate() + "/" + (_date.getMonth()+1) + "/" + _date.getFullYear() + " " + _date.getHours() + ":" + _date.getMinutes();
}

function trim (str) {
    str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}

var connection = amqp.createConnection({ 
    host: process.env.npm_package_config_amqp_host,
    login : process.env.npm_package_config_amqp_user,
    password: process.env.npm_package_config_amqp_pass,
    vhost: process.env.npm_package_config_amqp_vhost
});
// Wait for connection to become established.
connection.on('ready', function () {
  connection.queue(process.env.npm_package_config_amqp_cons_queue, 
    {durable: true, autoDelete: false},
    function(q){
        console.log('queue '+process.env.npm_package_config_amqp_cons_queue+' connected');
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe(function (message) {
          console.log(JSON.parse(message.data));
        // Print messages to stdout
        handle(connection,JSON.parse(message.data));
      });
      q.on('error', function(err) { console.log(err); });
  });
  
  connection.queue(process.env.npm_package_config_amqp_prod_queue, 
    {durable: true, autoDelete: false},
    function(q){
        console.log('queue '+process.env.npm_package_config_amqp_prod_queue+' connected');
        q.on('error', function(err) { console.log(err); });
  });
});
connection.on('error',function(err) {
    console.log(err);
});

var handle = function(c, message) {
    console.log('['+ date() + '] Command received : '+ message.command);
    switch(message.command) {
      case 'create':
        create_vhost(message,c);
        break;
      case 'delete':
        delete_vhost(message,c);
        break;
      default:
        console.log('['+date()+'] stderr : Unknown command ' + message.command); 
        break;
    }
};

function error(cmd)
{
  cmd.stderr.on('data',function (data) {
    console.log('['+date()+'] stderr : '+data);
  });
}

var create_vhost = function(data,c)
{
    if(!data.vm_number || !data.domain)
        console.log('['+date()+'] Invalid param');
    else
    {
        var file = "server {\n"+
        "  listen 80;\n"+
        "  server_name "+data.domain+" *."+data.domain+";\n"+
        "  access_log /var/log/nginx/access.server0"+data.vm_number+".log;\n"+
        "  location / {\n"+
        "    proxy_pass http://10.10.10."+data.vm_number+";\n"+
        "    proxy_set_header Host $host;\n"+
        "  }\n"+
        "}";
        fs.writeFile("/etc/nginx/sites-enabled/vm"+data.vm_number+".conf", file, function (err) {
          if (err) console.log('['+date()+'] stderr : '+err);
          var cmd = spawn('/etc/init.d/nginx', ['reload']);
          error(cmd);
        });
    }
};

var delete_vhost = function(data,c)
{
    if(!data.vm_number)
        console.log('['+date()+'] Invalid param');
    else
    {
        var cmd = spawn('rm',["/etc/nginx/sites-enabled/vm"+data.vm_number+".conf" ]);
        error(cmd);
        cmd.on('exit', function() {
            cmd = spawn('/etc/init.d/nginx', ['reload']);
            error(cmd);
        });
    }
};
