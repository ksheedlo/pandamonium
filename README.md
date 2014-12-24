pandamonium
===========

![](http://e226c44521bc93014891-95071af5d2ef5fa7fb6048ccd0393c38.r12.cf1.rackcdn.com/panda-licking-chops.gif)

The panda-themed psuedomonitoring tool. Allows you to random entities, checks,
alarms, notification plans and suppressions in Rackspace Cloud Monitoring.

## Installation

The best way to install pandamonium is with NPM.

```
$ npm install -g pandamonium
```

## Supported commands

Pandamonium exposes all commands through a single binary, `pm`. For NPM installs
this will be under your NPM prefix. When developing Pandamonium, you can find the
binary at `./bin/pm` from the root of the repo.

All pandamonium commands take the following form:

```
$ pm [TYPE] create [OPTIONS]
```

Pandamonium can be used to create, but not to destroy. This is important because
you can quickly overrun your account's Cloud Monitoring limits for entities, checks
or alarms. To view, edit and delete the resources that Pandamonium provisions, go
to the UI at [Rackspace Cloud Intelligence](https://intelligence.rackspace.com) or
roll your own API client.

### Entities

### Checks

### Alarms

### Notifications

### Notification plans

### Suppressions

## Configuration

## Contributing

## License
