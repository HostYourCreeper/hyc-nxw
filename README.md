# HostYourCreeper NginX Worker

## Install

```
npm install
npm start
```

## Configuration

```
npm config set hyc-nxw:amqp_host "localhost"
npm config set hyc-nxw:amqp_user "myuser"
npm config set hyc-nxw:amqp_pass "mypass"
npm config set hyc-nxw:amqp_vhost "/myapp"
npm config set hyc-nxw:amqp_cons_queue "myapp-cons"
npm config set hyc-nxw:amqp_prod_queue "myapp-cons"
```

## Messages formatting

### Install

```
{
  command : 'create',
  vm_number : 11,
  domain: sub.hycpr.net
}
```

### Delete

```
{
  command : 'delete',
  vm_number : 11
}
```

