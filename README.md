# HostYourCreeper NginX Worker

## Installation

npm install
npm start

## Configuration

npm config set hyc-nw:amqp_host "localhost"
npm config set hyc-nw:amqp_user "myuser"
npm config set hyc-nw:amqp_pass "mypass"
npm config set hyc-nw:amqp_vhost "/myapp"
npm config set hyc-nw:amqp_cons_queue "myapp-cons"
npm config set hyc-nw:amqp_prod_queue "myapp-cons"

## Format des messages

### Installation

message {
  command : 'create',
  vm_number : 11,
  domain: sub.hycpr.net
}

### Delete

message {
  command : 'delete',
  vm_number : 11
}
